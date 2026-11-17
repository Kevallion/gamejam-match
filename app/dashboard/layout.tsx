import type { ReactNode } from "react"

/**
 * Signed-in dashboard shell layout.
 * Visual chrome (Bento Nav 2 hotbar) is provided by AppShell inside DashboardClient.
 * Legacy sidebar / rail / mobile-tab components remain unused by this shell.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children
}
