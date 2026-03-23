"use server"

import { createClient } from "@/lib/supabase/server"
import { notifyInviteeInvitation } from "@/app/actions/team-actions"
import { awardXP } from "@/lib/gamification"
import type { GamificationRewardSummary } from "@/lib/gamification-reward-types"

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
    .select("id, user_id, team_name")
    .eq("id", input.teamId)
    .single()

  if (teamError || !team?.user_id || team.user_id !== user.id) {
    return { success: false, error: "You can only invite from teams you own." }
  }

  const msg = input.message?.trim() || "You've been invited to join our squad!"
  const name = input.inviteeUsername?.trim() || "A Jammer"

  const { error: insertError } = await supabase.from("join_requests").insert({
    team_id: input.teamId,
    sender_id: input.inviteeUserId,
    sender_name: name,
    message: msg,
    status: "pending",
    type: "invitation",
    target_role: input.targetRole,
  })

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  const teamName = (team.team_name as string) || "your squad"
  void notifyInviteeInvitation(input.inviteeUserId, teamName)

  const gamification = await awardXP(user.id, "INVITE_MEMBER")
  if (!gamification.ok) {
    console.error("[gamification] INVITE_MEMBER:", gamification.error)
  }

  return { success: true, gamification: gamification.ok ? gamification.reward : undefined }
}
