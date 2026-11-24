"use server"

import { createClient } from "@/lib/supabase/server"
import { awardXP, type AwardXPResult } from "@/lib/gamification"
import { loadGamificationSnapshot, type GamificationSnapshot } from "@/lib/gamification-snapshot"
import { isTitleUnlocked, parseUnlockedTitlesJson } from "@/lib/gamification-titles-catalog"

export async function claimDailyLoginXp() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false as const, error: "Not authenticated" }
  }

  return awardXP(user.id, "DAILY_LOGIN")
}

export type UpdateCurrentTitleResult =
  | { ok: true }
  | { ok: false; error: string }

/**
 * Sets `profiles.current_title` if the title is in `unlocked_titles` (enforced by DB trigger too).
 */
export async function updateCurrentTitle(nextTitle: string): Promise<UpdateCurrentTitleResult> {
  const trimmed = nextTitle?.trim() ?? ""
  if (!trimmed) {
    return { ok: false, error: "Title is required." }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false, error: "You must be signed in." }
  }

  const { data: row, error: fetchError } = await supabase
    .from("profiles")
    .select("unlocked_titles")
    .eq("id", user.id)
    .single()

  if (fetchError || !row) {
    return { ok: false, error: fetchError?.message ?? "Could not load your profile." }
  }

  const unlocked = parseUnlockedTitlesJson(row.unlocked_titles)
  if (!isTitleUnlocked(unlocked, trimmed)) {
    return { ok: false, error: "You have not unlocked this title yet." }
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ current_title: trimmed })
    .eq("id", user.id)

  if (updateError) {
    return { ok: false, error: updateError.message }
  }

  return { ok: true }
}

export type GetMyGamificationSnapshotResult =
  | { ok: true; snapshot: GamificationSnapshot; dailyLogin?: AwardXPResult }
  | { ok: false; error: string }

/**
 * DS-3a: level / XP / badges of the signed-in user (Dashboard + Rewards).
 * `claimDailyLogin`: also claims the daily login XP first (same request), so the
 * dashboard needs one server action instead of three (claim, snapshot, refresh).
 * Server actions from one client run one after another, each through the proxy.
 */
export async function getMyGamificationSnapshot(
  options: { claimDailyLogin?: boolean } = {},
): Promise<GetMyGamificationSnapshotResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false, error: "Not authenticated" }
  }

  try {
    let dailyLogin: AwardXPResult | undefined
    if (options.claimDailyLogin === true) {
      try {
        dailyLogin = await awardXP(user.id, "DAILY_LOGIN")
      } catch {
        dailyLogin = { ok: false, error: "DAILY_LOGIN_FAILED" }
      }
    }
    const snapshot = await loadGamificationSnapshot(supabase, user.id)
    return dailyLogin ? { ok: true, snapshot, dailyLogin } : { ok: true, snapshot }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not load rewards." }
  }
}
