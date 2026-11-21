import type { SupabaseClient } from "@supabase/supabase-js"

/** Nested embed shape from PostgREST `teams(..., team_discord_links(discord_link))`. */
export type TeamDiscordEmbed =
  | { discord_link?: string | null }
  | { discord_link?: string | null }[]
  | null
  | undefined

export function discordLinkFromEmbed(embed: TeamDiscordEmbed): string | null {
  if (!embed) return null
  const row = Array.isArray(embed) ? embed[0] : embed
  const link = row?.discord_link?.trim()
  return link || null
}

/**
 * Columns of `teams` readable through the API. `teams.discord_link` (legacy copy
 * of the invite) is not readable by anon/authenticated since S7, so never use
 * `select("*")` on teams.
 */
export const TEAMS_READABLE_COLUMNS =
  "id, user_id, team_name, game_name, description, engine, language, looking_for, created_at, expires_at, experience_required, team_vibe, jam_id, jam_start_date, jam_end_date, jam_completion_xp_claimed" as const

function isMissingFunction(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  return (
    error.code === "42883" ||
    error.code === "PGRST202" ||
    /get_team_discord_link|could not find the function/i.test(error.message ?? "")
  )
}

/**
 * Fetch Discord invite for a squad the current user can access (owner or
 * member). The check runs in the database (get_team_discord_link, SECURITY
 * DEFINER); falls back to the member-only `team_discord_links` table until the
 * S7 migration is applied.
 */
export async function fetchTeamDiscordLink(
  supabase: SupabaseClient,
  teamId: string,
): Promise<string | null> {
  const rpc = await supabase.rpc("get_team_discord_link", { p_team_id: teamId })
  if (!rpc.error) {
    const link = typeof rpc.data === "string" ? rpc.data.trim() : ""
    return link || null
  }
  if (!isMissingFunction(rpc.error)) {
    // Signed-out viewers are not allowed to call it: no link.
    return null
  }

  const { data, error } = await supabase
    .from("team_discord_links")
    .select("discord_link")
    .eq("team_id", teamId)
    .maybeSingle()

  if (error) {
    console.error("[fetchTeamDiscordLink]", error.message)
    return null
  }
  const link = (data?.discord_link as string | null | undefined)?.trim()
  return link || null
}

/**
 * Upsert or clear Discord invite for a squad owned by the current user.
 */
export async function upsertTeamDiscordLink(
  supabase: SupabaseClient,
  teamId: string,
  discordLink: string | null,
): Promise<{ error: string | null }> {
  const trimmed = discordLink?.trim() || null

  if (!trimmed) {
    const { error } = await supabase
      .from("team_discord_links")
      .delete()
      .eq("team_id", teamId)
    return { error: error?.message ?? null }
  }

  const { error } = await supabase.from("team_discord_links").upsert(
    {
      team_id: teamId,
      discord_link: trimmed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "team_id" },
  )
  return { error: error?.message ?? null }
}
