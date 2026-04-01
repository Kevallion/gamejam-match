import type { EnrichedNotificationRow } from "@/lib/notifications-enriched"

/** Cible principale « Voir les détails » (lien `link` en base sinon dérivé). */
export function getNotificationDetailPath(
  n: Pick<EnrichedNotificationRow, "type" | "link" | "join_request_id" | "team_id">,
): string {
  if (n.link && n.link.startsWith("/")) return n.link
  if (n.join_request_id && n.type === "team_invitation") {
    return `/invitation/${n.join_request_id}`
  }
  if (n.join_request_id && n.type === "application_received") {
    return `/dashboard?tab=inbox&highlightRequest=${n.join_request_id}`
  }
  if (n.team_id) return `/teams/${n.team_id}`
  return "/dashboard?tab=inbox"
}

/** Lien gestion équipe si on a un `team_id` (capitaine / membre). */
export function getNotificationTeamManagePath(teamId: string | null | undefined): string | null {
  if (!teamId) return null
  return `/teams/${teamId}/manage`
}
