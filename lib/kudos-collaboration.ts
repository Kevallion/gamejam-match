import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * True if both users appear in `team_members` for at least one common `team_id`.
 */
async function squadIdsForUser(supabase: SupabaseClient, userId: string): Promise<Set<string>> {
  const [members, owned] = await Promise.all([
    supabase.from("team_members").select("team_id").eq("user_id", userId),
    supabase.from("teams").select("id").eq("user_id", userId),
  ])
  const ids = new Set<string>()
  if (!members.error) {
    for (const row of members.data ?? []) {
      if (row.team_id) ids.add(row.team_id as string)
    }
  }
  if (!owned.error) {
    for (const row of owned.data ?? []) {
      if (row.id) ids.add(row.id as string)
    }
  }
  return ids
}

/**
 * True when both jammers are on the same squad right now.
 * Squad owners count even when they are not also listed in `team_members`.
 */
export async function usersShareATeam(
  supabase: SupabaseClient,
  userIdA: string,
  userIdB: string,
): Promise<boolean> {
  if (!userIdA || !userIdB || userIdA === userIdB) return false

  const [aIds, bIds] = await Promise.all([
    squadIdsForUser(supabase, userIdA),
    squadIdsForUser(supabase, userIdB),
  ])
  for (const id of aIds) {
    if (bIds.has(id)) return true
  }
  return false
}
