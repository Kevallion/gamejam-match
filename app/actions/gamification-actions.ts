"use server"

import { createClient } from "@/lib/supabase/server"
import { awardXP } from "@/lib/gamification"
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
