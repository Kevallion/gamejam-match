import type { ReactNode } from "react"
import { SignedInAppShell } from "@/components/app-shell/signed-in-app-shell"
import { loadSignedInAppSession } from "@/lib/app-shell-account"
import { getCurrentUser } from "@/lib/supabase/get-current-user"

/**
 * Onboarding routes (currently /create-profile) stay outside app/(app)
 * so they are not redirected back here. Signed-in visitors still get the
 * same shell chrome (logo, search, nav). Signed-out visitors keep the
 * site page chrome. This layout never redirects.
 */
export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()
  if (!user) {
    return children
  }

  const { account } = await loadSignedInAppSession(user)
  return <SignedInAppShell account={account}>{children}</SignedInAppShell>
}
