import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { Footer } from "@/components/footer"
import { SignedInAppShell } from "@/components/app-shell/signed-in-app-shell"
import { loadSignedInAppSession } from "@/lib/app-shell-account"
import { getCurrentUser } from "@/lib/supabase/get-current-user"

/**
 * Web-app routes: dashboard, Find Members, teams, jammer, Settings, etc.
 * Signed-in visitors get the persistent AppShell (hotbar, Rewards, Inbox, Me).
 * Signed-out visitors keep the site header (per page) and footer.
 * The session is read on the server so the wrong chrome is not painted first.
 *
 * ONB-3: signed-in accounts that have not finished onboarding are sent to
 * /create-profile. That page lives outside this layout, so there is no loop.
 * Onboarded accounts are never redirected.
 */
export default async function AppRoutesLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="flex min-h-svh flex-col">
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <Footer />
      </div>
    )
  }

  const { account, hasCompletedOnboarding } = await loadSignedInAppSession(user)
  if (!hasCompletedOnboarding) {
    redirect("/create-profile")
  }

  return <SignedInAppShell account={account}>{children}</SignedInAppShell>
}