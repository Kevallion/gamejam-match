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

  const { error } = await supabase
    .from("profiles")
    .update({ has_completed_onboarding: true })
    .eq("id", user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
