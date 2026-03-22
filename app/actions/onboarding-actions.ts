"use server"

import { createClient } from "@/lib/supabase/server"
import { sendEmailNotification } from "@/lib/mail"
import { CURRENT_ONBOARDING_VERSION } from "@/lib/onboarding"

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
): Promise<{ success: boolean; error?: string; warning?: string }> {
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

  // Fire-and-forget welcome email once onboarding is marked as completed.
  try {
    const to = user.email
    if (to) {
      const displayName =
        discordUsername ||
        chosenUsername ||
        (to ? to.split("@")[0]?.trim() : "") ||
        "there"

      const subject = "Welcome to the crew 🚀 (and why I built this)"

      const body = `Hey ${displayName}!

First of all, welcome to GameJam Crew. I'm really glad you're here.

Since you just joined, I wanted to take a quick minute to introduce myself and tell you why this platform exists.

I’m the solo developer behind GameJam Crew. I built this tool for one simple reason: getting into the game industry and finding a team shouldn't be a nightmare.

As a former game dev student who had to drop out due to a lack of funds, I know how frustrating the "experience paradox" is. You need a portfolio to get a team, but you need a team to build a portfolio. For too long, the only way to find jam partners was to scroll endlessly through chaotic Discord servers, hoping to get noticed.

I got tired of it, so I coded this platform.

I truly believe that the future of gaming doesn't belong to 1,000-person AAA studios. It belongs to small, passionate teams: developers, artists, and musicians, who come together to build games with complete creative freedom.

GameJamCrew is here to help you find your squad, build your portfolio, and launch your career.

So, what's next?
The best way to start is to complete your Jammer profile so teams can find you.

But before you do that, I have a quick question for you (just hit "reply" to this email, I read every single one!):
👉 What is your main role (Coder, 2D Artist, Audio...) and what is the #1 thing you struggle with when participating in a Game Jam?

Let's build some great games together.

Cheers,
Founder of GameJam Crew`

      const html = `<pre>${body}</pre>`

      void sendEmailNotification(to, subject, html, {
        // From = identité perso de Wisllor (override RESEND_FROM_EMAIL uniquement pour cet email)
        from: 'Wisllor | GameJam Crew <notifications@gamejamcrew.com>',
      })
    }
  } catch {
    // Silent failure: email should never block onboarding.
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
