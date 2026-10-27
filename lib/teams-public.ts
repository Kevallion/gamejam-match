/**
 * Columns safe to expose on public team listings (no Discord invite link).
 * Discord invites live in `team_discord_links` (member-only RLS).
 */
export const TEAMS_PUBLIC_COLUMNS =
  "id, user_id, team_name, game_name, description, needed_roles, created_at, engine, language, looking_for, expires_at, experience_required, team_vibe, jam_id, jam_completion_xp_claimed, jam_start_date, jam_end_date" as const

export const TEAMS_PUBLIC_WITH_MEMBERS = `${TEAMS_PUBLIC_COLUMNS}, team_members(id, role, user_id)` as const

/** Placeholder / junk jam labels that should not appear in the UI. */
const JAM_NAME_BLOCKLIST = new Set([
  "[suggest a project]",
  "suggest a project",
])

export function sanitizeJamDisplayName(raw: string | null | undefined): string {
  const trimmed = (raw ?? "").trim()
  if (!trimmed) return ""
  if (JAM_NAME_BLOCKLIST.has(trimmed.toLowerCase())) return "Open project"
  return trimmed
}
