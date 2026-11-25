/**
 * Destination after a successful publish. Dated and undated (flex) squads
 * share this path: the jam window must not change where we navigate.
 */
export function hrefAfterSuccessfulTeamCreate(teamId: string | null | undefined): string {
  const id = typeof teamId === "string" ? teamId.trim() : ""
  if (!id) return "/dashboard"
  return `/dashboard?flow=new-team&id=${encodeURIComponent(id)}`
}