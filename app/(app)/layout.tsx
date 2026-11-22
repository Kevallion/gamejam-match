import type { ReactNode } from "react"
import { Footer } from "@/components/footer"
import { SignedInAppShell } from "@/components/app-shell/signed-in-app-shell"
import { loadAppShellAccount } from "@/lib/app-shell-account"
import { createClient } from "@/lib/supabase/server"

/**
 * Web-app routes: dashboard, Find Members, teams, jammer, Settings, etc.
 * Signed-in visitors get the persistent AppShell (hotbar, Rewards, Inbox, Me).
 * Signed-out visitors keep the site header (per page) and footer.
 * The session is read on the server so the wrong chrome is not painted first.
 */
export default async function AppRoutesLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex min-h-svh flex-col">
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <Footer />
      </div>
    )
  }

  const account = await loadAppShellAccount(user)
  return <SignedInAppShell account={account}>{children}</SignedInAppShell>
}
