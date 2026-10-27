"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { awardXP, tryAwardCaptainBadgeForFullRoster } from "@/lib/gamification"
import type { GamificationRewardSummary } from "@/lib/gamification-reward-types"
import {
  markNotificationsReadForJoinRequest,
  notifyCandidateAccepted,
  notifyOwnerMemberLeft,
  notifyOwnerPlayerJoined,
  notifyOwnerSquadRosterComplete,
} from "@/app/actions/team-actions"

export type MembershipActionResult =
  | {
      success: true
      /** Join XP / badges for the new member (invitation accept only). */
      gamification?: GamificationRewardSummary
      /** Captain badge / roster-complete reward for the team owner (when roster just filled). */
      ownerGamification?: GamificationRewardSummary
    }
  | { success: false; error: string }

/**
 * Team owner accepts a pending application: adds sender to team_members and grants JOIN_TEAM XP to the applicant.
 */
export async function acceptJoinApplication(joinRequestId: string): Promise<MembershipActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "You must be signed in." }
  }

  const { data: request, error: fetchError } = await supabase
    .from("join_requests")
    .select("id, team_id, sender_id, sender_name, target_role, status, type, teams(team_name, user_id)")
    .eq("id", joinRequestId)
    .single()

  if (fetchError || !request) {
    return { success: false, error: fetchError?.message ?? "Could not read the request." }
  }

  const teamMeta = request.teams as { team_name?: string | null; user_id?: string | null } | null
  if (!teamMeta?.user_id || teamMeta.user_id !== user.id) {
    return { success: false, error: "You are not allowed to accept this application." }
  }
  if (request.type !== "application" || request.status !== "pending") {
    return { success: false, error: "This request cannot be accepted." }
  }

  const targetRole = request.target_role as string | null
  const teamId = request.team_id as string
  const senderId = request.sender_id as string | null
  if (!senderId) {
    return { success: false, error: "Invalid applicant." }
  }

  const { data: teamData, error: teamFetchError } = await supabase
    .from("teams")
    .select("looking_for")
    .eq("id", teamId)
    .single()

  if (teamFetchError) {
    return { success: false, error: teamFetchError.message }
  }

  const lookingFor = Array.isArray(teamData?.looking_for) ? teamData.looking_for : []
  const slotsForRole = lookingFor.filter(
    (r: { role?: string }) => (r?.role || "").toLowerCase() === (targetRole || "").toLowerCase(),
  ).length
  if (slotsForRole === 0) {
    return { success: false, error: "Role no longer available." }
  }

  const { data: existingMembers, error: membersCountError } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("role", targetRole)

  if (membersCountError) {
    return { success: false, error: membersCountError.message }
  }

  const usedSlotsForRole = existingMembers?.length ?? 0
  if (usedSlotsForRole >= slotsForRole) {
    return { success: false, error: "Role already filled." }
  }

  const { data: alreadyMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", senderId)
    .maybeSingle()
  if (alreadyMember) {
    return { success: false, error: "This jammer is already a member of this squad." }
  }

  const { error: insertError } = await supabase.from("team_members").insert({
    team_id: teamId,
    user_id: senderId,
    role: targetRole || "member",
  })

  if (insertError) {
    if (insertError.code === "23505") {
      return { success: false, error: "This jammer is already a member of this squad." }
    }
    return { success: false, error: insertError.message }
  }

  const { data: updatedRows, error: updateError } = await supabase
    .from("join_requests")
    .update({ status: "accepted" })
    .eq("id", joinRequestId)
    .eq("status", "pending")
    .select("id")

  if (updateError) {
    return { success: false, error: updateError.message }
  }
  if (!updatedRows?.length) {
    return { success: false, error: "This request was already handled." }
  }

  const teamName = teamMeta.team_name ?? undefined
  if (teamName) {
    void notifyCandidateAccepted(senderId, teamName, teamId, user.id, joinRequestId)
  }
  void notifyOwnerPlayerJoined(teamId, (request.sender_name as string | null) ?? "", senderId)
  void markNotificationsReadForJoinRequest(joinRequestId)

  let ownerGamification: GamificationRewardSummary | undefined
  {
    try {
      const gamification = await awardXP(senderId, "JOIN_TEAM", { joinRole: targetRole })
      if (!gamification.ok) {
        console.error("[gamification] JOIN_TEAM (application):", gamification.error)
      }
      const captainRes = await tryAwardCaptainBadgeForFullRoster(teamId)
      if (captainRes?.ok && captainRes.reward) {
        ownerGamification = captainRes.reward
      }
      if (captainRes?.ok) {
        void notifyOwnerSquadRosterComplete(user.id, captainRes.reward ?? undefined)
      }
    } catch (err) {
      console.error("[gamification] after accept application:", err)
    }
  }

  return { success: true, ownerGamification }
}

/**
 * Invitee accepts a squad invitation (join_requests.type = invitation, sender_id = invitee).
 */
export async function acceptTeamInvitation(invitationId: string): Promise<MembershipActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "You must be signed in to accept an invitation." }
  }

  const { data: invitation, error: fetchError } = await supabase
    .from("join_requests")
    .select("id, team_id, sender_id, target_role, status, type")
    .eq("id", invitationId)
    .single()

  if (fetchError || !invitation) {
    return { success: false, error: fetchError?.message ?? "Invitation not found." }
  }

  if (
    invitation.type !== "invitation" ||
    invitation.status !== "pending" ||
    invitation.sender_id !== user.id
  ) {
    return { success: false, error: "This invitation cannot be accepted." }
  }

  const teamId = invitation.team_id as string
  const targetRole = (invitation.target_role as string | null) ?? "member"

  const { data: alreadyMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle()
  if (alreadyMember) {
    return { success: false, error: "You are already a member of this squad." }
  }

  const { error: insertError } = await supabase.from("team_members").insert({
    team_id: teamId,
    user_id: user.id,
    role: targetRole,
  })

  if (insertError) {
    if (insertError.code === "23505") {
      return { success: false, error: "You are already a member of this squad." }
    }
    return { success: false, error: insertError.message }
  }

  const { data: updatedRows, error: updateError } = await supabase
    .from("join_requests")
    .update({ status: "accepted" })
    .eq("id", invitationId)
    .eq("status", "pending")
    .select("id")

  if (updateError) {
    return { success: false, error: updateError.message }
  }
  if (!updatedRows?.length) {
    return { success: false, error: "This invitation was already handled." }
  }

  void notifyOwnerPlayerJoined(teamId, "", user.id)
  void markNotificationsReadForJoinRequest(invitationId)

  let joinGamification: GamificationRewardSummary | undefined
  let ownerGamification: GamificationRewardSummary | undefined
  {
    try {
      const gamification = await awardXP(user.id, "JOIN_TEAM", { joinRole: targetRole })
      if (!gamification.ok) {
        console.error("[gamification] JOIN_TEAM (invitation):", gamification.error)
      } else if (gamification.reward) {
        joinGamification = gamification.reward
      }
      const captainRes = await tryAwardCaptainBadgeForFullRoster(teamId)
      if (captainRes?.ok && captainRes.reward) {
        ownerGamification = captainRes.reward
      }
      if (captainRes?.ok) {
        const { data: teamRow } = await supabase.from("teams").select("user_id").eq("id", teamId).maybeSingle()
        if (teamRow?.user_id) {
          void notifyOwnerSquadRosterComplete(teamRow.user_id as string, captainRes.reward ?? undefined)
        }
      }
    } catch (err) {
      console.error("[gamification] after accept invitation:", err)
    }
  }

  return { success: true, gamification: joinGamification, ownerGamification }
}

/**
 * Member leaves a squad. Notifies the owner, drops accepted join rows, and
 * clears the leaver's invite/accept notifications plus the owner's join notice
 * so a later rejoin can notify again.
 */
export async function leaveTeam(teamId: string): Promise<MembershipActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "You must be signed in." }
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, user_id, team_name")
    .eq("id", teamId)
    .maybeSingle()

  if (teamError || !team) {
    return { success: false, error: teamError?.message ?? "Squad not found." }
  }
  if (team.user_id === user.id) {
    return { success: false, error: "Squad owners cannot leave. Delete the squad instead." }
  }

  const { data: membership } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle()
  if (!membership) {
    return { success: false, error: "You are not a member of this squad." }
  }

  const { error: deleteError } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", user.id)
  if (deleteError) {
    return { success: false, error: deleteError.message }
  }

  await supabase
    .from("join_requests")
    .delete()
    .eq("team_id", teamId)
    .eq("sender_id", user.id)
    .eq("status", "accepted")

  try {
    const admin = createAdminClient()
    await admin
      .from("notifications")
      .delete()
      .eq("user_id", user.id)
      .eq("team_id", teamId)
      .in("type", ["team_invitation", "application_accepted"])
    await admin
      .from("notifications")
      .delete()
      .eq("user_id", team.user_id as string)
      .eq("team_id", teamId)
      .eq("sender_id", user.id)
      .eq("type", "player_joined")
  } catch (err) {
    console.error("[leaveTeam] notification cleanup:", err)
  }

  void notifyOwnerMemberLeft(teamId, user.id)
  return { success: true }
}
