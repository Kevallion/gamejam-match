"use server"

import { createAdminClient, getUserEmail } from "@/lib/supabase/admin"
import { sendEmailNotification } from "@/lib/mail"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gamejamcrew.com"
const DASHBOARD_URL = `${BASE_URL}/dashboard`

async function insertNotification(
  userId: string,
  type: string,
  message: string,
  link?: string | null,
) {
  try {
    const admin = createAdminClient()
    await admin.from("notifications").insert({
      user_id: userId,
      type,
      message,
      link: link ?? null,
    })
  } catch {
    // Silent error: notifications should never break the main UX
  }
}

/**
 * Sends an email notification to the team owner when a new applicant applies
 * and creates an in-app notification for them.
 */
export async function notifyOwnerNewApplication(
  ownerUserId: string,
  candidateName: string,
  teamName: string,
): Promise<void> {
  try {
    const email = await getUserEmail(ownerUserId)

    const message = `${candidateName} applied to your team "${teamName}".`
    void insertNotification(
      ownerUserId,
      "application_received",
      message,
      "/dashboard?tab=requests",
    )

    if (!email) return

    const subject = "New application for your team! 🚀 | GameJamCrew"
    const html = `
      <p>Good news! Someone just applied to join your team.</p>
      <p>Log in to <a href="${DASHBOARD_URL}">GameJamCrew</a> to check out their profile and accept or decline their application.</p>
      <p>— The GameJamCrew team</p>
    `

    void sendEmailNotification(email, subject, html)
  } catch {
    // Silent error: don't crash the main action
  }
}

/**
 * Sends an email notification to a player when they are invited to join a team
 * and creates an in-app notification for them.
 */
export async function notifyInviteeInvitation(
  inviteeUserId: string,
  teamName: string,
): Promise<void> {
  try {
    const email = await getUserEmail(inviteeUserId)

    const message = `You were invited to join the team "${teamName}".`
    void insertNotification(
      inviteeUserId,
      "team_invitation",
      message,
      "/dashboard?tab=requests",
    )

    if (!email) return

    const subject = "You've been invited to join a team! 🎮 | GameJamCrew"
    const html = `
      <p>Hi there! A team leader just invited you to join their squad for an upcoming Game Jam.</p>
      <p>Log in to <a href="${DASHBOARD_URL}">GameJamCrew</a> to check out their team details and accept or decline the invitation.</p>
      <p>Happy jamming!</p>
      <p>— The GameJamCrew team</p>
    `

    void sendEmailNotification(email, subject, html)
  } catch {
    // Silent error: don't crash the main action
  }
}

/**
 * Sends an email notification to the candidate when their application is declined
 * and creates an in-app notification for them.
 */
export async function notifyApplicantDeclined(candidateUserId: string): Promise<void> {
  try {
    const email = await getUserEmail(candidateUserId)

    const message =
      "Your application was declined. New teams are waiting for you in the dashboard."
    void insertNotification(
      candidateUserId,
      "application_declined",
      message,
      "/dashboard?tab=requests",
    )

    if (!email) return

    const subject = "Update on your application 📢 | GameJamCrew"
    const html = `
      <p>Hi there. Thank you for applying!</p>
      <p>Unfortunately, the team leader has decided to move forward with another candidate or the team is now full.</p>
      <p>Don't give up! There are plenty of other great teams looking for your skills right now. Log in to <a href="${DASHBOARD_URL}">GameJamCrew</a> to find your perfect squad.</p>
      <p>Keep jamming!</p>
      <p>— The GameJamCrew team</p>
    `

    void sendEmailNotification(email, subject, html)
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
): Promise<void> {
  try {
    const email = await getUserEmail(candidateUserId)

    const message = `You were accepted into the team "${teamName}".`
    void insertNotification(
      candidateUserId,
      "application_accepted",
      message,
      "/dashboard?tab=requests",
    )

    if (!email) return

    const subject = "You've been accepted! 🎉 | GameJamCrew"
    const html = `
      <p>Congratulations! Your application to join the team has been accepted.</p>
      <p>Jump into <a href="${DASHBOARD_URL}">GameJamCrew</a> to connect with your new teammates and start jamming!</p>
      <p>— The GameJamCrew team</p>
    `

    void sendEmailNotification(email, subject, html)
  } catch {
    // Silent error: don't crash the main action
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
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

    const subject = "Your team shared a Discord invite | GameJamCrew"
    const html = `
      <p>Good news! Your team <strong>${safeTeamName}</strong> just shared their Discord invite link with you.</p>
      <p><a href="${safeDiscordLink}">Click here to join the team's Discord server</a> and start coordinating with your teammates.</p>
      <p>— The GameJamCrew team</p>
    `

    void sendEmailNotification(email, subject, html)
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
    const notifMessage = `New message in the team chat "${teamRow.team_name}".`
    try {
      await admin.from("notifications").insert(
        allRecipientIds.map((id) => ({
          user_id: id,
          type: "team_chat",
          message: notifMessage,
          link: `/teams/${teamId}`,
        })),
      )
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

      const subject = "New messages in team chat | GameJamCrew"
      const html = `
        <p>You have new unread messages in the team chat <strong>${escapeHtml(
          teamRow.team_name as string,
        )}</strong>.</p>
        <p>Log in to <a href="${DASHBOARD_URL}">GameJamCrew</a> to reply!</p>
        <p>— The GameJamCrew team</p>
      `

      void sendEmailNotification(email, subject, html)

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

