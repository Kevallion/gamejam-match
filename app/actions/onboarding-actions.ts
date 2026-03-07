"use server"

import { createClient } from "@/lib/supabase/server"
import { CURRENT_ONBOARDING_VERSION } from "@/lib/onboarding"

/**
 * Persists onboarding preferences for the current user
 * and marks the onboarding as completed.
 */
export type CompleteOnboardingInput = {
  defaultRole?: string | null
  defaultEngine?: string | null
  defaultLanguage?: string | null
  discordUsername?: string | null
  portfolioUrl?: string | null
  publishImmediately?: boolean
}

export async function completeOnboarding(
  input: CompleteOnboardingInput
): Promise<{ success: boolean; error?: string; warning?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "User not authenticated" }
  }

  const defaultRole = input.defaultRole?.trim() || null
  const defaultEngine = input.defaultEngine?.trim() || null
  const defaultLanguage = input.defaultLanguage?.trim() || null
  const discordUsername = input.discordUsername?.trim() || null
  const portfolioUrl = input.portfolioUrl?.trim() || null
  const publishImmediately = input.publishImmediately !== false
  const metadata = user.user_metadata as Record<string, string> | undefined
  const fallbackUsername =
    metadata?.full_name?.trim() ||
    metadata?.name?.trim() ||
    metadata?.user_name?.trim() ||
    metadata?.username?.trim() ||
    (user.email ? user.email.split("@")[0]?.trim() : "") ||
    null

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle()

  const username =
    (existingProfile as { username?: string | null } | null)?.username?.trim() ||
    fallbackUsername

  // Ensure the profile row exists and keep onboarding data in sync
  // with both the default_* fields and the base profile fields.
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        username,
        default_role: defaultRole,
        default_engine: defaultEngine,
        default_language: defaultLanguage,
        role: defaultRole,
        engine: defaultEngine,
        language: defaultLanguage,
        discord_username: discordUsername,
        portfolio_url: portfolioUrl,
        portfolio_link: portfolioUrl,
        has_completed_onboarding: true,
        onboarding_version: CURRENT_ONBOARDING_VERSION,
      },
      { onConflict: "id" }
    )

  if (error) {
    return { success: false, error: error.message }
  }

  if (!publishImmediately) {
    return { success: true }
  }

  try {
    const { error: postError } = await supabase.from("availability_posts").insert({
      user_id: user.id,
      role: defaultRole,
      engine: defaultEngine,
      language: defaultLanguage,
      portfolio_link: portfolioUrl,
      availability: "Ready for upcoming game jams!",
      jam_style: null,
      experience: "regular",
      bio: "Open to joining upcoming game jams.",
    })

    if (postError) {
      return {
        success: true,
        warning: "Your onboarding was completed, but we could not publish your profile automatically yet.",
      }
    }
  } catch {
    return {
      success: true,
      warning: "Your onboarding was completed, but we could not publish your profile automatically yet.",
    }
  }

  return { success: true }
}
