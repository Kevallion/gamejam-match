"use server"

import { createClient } from "@/lib/supabase/server"
import { notifyInviteeInvitation } from "@/app/actions/team-actions"
import { awardXP } from "@/lib/gamification"
import type { GamificationRewardSummary } from "@/lib/gamification-reward-types"
import { ROLE_OPTIONS } from "@/lib/constants"

type TeamLookingForEntry = { role?: string; level?: string }

const ROLE_VALUES = new Set<string>(ROLE_OPTIONS.map((o) => o.value))

export type SendTeamInvitationInput = {
  teamId: string
  inviteeUserId: string
  inviteeUsername: string
  targetRole: string
  message: string
}

export type SendTeamInvitationResult =
  | { success: true; gamification?: GamificationRewardSummary }
  | { success: false; error: string }

/**
 * Owner sends a squad invitation (join_requests.type = invitation). Awards INVITE_MEMBER XP to the inviter.
 */
export async function sendTeamInvitation(input: SendTeamInvitationInput): Promise<SendTeamInvitationResult> {
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
    .select("id, user_id, team_name, looking_for")
    .eq("id", input.teamId)
    .single()

  if (teamError || !team?.user_id || team.user_id !== user.id) {
    return { success: false, error: "You can only invite from teams you own." }
  }

  const msg = input.message?.trim() || "You've been invited to join our squad!"
  const name = input.inviteeUsername?.trim() || "A Jammer"
  const normalizedTargetRole = input.targetRole.trim().toLowerCase()

  // Keep team requirements in sync with invitations:
  // if owner invites for a role not currently in looking_for, add it automatically.
  if (ROLE_VALUES.has(normalizedTargetRole)) {
    const rawLookingFor = Array.isArray(team.looking_for)
      ? (team.looking_for as TeamLookingForEntry[])
      : []
    const alreadyPresent = rawLookingFor.some(
      (entry) => entry?.role?.trim().toLowerCase() === normalizedTargetRole,
    )
    if (!alreadyPresent) {
      const nextLookingFor: TeamLookingForEntry[] = [
        ...rawLookingFor,
        { role: normalizedTargetRole, level: "regular" },
      ]
      const { error: updateTeamError } = await supabase
        .from("teams")
        .update({ looking_for: nextLookingFor })
        .eq("id", input.teamId)
        .eq("user_id", user.id)
      if (updateTeamError) {
        return { success: false, error: "Could not update team roles before sending invitation." }
      }
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from("join_requests")
    .insert({
      team_id: input.teamId,
      sender_id: input.inviteeUserId,
      sender_name: name,
      message: msg,
      status: "pending",
      type: "invitation",
      target_role: normalizedTargetRole,
    })
    .select("id")
    .single()

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        success: false,
        error: "An invitation is already pending for this player on this team.",
      }
    }
    return { success: false, error: insertError.message }
  }

  const teamName = (team.team_name as string) || "your squad"
  const requestId = inserted?.id as string | undefined
  if (requestId) {
    void notifyInviteeInvitation(input.inviteeUserId, teamName, {
      teamId: input.teamId,
      joinRequestId: requestId,
      inviterUserId: user.id,
    })
  }

  let gamification: GamificationRewardSummary | undefined
  try {
    const res = await awardXP(user.id, "INVITE_MEMBER")
    if (!res.ok) {
      console.error("[gamification] INVITE_MEMBER:", res.error)
    } else if (res.reward) {
      gamification = res.reward
    }
  } catch (err) {
    console.error("[gamification] INVITE_MEMBER (unexpected):", err)
  }

  return { success: true, gamification }
}
