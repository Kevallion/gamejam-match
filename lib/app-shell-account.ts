import type { User } from "@supabase/supabase-js"
import type { AppShellAccount } from "@/components/app-shell/app-shell"
import { createClient } from "@/lib/supabase/server"
import { isOnboardingComplete } from "@/lib/onboarding-guard"

export type SignedInAppSession = {
  account: AppShellAccount
  hasCompletedOnboarding: boolean
}

/** Light profile fields for the persistent app shell. Explicit columns only. */
export async function loadSignedInAppSession(user: User): Promise<SignedInAppSession> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select("username, avatar_url, xp, current_title, has_completed_onboarding")
    .eq("id", user.id)
    .maybeSingle()

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const metaName = [meta.user_name, meta.full_name, meta.name]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .find((value) => value.length > 0)

  return {
    account: {
      userId: user.id,
      displayName: data?.username?.trim() || metaName || "Jammer",
      avatarUrl: data?.avatar_url ?? null,
      xp: typeof data?.xp === "number" ? data.xp : 0,
      currentTitle: data?.current_title ?? null,
    },
    hasCompletedOnboarding: isOnboardingComplete(data?.has_completed_onboarding),
  }
}

export async function loadAppShellAccount(user: User): Promise<AppShellAccount> {
  const { account } = await loadSignedInAppSession(user)
  return account
}