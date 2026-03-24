"use server"

import { createClient } from "@/lib/supabase/server"
import { sendEmailWithLayout } from "@/lib/mail"
import { escapeHtml } from "@/lib/mail-template"
import { CURRENT_ONBOARDING_VERSION } from "@/lib/onboarding"
import { awardXP } from "@/lib/gamification"
import type { GamificationRewardSummary } from "@/lib/gamification-reward-types"
import { gamificationRewardHasToast } from "@/lib/gamification-reward-types"

export type OnboardingGamificationStep = {
  action: string
  reward: GamificationRewardSummary
}

/**
 * Persists onboarding preferences for the current user
 * and marks the onboarding as completed.
 */
export type CompleteOnboardingInput = {
  username?: string | null
  defaultRole?: string | null
  defaultEngine?: string | null
  defaultLanguage?: string | null
  discordUsername?: string | null
  portfolioUrl?: string | null
  publishImmediately?: boolean
}

export async function completeOnboarding(
  input: CompleteOnboardingInput
): Promise<{ success: boolean; error?: string; warning?: string; gamification?: OnboardingGamificationStep[] }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "User not authenticated" }
  }

  const chosenUsername = input.username?.trim() ?? ""
  if (!chosenUsername) {
    return { success: false, error: "Username is required." }
  }
  if (chosenUsername.length < 3) {
    return { success: false, error: "Username must be at least 3 characters." }
  }

  const defaultRole = input.defaultRole?.trim() || null
  const defaultEngine = input.defaultEngine?.trim() || null
  const defaultLanguage = input.defaultLanguage?.trim() || null
  const discordUsername = input.discordUsername?.trim() || null
  const portfolioUrl = input.portfolioUrl?.trim() || null
  const publishImmediately = input.publishImmediately !== false

  const { data: profileBefore } = await supabase
    .from("profiles")
    .select("has_completed_onboarding")
    .eq("id", user.id)
    .maybeSingle()

  const firstTimeCompletingOnboarding = profileBefore?.has_completed_onboarding !== true

  // Ensure the profile row exists and keep onboarding data in sync
  // with both the default_* fields and the base profile fields.
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        username: chosenUsername,
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

  const gamificationSteps: OnboardingGamificationStep[] = []

  if (firstTimeCompletingOnboarding) {
    const gamification = await awardXP(user.id, "COMPLETE_PROFILE")
    if (!gamification.ok) {
      console.error("[gamification] COMPLETE_PROFILE:", gamification.error)
    } else if (gamification.reward && gamificationRewardHasToast(gamification.reward)) {
      gamificationSteps.push({ action: "COMPLETE_PROFILE", reward: gamification.reward })
    }
  }

  // Fire-and-forget welcome email once onboarding is marked as completed.
  try {
    const to = user.email
    if (to) {
      const displayName =
        discordUsername ||
        chosenUsername ||
        (to ? to.split("@")[0]?.trim() : "") ||
        "there"

      const safeName = escapeHtml(displayName)
      const subject = "Welcome to the crew 🚀 (and why I built this)"

      const P =
        "margin:0 0 14px;color:#4b5563;font-size:16px;line-height:1.65;"

      const contentHtml = `
        <p style="${P}">Hey ${safeName}!</p>
        <p style="${P}">First of all, welcome to GameJamCrew. I'm really glad you're here.</p>
        <p style="${P}">Since you just joined, I wanted to take a quick minute to introduce myself and tell you why this platform exists.</p>
        <p style="${P}">I'm the solo developer behind GameJamCrew. I built this tool for one simple reason: getting into the game industry and finding a team shouldn't be a nightmare.</p>
        <p style="${P}">As a former game dev student who had to drop out due to a lack of funds, I know how frustrating the "experience paradox" is. You need a portfolio to get a team, but you need a team to build a portfolio. For too long, the only way to find jam partners was to scroll endlessly through chaotic Discord servers, hoping to get noticed.</p>
        <p style="${P}">I got tired of it, so I coded this platform.</p>
        <p style="${P}">I truly believe that the future of gaming doesn't belong to 1,000-person AAA studios. It belongs to small, passionate teams: developers, artists, and musicians, who come together to build games with complete creative freedom.</p>
        <p style="${P}">GameJamCrew is here to help you find your squad, build your portfolio, and launch your career.</p>
        <p style="${P}"><strong style="color:#1f2937;">So, what's next?</strong><br/>The best way to start is to complete your Jammer profile so teams can find you.</p>
        <p style="${P}">But before you do that, I have a quick question for you (just hit "reply" to this email, I read every single one!):<br/>👉 What is your main role (Coder, 2D Artist, Audio...) and what is the #1 thing you struggle with when participating in a Game Jam?</p>
        <p style="${P}">Let's build some great games together.</p>
        <p style="margin:0;color:#9ca3af;font-size:14px;line-height:1.5;">Cheers,<br/>Founder of GameJamCrew</p>
      `

      void sendEmailWithLayout(
        to,
        subject,
        "Welcome to the crew 🚀",
        contentHtml,
        {
          from: "Wisllor | GameJamCrew <notifications@gamejamcrew.com>",
        },
      )
    }
  } catch {
    // Silent failure: email should never block onboarding.
  }

  if (!publishImmediately) {
    return {
      success: true,
      ...(gamificationSteps.length > 0 ? { gamification: gamificationSteps } : {}),
    }
  }

  try {
    const { data: newPost, error: postError } = await supabase
      .from("availability_posts")
      .insert({
        user_id: user.id,
        role: defaultRole,
        engine: defaultEngine,
        language: defaultLanguage,
        portfolio_link: portfolioUrl,
        availability: "Ready for upcoming game jams!",
        jam_style: null,
        experience: "regular",
        bio: "Open to joining upcoming game jams.",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id")
      .single()

    if (postError) {
      return {
        success: true,
        warning: "Your onboarding was completed, but we could not publish your profile automatically yet.",
        ...(gamificationSteps.length > 0 ? { gamification: gamificationSteps } : {}),
      }
    }

    if (newPost?.id) {
      const postXp = await awardXP(user.id, "POST_ANNOUNCEMENT")
      if (!postXp.ok) {
        console.error("[gamification] POST_ANNOUNCEMENT (onboarding):", postXp.error)
      } else if (postXp.reward && gamificationRewardHasToast(postXp.reward)) {
        gamificationSteps.push({ action: "POST_ANNOUNCEMENT", reward: postXp.reward })
      }
    }
  } catch {
    return {
      success: true,
      warning: "Your onboarding was completed, but we could not publish your profile automatically yet.",
      ...(gamificationSteps.length > 0 ? { gamification: gamificationSteps } : {}),
    }
  }

  return {
    success: true,
    ...(gamificationSteps.length > 0 ? { gamification: gamificationSteps } : {}),
  }
}
