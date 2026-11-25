/**
 * Navigate after a Server Action has resolved.
 *
 * In the App Router, router.push() after a Server Action can be cancelled
 * when Next.js refreshes the current route. PROD-QA1 / DS-QA9: toasts fired
 * after createTeam, but a dated publish stayed on /create-team, while a
 * flex (no dates) publish redirected. A re-render of the review step can
 * throw if date-fns format() sees a corrupted Date after the action, which
 * aborts a soft navigation. A full assign() is not cancelled that way, and
 * review labels must use formatDateSafe / formatJamDateRangeReview.
 */
export function navigateAfterServerAction(href: string): void {
  if (typeof window === "undefined") return
  if (!href.startsWith("/") || href.startsWith("//")) return
  window.location.assign(href)
}
