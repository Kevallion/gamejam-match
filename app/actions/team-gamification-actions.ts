"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { awardXP } from "@/lib/gamification"
import type { GamificationRewardSummary } from "@/lib/gamification-reward-types"

/**
 * Team owner claims one-time TEAM_COMPLETED XP + title for this squad.
 */
export async function claimTeamJamCompletedXp(teamId: string) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false as const, error: "You must be signed in." }
  }

  const admin = createAdminClient()
  const { data: team, error: teamError } = await admin
    .from("teams")
    .select("id, user_id, jam_completion_xp_claimed")
    .eq("id", teamId)
    .single()

  if (teamError || !team) {
    return { success: false as const, error: "Team not found." }
  }

  if (team.user_id !== user.id) {
    return { success: false as const, error: "Only the team owner can claim this reward." }
  }

  if (team.jam_completion_xp_claimed === true) {
    return { success: false as const, error: "You already claimed jam completion XP for this team." }
  }

  const gamification = await awardXP(user.id, "TEAM_COMPLETED")
  if (!gamification.ok) {
    return { success: false as const, error: gamification.error ?? "Could not apply reward." }
  }

  const { data: flagged, error: updateError } = await admin
    .from("teams")
    .update({ jam_completion_xp_claimed: true })
    .eq("id", teamId)
    .eq("jam_completion_xp_claimed", false)
    .select("id")
    .maybeSingle()

  if (updateError) {
    console.error("[gamification] jam_completion flag update:", updateError.message)
    return { success: false as const, error: "Reward applied but could not lock claim. Contact support." }
  }
  if (!flagged) {
    return { success: false as const, error: "Claim was already recorded for this team." }
  }

  return {
    success: true as const,
    gamification: gamification.reward as GamificationRewardSummary,
  }
}
