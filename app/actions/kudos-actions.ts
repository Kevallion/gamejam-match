"use server"

import { createClient } from "@/lib/supabase/server"
import { tryUnlockKudosCategoryTitle } from "@/lib/gamification"
import { usersShareATeam } from "@/lib/kudos-collaboration"
import { isKudosCategoryDb } from "@/lib/kudos"

export type GiveKudosResult =
  | { ok: true }
  | { ok: false; error: string }

export async function giveKudos(receiverId: string, category: string): Promise<GiveKudosResult> {
  const trimmedReceiver = receiverId?.trim() ?? ""
  if (!trimmedReceiver) {
    return { ok: false, error: "Invalid profile." }
  }
  if (!isKudosCategoryDb(category)) {
    return { ok: false, error: "Invalid kudos category." }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false, error: "You must be signed in to give kudos." }
  }
  if (user.id === trimmedReceiver) {
    return { ok: false, error: "You cannot give kudos to yourself." }
  }

  const teammates = await usersShareATeam(supabase, user.id, trimmedReceiver)
  if (!teammates) {
    return {
      ok: false,
      error: "You can only give Kudos to teammates you have worked with.",
    }
  }

  const { error: insertError } = await supabase.from("kudos").insert({
    sender_id: user.id,
    receiver_id: trimmedReceiver,
    category,
  })

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        ok: false,
        error: "You already gave Kudos in this category for this teammate.",
      }
    }
    return { ok: false, error: insertError.message }
  }

  const unlock = await tryUnlockKudosCategoryTitle(trimmedReceiver, category)
  if (!unlock.ok) {
    console.error("[kudos] title unlock:", unlock.error)
  }

  return { ok: true }
}
