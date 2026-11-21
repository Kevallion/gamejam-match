import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Recruited members per squad (rows of team_members; the captain is not
 * counted, the UI adds 1). Uses the S7 RPC get_team_member_counts, readable
 * without a session and returning no names or user ids. Empty map on error
 * (RPC not deployed yet, network), so callers keep their previous behaviour.
 */
export async function fetchTeamMemberCounts(
  client: SupabaseClient,
  teamIds: string[],
): Promise<Record<string, number>> {
  const ids = Array.from(new Set(teamIds.filter(Boolean)))
  if (ids.length === 0) return {}
  const { data, error } = await client.rpc("get_team_member_counts", { p_team_ids: ids })
  if (error || !Array.isArray(data)) return {}
  const counts: Record<string, number> = {}
  for (const row of data as { team_id?: string | null; member_count?: number | null }[]) {
    if (row.team_id) counts[row.team_id] = Number(row.member_count ?? 0)
  }
  return counts
}

/**
 * Anonymous stand-ins for a squad's members when team_members itself is not
 * readable (signed-out visitors): only the count matters, no role, no user.
 */
export function anonymousMemberRows(teamId: string, count: number) {
  return Array.from({ length: Math.max(0, count) }, (_, index) => ({
    id: `${teamId}:${index}`,
    role: null as string | null,
    user_id: null as string | null,
  }))
}
