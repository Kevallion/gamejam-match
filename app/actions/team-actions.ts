"use server"

import { createAdminClient, getUserEmail } from "@/lib/supabase/admin"
import { sendEmailWithLayout } from "@/lib/mail"
import { sendPushToUser } from "@/lib/push"
import {
  getPublicDashboardUrl,
  getPublicInvitationUrl,
  getPublicJammerProfileUrl,
  getPublicSiteUrl,
} from "@/lib/site-url"
import type { GamificationRewardSummary } from "@/lib/gamification-reward-types"
import { gamificationRewardHasToast } from "@/lib/gamification-reward-types"
import { formatBadgeLabel } from "@/lib/gamification-toast-labels"
import { NOTIFICATION_TYPE_GAMIFICATION_SQUAD_COMPLETE } from "@/lib/notification-constants"
import { publicJammerName } from "@/lib/public-display-name"

const SITE_URL = getPublicSiteUrl()
const DASHBOARD_URL = getPublicDashboardUrl()

const EMAIL_P =
  "margin:0 0 14px;color:#4b5563;font-size:16px;line-height:1.65;"
const EMAIL_LINK = "color:#14b8a6;text-decoration:underline;font-weight:600;"
const EMAIL_SIGNOFF =
  "margin:0;color:#9ca3af;font-size:14px;line-height:1.5;"
const EMAIL_STRONG = "color:#1f2937;font-weight:700;"

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/* Smart Match e-mails : `lib/smart-match-new-team-email.ts` */

type NotificationInsertExtras = {
  sender_id?: string | null
  team_id?: string | null
  join_request_id?: string | null
}

const DEDUPED_NOTIFICATION_TYPES = new Set([
  "player_joined",
  "application_accepted",
  "invitation_declined",
  "application_received",
  "member_left",
])

async function resolvePublicJammerName(
  userId: string | null | undefined,
  hint?: string | null,
): Promise<string> {
  let fromProfile: string | null = null
  if (userId) {
    try {
      const admin = createAdminClient()
      const { data } = await admin.from("profiles").select("username").eq("id", userId).maybeSingle()
      fromProfile = (data?.username as string | null | undefined) ?? null
    } catch {
      fromProfile = null
    }
  }
  return publicJammerName([fromProfile, hint])
}

async function insertNotification(
  userId: string,
  type: string,
  message: string,
  link?: string | null,
  extras?: NotificationInsertExtras,
) {
  try {
    const admin = createAdminClient()
    const senderId = extras?.sender_id ?? null
    const teamId = extras?.team_id ?? null
    const joinRequestId = extras?.join_request_id ?? null

    if (DEDUPED_NOTIFICATION_TYPES.has(type) && (teamId || joinRequestId)) {
      const since = new Date(Date.now() - 3 * 60 * 1000).toISOString()
      let query = admin
        .from("notifications")
        .select("id, sender_id, join_request_id")
        .eq("user_id", userId)
        .eq("type", type)
        .gte("created_at", since)
      if (teamId) query = query.eq("team_id", teamId)
      const { data: existing } = await query
      const matches = (existing ?? []).filter((row) => {
        if (joinRequestId && row.join_request_id && row.join_request_id !== joinRequestId) return false
        if (senderId && row.sender_id && row.sender_id !== senderId) return false
        return true
      })
      if (matches.length > 0) {
        const [keep, ...rest] = matches
        await admin
          .from("notifications")
          .update({
            message,
            link: link ?? null,
            sender_id: senderId ?? keep.sender_id,
            team_id: teamId,
            join_request_id: joinRequestId ?? keep.join_request_id,
          })
          .eq("id", keep.id)
        if (rest.length > 0) {
          await admin.from("notifications").delete().in(
            "id",
            rest.map((row) => row.id as string),
          )
        }
        return
      }
    }

    const { error } = await admin.from("notifications").insert({
      user_id: userId,
      type,
      message,
      link: link ?? null,
      sender_id: senderId,
      team_id: teamId,
      join_request_id: joinRequestId,
    })
    if (error?.code === "23505") {
      let repair = admin.from("notifications").update({ message, link: link ?? null }).eq("user_id", userId).eq("type", type)
      if (teamId) repair = repair.eq("team_id", teamId)
      if (senderId) repair = repair.eq("sender_id", senderId)
      await repair
      return
    }
    void sendPushToUser(userId, "GameJamCrew", message, link ?? null)
  } catch {
    // Silent error: notifications should never break the main UX
  }
}

/**
 * Marque comme lues les notifications liées à une demande (acceptation / refus).
 * Appel côté serveur (service role).
 */
export async function markNotificationsReadForJoinRequest(joinRequestId: string): Promise<void> {
  try {
    const admin = createAdminClient()
    await admin
      .from("notifications")
      .update({ is_read: true })
      .eq("join_request_id", joinRequestId)
  } catch {
    /* best-effort */
  }
}

function buildSquadCompleteRewardSummaryLine(reward: GamificationRewardSummary): string {
  const parts: string[] = []
  if (reward.xpGained > 0) parts.push(`+${reward.xpGained} XP`)
  if (reward.levelUp && reward.newLevel != null) parts.push(`Level ${reward.newLevel}`)
  const badges = reward.newBadges?.length ? reward.newBadges : reward.newBadge ? [reward.newBadge] : []
  for (const b of badges) parts.push(formatBadgeLabel(b))
  const titles = reward.newTitles?.length ? reward.newTitles : reward.newTitle ? [reward.newTitle] : []
  for (const t of titles) parts.push(t)
  return parts.join(" · ")
}

export async function notifyOwnerSquadRosterComplete(
  ownerUserId: string,
  reward?: GamificationRewardSummary | null,
): Promise<void> {
  try {
    const message =
      reward && gamificationRewardHasToast(reward)
        ? `Your squad listing is complete! ${buildSquadCompleteRewardSummaryLine(reward)}`
        : "Your squad listing is now full — every open role slot is filled."
    await insertNotification(
      ownerUserId,
      NOTIFICATION_TYPE_GAMIFICATION_SQUAD_COMPLETE,
      message,
      "/dashboard?tab=achievements",
    )
  } catch {
    /* best-effort */
  }
}

export type NotifyApplicationContext = {
  candidateUserId: string
  teamId: string
  joinRequestId: string
}

/**
 * Sends an email notification to the team owner when a new applicant applies
 * and creates an in-app notification for them.
 */
export async function notifyOwnerNewApplication(
  ownerUserId: string,
  candidateName: string,
  teamName: string,
  ctx?: NotifyApplicationContext | null,
): Promise<void> {
  try {
    const email = await getUserEmail(ownerUserId)

    const inboxLink = ctx
      ? `/dashboard?tab=inbox&highlightRequest=${ctx.joinRequestId}`
      : "/dashboard?tab=inbox"
    const safeName = await resolvePublicJammerName(ctx?.candidateUserId, candidateName)
    const message = `${safeName} applied to your squad "${teamName}".`
    void insertNotification(ownerUserId, "application_received", message, inboxLink, {
      sender_id: ctx?.candidateUserId ?? null,
      team_id: ctx?.teamId ?? null,
      join_request_id: ctx?.joinRequestId ?? null,
    })

    if (!email) return

    const reviewUrl = ctx
      ? `${SITE_URL}/dashboard?tab=inbox&highlightRequest=${ctx.joinRequestId}`
      : DASHBOARD_URL
    const profileUrl = ctx ? getPublicJammerProfileUrl(ctx.candidateUserId) : null
    const ctaPrimary = `display:inline-block;padding:12px 24px;background-color:#14b8a6;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:4px 8px 4px 0;`
    const ctaSecondary = `display:inline-block;padding:12px 24px;background-color:#f3f4f6;color:#111827;text-decoration:none;border-radius:6px;font-weight:600;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;border:1px solid #e5e7eb;margin:4px 8px 4px 0;`

    const subject = "New application for your squad! 🚀 | GameJamCrew"
    const profileBlock = profileUrl
      ? `<p style="margin:0 0 20px;text-align:center;">
        <a href="${profileUrl}" style="${ctaSecondary}" target="_blank" rel="noopener noreferrer">View profile</a>
      </p>`
      : ""
    const contentHtml = `
      <p style="${EMAIL_P}">Good news! <strong style="${EMAIL_STRONG}">${escapeHtml(
        safeName,
      )}</strong> applied to join <strong style="${EMAIL_STRONG}">${escapeHtml(teamName)}</strong>.</p>
      <p style="${EMAIL_P}">Review their message and respond from your inbox.</p>
      <p style="margin:0 0 24px;text-align:center;">
        <a href="${reviewUrl}" style="${ctaPrimary}" target="_blank" rel="noopener noreferrer">Open inbox</a>
      </p>
      ${profileBlock}
      <p style="${EMAIL_SIGNOFF}">— The GameJamCrew team</p>
    `

    void sendEmailWithLayout(email, subject, "New application!", contentHtml)
  } catch {
    // Silent error: don't crash the main action
  }
}

export type NotifyInvitationContext = {
  teamId: string
  joinRequestId: string
  inviterUserId: string
  /** Optional free-form message from the captain (shown in email). */
  personalMessage?: string | null
}

/**
 * Sends an email notification to a player when they are invited to join a team
 * and creates an in-app notification for them.
 */
export async function notifyInviteeInvitation(
  inviteeUserId: string,
  teamName: string,
  ctx: NotifyInvitationContext,
): Promise<void> {
  try {
    const email = await getUserEmail(inviteeUserId)

    const invitationPath = `/invitation/${ctx.joinRequestId}`
    const personalMessage = ctx.personalMessage?.trim() || ""
    const truncatedPersonal =
      personalMessage.length > 160 ? `${personalMessage.slice(0, 157)}...` : personalMessage
    const message = truncatedPersonal
      ? `You were invited to join the squad "${teamName}": ${truncatedPersonal}`
      : `You were invited to join the squad "${teamName}".`
    void insertNotification(inviteeUserId, "team_invitation", message, invitationPath, {
      sender_id: ctx.inviterUserId,
      team_id: ctx.teamId,
      join_request_id: ctx.joinRequestId,
    })

    if (!email) return

    const invitationUrl = getPublicInvitationUrl(ctx.joinRequestId)
    const captainProfileUrl = getPublicJammerProfileUrl(ctx.inviterUserId)
    const ctaPrimary = `display:inline-block;padding:12px 24px;background-color:#14b8a6;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:4px 8px 4px 0;`
    const ctaSecondary = `display:inline-block;padding:12px 24px;background-color:#f3f4f6;color:#111827;text-decoration:none;border-radius:6px;font-weight:600;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;border:1px solid #e5e7eb;margin:4px 8px 4px 0;`
    const quoteBlock = personalMessage
      ? `<p style="margin:0 0 18px;padding:12px 16px;background-color:#f9fafb;border-left:3px solid #14b8a6;color:#374151;font-size:15px;line-height:1.6;font-style:italic;">"${escapeHtml(personalMessage)}"</p>`
      : ""

    const subject = "You've been invited to join a squad! 🎮 | GameJamCrew"
    const contentHtml = `
      <p style="${EMAIL_P}">Hi there! A squad leader invited you to join <strong style="${EMAIL_STRONG}">${escapeHtml(
        teamName,
      )}</strong> for an upcoming jam.</p>
      ${quoteBlock}
      <p style="${EMAIL_P}">See the project, engine, and role on the invitation page — then accept or decline in one click.</p>
      <p style="margin:0 0 20px;text-align:center;">
        <a href="${invitationUrl}" style="${ctaPrimary}" target="_blank" rel="noopener noreferrer">View invitation</a>
      </p>
      <p style="margin:0 0 20px;text-align:center;">
        <a href="${captainProfileUrl}" style="${ctaSecondary}" target="_blank" rel="noopener noreferrer">View captain profile</a>
      </p>
      <p style="${EMAIL_P}">Happy jamming!</p>
      <p style="${EMAIL_SIGNOFF}">— The GameJamCrew team</p>
    `

    void sendEmailWithLayout(email, subject, "You're invited!", contentHtml)
  } catch {
    // Silent error: don't crash the main action
  }
}

/**
 * Sends an email notification to the candidate when their application is declined
 * and creates an in-app notification for them.
 */
export async function notifyApplicantDeclined(
  candidateUserId: string,
  teamId?: string | null,
  ownerUserId?: string | null,
  teamName?: string | null,
): Promise<void> {
  try {
    const email = await getUserEmail(candidateUserId)

    const message = teamName
      ? `Your application to join "${teamName}" was declined.`
      : "Your application was declined. New squads are waiting for you in the dashboard."
    void insertNotification(candidateUserId, "application_declined", message, "/dashboard?tab=inbox", {
      team_id: teamId ?? null,
      sender_id: ownerUserId ?? null,
    })

    if (!email) return

    const teamsUrl = `${SITE_URL}/teams`
    const ctaPrimary = `display:inline-block;padding:12px 24px;background-color:#14b8a6;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`

    const subject = "Update on your application 📢 | GameJamCrew"
    const contentHtml = `
      <p style="${EMAIL_P}">Hi there. Thank you for applying!</p>
      <p style="${EMAIL_P}">Unfortunately, the squad leader has decided to move forward with another candidate or the squad is now full.</p>
      <p style="${EMAIL_P}">Don't give up! Browse open squads and find your next jam crew.</p>
      <p style="margin:0 0 24px;text-align:center;">
        <a href="${teamsUrl}" style="${ctaPrimary}" target="_blank" rel="noopener noreferrer">Browse squads</a>
      </p>
      <p style="${EMAIL_P}">Your <a href="${DASHBOARD_URL}" style="${EMAIL_LINK}">dashboard inbox</a> has the full history.</p>
      <p style="${EMAIL_P}">Keep jamming!</p>
      <p style="${EMAIL_SIGNOFF}">— The GameJamCrew team</p>
    `

    void sendEmailWithLayout(email, subject, "Application update", contentHtml)
  } catch {
    // Silent error: don't crash the main action
  }
}

/**
 * Sends an email notification to the candidate when they are accepted into a team
 * and creates an in-app notification for them.
 */
export async function notifyCandidateAccepted(
  candidateUserId: string,
  teamName: string,
  teamId: string,
  ownerUserId?: string | null,
  joinRequestId?: string | null,
): Promise<void> {
  try {
    const email = await getUserEmail(candidateUserId)

    const teamPath = `/teams/${teamId}`
    const message = `You were accepted into the squad "${teamName}".`
    void insertNotification(candidateUserId, "application_accepted", message, teamPath, {
      team_id: teamId,
      sender_id: ownerUserId ?? null,
      join_request_id: joinRequestId ?? null,
    })

    if (!email) return

    const squadUrl = `${SITE_URL}${teamPath}`
    const ctaPrimary = `display:inline-block;padding:12px 24px;background-color:#14b8a6;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`

    const subject = "You've been accepted! 🎉 | GameJamCrew"
    const contentHtml = `
      <p style="${EMAIL_P}">Congratulations! Your application to join <strong style="${EMAIL_STRONG}">${escapeHtml(
        teamName,
      )}</strong> has been accepted.</p>
      <p style="margin:0 0 24px;text-align:center;">
        <a href="${squadUrl}" style="${ctaPrimary}" target="_blank" rel="noopener noreferrer">Open squad page</a>
      </p>
      <p style="${EMAIL_P}">You can also open <a href="${DASHBOARD_URL}" style="${EMAIL_LINK}">your dashboard</a> to see all your squads.</p>
      <p style="${EMAIL_SIGNOFF}">— The GameJamCrew team</p>
    `

    void sendEmailWithLayout(email, subject, "You're in!", contentHtml)
  } catch {
    // Silent error: don't crash the main action
  }
}

/**
 * Sends an email to a team member with the team's Discord invite link.
 * Intended to be triggered from the team management page ("Send Discord link" button).
 * Errors are handled silently so they don't impact the UX.
 */
export async function notifyMemberDiscordLink(
  memberUserId: string,
  teamName: string,
  discordLink: string,
): Promise<void> {
  try {
    const email = await getUserEmail(memberUserId)
    if (!email) return

    const safeTeamName = escapeHtml(teamName)
    const safeDiscordLink = escapeHtml(discordLink)

    const subject = "Your squad shared a Discord invite | GameJamCrew"
    const contentHtml = `
      <p style="${EMAIL_P}">Good news! Your squad <strong style="${EMAIL_STRONG}">${safeTeamName}</strong> just shared their Discord invite link with you.</p>
      <p style="${EMAIL_P}"><a href="${safeDiscordLink}" style="${EMAIL_LINK}">Click here to join the squad's Discord server</a> and start coordinating with your teammates.</p>
      <p style="${EMAIL_SIGNOFF}">— The GameJamCrew team</p>
    `

    void sendEmailWithLayout(email, subject, "Discord invite", contentHtml)
  } catch {
    // Silent error: don't crash the main action
  }
}

/**
 * After a new team chat message is inserted into team_messages, this helper:
 * - creates in-app notifications for all other members/owner of the team
 * - sends a throttled "new messages" email (max once per hour) to (potentially) offline members.
 * It is intentionally best-effort and never throws.
 */
export async function notifyTeamChatNewMessage(
  teamId: string,
  senderId: string,
): Promise<void> {
  try {
    const admin = createAdminClient()

    const { data: teamRow, error: teamError } = await admin
      .from("teams")
      .select("id, team_name, user_id")
      .eq("id", teamId)
      .single()

    if (teamError || !teamRow) return

    const { data: memberRows, error: membersError } = await admin
      .from("team_members")
      .select("user_id")
      .eq("team_id", teamId)

    if (membersError) return

    const recipientIds = new Set<string>()
    recipientIds.add(teamRow.user_id as string)
    for (const m of memberRows ?? []) {
      if (m.user_id) recipientIds.add(m.user_id as string)
    }
    recipientIds.delete(senderId)

    if (recipientIds.size === 0) return

    const allRecipientIds = Array.from(recipientIds)

    const { data: profiles } = await admin
      .from("profiles")
      .select("id, last_chat_email_sent, username")
      .in("id", allRecipientIds)

    const now = new Date()
    const oneHourMs = 60 * 60 * 1000

    // In-app notifications for all recipients
    const notifMessage = `New message in the squad chat "${teamRow.team_name}".`
    const notifLink = `/teams/${teamId}`
    try {
      await admin.from("notifications").insert(
        allRecipientIds.map((id) => ({
          user_id: id,
          type: "team_chat",
          message: notifMessage,
          link: notifLink,
          team_id: teamId,
          sender_id: senderId,
        })),
      )
      for (const id of allRecipientIds) {
        void sendPushToUser(id, "GameJamCrew", notifMessage, notifLink)
      }
    } catch {
      // Ignore
    }

    // Throttled emails
    for (const profile of profiles ?? []) {
      const profileId = profile.id as string | undefined
      if (!profileId) continue

      const lastSent = profile.last_chat_email_sent
        ? new Date(profile.last_chat_email_sent as string)
        : null

      if (lastSent && now.getTime() - lastSent.getTime() < oneHourMs) {
        continue
      }

      const email = await getUserEmail(profileId)
      if (!email) continue

      const chatUrl = `${SITE_URL}/teams/${teamId}`
      const ctaPrimary = `display:inline-block;padding:12px 24px;background-color:#14b8a6;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`

      const subject = "New messages in squad chat | GameJamCrew"
      const contentHtml = `
        <p style="${EMAIL_P}">You have new unread messages in the squad chat <strong style="${EMAIL_STRONG}">${escapeHtml(
          teamRow.team_name as string,
        )}</strong>.</p>
        <p style="margin:0 0 24px;text-align:center;">
          <a href="${chatUrl}" style="${ctaPrimary}" target="_blank" rel="noopener noreferrer">Open squad chat</a>
        </p>
        <p style="${EMAIL_P}">Or open <a href="${DASHBOARD_URL}" style="${EMAIL_LINK}">your dashboard</a>.</p>
        <p style="${EMAIL_SIGNOFF}">— The GameJamCrew team</p>
      `

      void sendEmailWithLayout(email, subject, "New messages", contentHtml)

      try {
        await admin
          .from("profiles")
          .update({ last_chat_email_sent: now.toISOString() })
          .eq("id", profileId)
      } catch {
        // Ignore update failure
      }
    }
  } catch {
    // Fully silent: chat should never fail because of notifications
  }
}

/**
 * Notifie le propriétaire lorsqu'un joueur décline une invitation à rejoindre son équipe.
 * Notification in-app uniquement (pas d'e-mail).
 */
export async function notifyOwnerInvitationDeclined(
  teamId: string,
  playerName: string,
  declinerUserId?: string | null,
): Promise<void> {
  try {
    const admin = createAdminClient()
    const { data: teamRow, error } = await admin
      .from("teams")
      .select("id, user_id")
      .eq("id", teamId)
      .single()

    if (error || !teamRow?.user_id) return

    const safeName = await resolvePublicJammerName(declinerUserId, playerName)
    const managePath = `/teams/${teamId}/manage`
    const message = `Player ${safeName} declined your invitation to join the squad.`
    void insertNotification(teamRow.user_id as string, "invitation_declined", message, managePath, {
      team_id: teamId,
      sender_id: declinerUserId ?? null,
    })
  } catch {
    // Silent error
  }
}

/**
 * Notifie le propriétaire lorsqu'un joueur rejoint officiellement son équipe
 * (acceptation d'invitation ou de candidature).
 * Notification in-app uniquement (pas d'e-mail).
 */
export async function notifyOwnerPlayerJoined(
  teamId: string,
  playerName: string,
  playerUserId?: string | null,
): Promise<void> {
  try {
    const admin = createAdminClient()
    const { data: teamRow, error } = await admin
      .from("teams")
      .select("id, user_id")
      .eq("id", teamId)
      .single()

    if (error || !teamRow?.user_id) return

    const safeName = await resolvePublicJammerName(playerUserId, playerName)
    const teamPath = `/teams/${teamId}`
    const message = `${safeName} has officially joined your squad!`
    void insertNotification(teamRow.user_id as string, "player_joined", message, teamPath, {
      team_id: teamId,
      sender_id: playerUserId ?? null,
    })
  } catch {
    // Silent error
  }
}

/**
 * Tells the squad owner that a member left. In-app only. Always uses the profile username.
 */
export async function notifyOwnerMemberLeft(teamId: string, memberUserId: string): Promise<void> {
  try {
    const admin = createAdminClient()
    const { data: teamRow, error } = await admin
      .from("teams")
      .select("id, user_id")
      .eq("id", teamId)
      .single()

    if (error || !teamRow?.user_id) return
    if (teamRow.user_id === memberUserId) return

    const safeName = await resolvePublicJammerName(memberUserId)
    const message = `${safeName} left your squad.`
    void insertNotification(teamRow.user_id as string, "member_left", message, `/teams/${teamId}/manage`, {
      team_id: teamId,
      sender_id: memberUserId,
    })
  } catch {
    // Silent error
  }
}

/**
 * Notifie un joueur lorsqu'il est retiré d'une équipe (kick) et lui envoie un e-mail.
 */
export async function notifyPlayerKicked(
  playerUserId: string,
  teamName: string,
  teamId?: string | null,
  ownerUserId?: string | null,
): Promise<void> {
  try {
    const message = `You have been removed from the squad "${teamName}".`
    void insertNotification(playerUserId, "team_kicked", message, "/dashboard", {
      team_id: teamId ?? null,
      sender_id: ownerUserId ?? null,
    })

    const email = await getUserEmail(playerUserId)
    if (!email) return

    const safeTeamName = escapeHtml(teamName)
    const subject = "You have been removed from a squad | GameJamCrew"
    const contentHtml = `
      <p style="${EMAIL_P}">You have been removed from the squad <strong style="${EMAIL_STRONG}">${safeTeamName}</strong>.</p>
      <p style="${EMAIL_P}">You can keep looking for new squads or create your own on <a href="${DASHBOARD_URL}" style="${EMAIL_LINK}">GameJamCrew</a>.</p>
      <p style="${EMAIL_SIGNOFF}">— The GameJamCrew team</p>
    `

    void sendEmailWithLayout(email, subject, "Squad update", contentHtml)
  } catch {
    // Silent error
  }
}

/**
 * Notifie tous les membres actuels (propriétaire inclus) lorsqu'un lien Discord est mis à jour
 * et leur envoie un e-mail pour les inviter à rejoindre le serveur.
 */
export async function notifyTeamDiscordUpdated(
  teamId: string,
  teamName: string,
): Promise<void> {
  try {
    const admin = createAdminClient()

    const { data: teamRow, error: teamError } = await admin
      .from("teams")
      .select("id, user_id")
      .eq("id", teamId)
      .single()

    if (teamError || !teamRow?.user_id) return

    const { data: memberRows, error: membersError } = await admin
      .from("team_members")
      .select("user_id")
      .eq("team_id", teamId)

    if (membersError) return

    const recipientIds = new Set<string>()
    recipientIds.add(teamRow.user_id as string)
    for (const row of memberRows ?? []) {
      if (row.user_id) recipientIds.add(row.user_id as string)
    }

    if (recipientIds.size === 0) return

    const allRecipientIds = Array.from(recipientIds)
    const notifMessage = `The Discord link for your squad "${teamName}" has been updated. Join the server!`
    const notifLink = `/teams/${teamId}`

    try {
      await admin.from("notifications").insert(
        allRecipientIds.map((id) => ({
          user_id: id,
          type: "discord_updated",
          message: notifMessage,
          link: notifLink,
          team_id: teamId,
        })),
      )
      for (const id of allRecipientIds) {
        void sendPushToUser(id, "GameJamCrew", notifMessage, notifLink)
      }
    } catch {
      // Ignore notification insert errors
    }

    const safeTeamName = escapeHtml(teamName)
    const teamPageUrl = `${SITE_URL}/teams/${teamId}`
    const ctaPrimary = `display:inline-block;padding:12px 24px;background-color:#14b8a6;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`

    const subject = "Your squad's Discord link was updated | GameJamCrew"
    const contentHtml = `
      <p style="${EMAIL_P}">The Discord link for your squad <strong style="${EMAIL_STRONG}">${safeTeamName}</strong> has been updated.</p>
      <p style="margin:0 0 24px;text-align:center;">
        <a href="${teamPageUrl}" style="${ctaPrimary}" target="_blank" rel="noopener noreferrer">Open squad page</a>
      </p>
      <p style="${EMAIL_P}">Grab the new invite from the squad page or your <a href="${DASHBOARD_URL}" style="${EMAIL_LINK}">dashboard</a>.</p>
      <p style="${EMAIL_SIGNOFF}">— The GameJamCrew team</p>
    `

    for (const id of allRecipientIds) {
      const email = await getUserEmail(id)
      if (!email) continue
      void sendEmailWithLayout(email, subject, "Discord link updated", contentHtml)
    }
  } catch {
    // Silent error
  }
}

/**
 * E-mail au propriétaire lorsque l’annonce d’équipe est archivée (fin du jam / suppression automatique).
 */
export async function notifyOwnerJamListingArchived(
  ownerUserId: string,
  teamName: string,
): Promise<void> {
  try {
    const email = await getUserEmail(ownerUserId)
    if (!email) return

    const safeTeamName = escapeHtml(teamName)
    const subject = "Your jam announcement has ended! 🏁 | GameJamCrew"
    const contentHtml = `
      <p style="${EMAIL_P}">Your listing for <strong style="${EMAIL_STRONG}">${safeTeamName}</strong> has reached its jam end date and is no longer visible on GameJamCrew.</p>
      <p style="${EMAIL_P}">Your squad data is safe — you can always create a new listing for your next jam from <a href="${DASHBOARD_URL}" style="${EMAIL_LINK}">your dashboard</a>.</p>
      <p style="${EMAIL_SIGNOFF}">— The GameJamCrew team</p>
    `

    await sendEmailWithLayout(
      email,
      subject,
      "Your Jam announcement has ended! 🏁",
      contentHtml,
    )
  } catch {
    /* best-effort */
  }
}


