"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Deletes the currently authenticated user's account (RGPD compliance).
 * Uses the Supabase Admin client to delete from auth.users.
 * Cascades to profiles, availability_posts, team_members, etc. via DB constraints.
 */
export async function deleteUserAccount(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "User not authenticated" }
  }

  const userId = user.id

  try {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(userId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Sign out to clear any remaining session/cookies
    await supabase.auth.signOut()

    redirect("/")
  } catch (err) {
    // Next.js redirect() throws - rethrow to allow navigation
    const digest = err && typeof err === "object" && "digest" in err ? String((err as { digest?: string }).digest) : ""
    if (digest.startsWith("NEXT_REDIRECT")) throw err
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete account",
    }
  }
}
