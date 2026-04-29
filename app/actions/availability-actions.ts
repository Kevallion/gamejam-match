"use server"

import { createClient } from "@/lib/supabase/server"
import { awardXP } from "@/lib/gamification"
import { sendPlayerPostFollowUp } from "@/lib/mail"

/**
 * Call after a successful availability_posts insert. Verifies the row belongs to the current user
 * and was created recently to limit stale/abuse calls.
 */
export async function claimAvailabilityPostXp(postId: string) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false as const, error: "Not authenticated" }
  }

  const { data: row, error } = await supabase
    .from("availability_posts")
    .select("id, user_id, created_at")
    .eq("id", postId)
    .single()

  if (error || !row || row.user_id !== user.id) {
    return { ok: false as const, error: "Invalid announcement." }
  }

  const created = row.created_at ? new Date(row.created_at as string) : null
  if (!created || Number.isNaN(created.getTime())) {
    return { ok: false as const, error: "Invalid post timestamp." }
  }

  // Best-effort follow-up after the availability post was inserted.
  if (user.email) {
    try {
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single()

      const username = profileRow?.username?.trim()
      if (username) {
        await sendPlayerPostFollowUp(user.email, username)
      }
    } catch {
      // Silent: email issues shouldn't block XP claiming.
    }
  }

  const fiveMinMs = 5 * 60 * 1000
  if (Date.now() - created.getTime() > fiveMinMs) {
    return { ok: false as const, error: "Reward window expired." }
  }

  return awardXP(user.id, "POST_ANNOUNCEMENT")
}
