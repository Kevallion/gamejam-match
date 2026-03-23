import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * True if both users appear in `team_members` for at least one common `team_id`.
 */
export async function usersShareATeam(
  supabase: SupabaseClient,
  userIdA: string,
  userIdB: string,
): Promise<boolean> {
  if (!userIdA || !userIdB || userIdA === userIdB) return false

  const { data: aRows, error: aErr } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", userIdA)

  if (aErr || !aRows?.length) return false

  const teamIds = [...new Set(aRows.map((r) => r.team_id).filter(Boolean))] as string[]
  if (teamIds.length === 0) return false

  const { data: overlap, error: bErr } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", userIdB)
    .in("team_id", teamIds)
    .limit(1)

  if (bErr || !overlap?.length) return false
  return true
}
