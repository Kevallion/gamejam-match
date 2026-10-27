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
 * Fetch Discord invite for a squad the current user can access
 * (`team_discord_links` is member/owner-only via RLS).
 */
export async function fetchTeamDiscordLink(
  supabase: SupabaseClient,
  teamId: string,
): Promise<string | null> {
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
