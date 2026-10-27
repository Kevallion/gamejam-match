import type { SupabaseClient } from "@supabase/supabase-js"

function isMissingRelation(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  const message = error.message ?? ""
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /profile_discord_usernames|schema cache|could not find the table/i.test(message)
  )
}

/** Own Discord handle: side table first, profiles column if that table is not migrated yet. */
export async function readOwnDiscordUsername(
  client: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const side = await client
    .from("profile_discord_usernames")
    .select("discord_username")
    .eq("user_id", userId)
    .maybeSingle()

  if (!side.error) {
    const value = (side.data?.discord_username as string | null | undefined)?.trim()
    return value || null
  }

  if (!isMissingRelation(side.error)) {
    const fallback = await client
      .from("profiles")
      .select("discord_username")
      .eq("id", userId)
      .maybeSingle()
    if (fallback.error) return null
    const value = (fallback.data?.discord_username as string | null | undefined)?.trim()
    return value || null
  }

  const fallback = await client
    .from("profiles")
    .select("discord_username")
    .eq("id", userId)
    .maybeSingle()
  if (fallback.error) return null
  const value = (fallback.data?.discord_username as string | null | undefined)?.trim()
  return value || null
}

/**
 * Discord handles the current user is allowed to see (self or shared squad).
 * Falls back to profiles.discord_username only when the side table is absent.
 */
export async function fetchTeammateDiscordUsernames(
  client: SupabaseClient,
  userIds: string[],
): Promise<Record<string, string | null>> {
  const ids = [...new Set(userIds.filter(Boolean))]
  if (ids.length === 0) return {}

  const { data, error } = await client
    .from("profile_discord_usernames")
    .select("user_id, discord_username")
    .in("user_id", ids)

  if (!error) {
    const map: Record<string, string | null> = {}
    for (const row of data ?? []) {
      const userId = row.user_id as string | null
      if (!userId) continue
      const value = (row.discord_username as string | null | undefined)?.trim() || null
      map[userId] = value
    }
    return map
  }

  if (!isMissingRelation(error)) {
    console.error("[fetchTeammateDiscordUsernames]", error.message)
    return {}
  }

  const fallback = await client.from("profiles").select("id, discord_username").in("id", ids)
  if (fallback.error) return {}
  const map: Record<string, string | null> = {}
  for (const row of fallback.data ?? []) {
    const userId = row.id as string | null
    if (!userId) continue
    map[userId] = (row.discord_username as string | null | undefined)?.trim() || null
  }
  return map
}

/** Best-effort mirror. Ignores a missing table so settings still save on profiles. */
export async function upsertOwnDiscordUsername(
  client: SupabaseClient,
  userId: string,
  discordUsername: string | null,
): Promise<void> {
  const value = discordUsername?.trim() || null
  const { error } = await client.from("profile_discord_usernames").upsert(
    {
      user_id: userId,
      discord_username: value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )
  if (error && !isMissingRelation(error)) {
    console.error("[upsertOwnDiscordUsername]", error.message)
  }
}
