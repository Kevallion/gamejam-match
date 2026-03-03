"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Marks the onboarding as completed for the currently authenticated user.
 * Updates has_completed_onboarding to true in the profiles table.
 */
export async function completeOnboarding(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "User not authenticated" }
  }

  // S'assure qu'une ligne de profil existe pour cet utilisateur,
  // et marque l'onboarding comme complété (idempotent).
  const { error } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, has_completed_onboarding: true },
      { onConflict: "id" }
    )

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
