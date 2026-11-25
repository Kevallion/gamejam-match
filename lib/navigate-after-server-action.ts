/**
 * Navigate after a Server Action has resolved.
 *
 * In the App Router, router.push() after a Server Action can be cancelled
 * when Next.js refreshes the current route from the action result. That is
 * the likely cause of PROD-QA1: toasts fired after createTeam, but the
 * browser stayed on /create-team instead of /dashboard?flow=new-team&id=…
 * (the same client-side push worked on the HOTFIX-1 preview).
 *
 * A full navigation cannot be swallowed by that refresh.
 */
export function navigateAfterServerAction(href: string): void {
  if (typeof window === "undefined") return
  if (!href.startsWith("/") || href.startsWith("//")) return
  window.location.assign(href)
}
