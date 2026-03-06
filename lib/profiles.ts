import { supabase } from "./supabase"

export type ProfileDisplay = {
  username: string
  avatar_url: string | null
  discord_username?: string | null
}

/**
 * Récupère les profils (username, avatar_url) pour une liste d'IDs utilisateur.
 * Source unique de vérité : table profiles.
 * Normalise avatar_url (trim, empty string → null) pour cohérence d'affichage partout.
 */
export async function fetchProfilesMap(
  userIds: string[]
): Promise<Record<string, ProfileDisplay>> {
  const uniqueIds = Array.from(new Set(userIds)).filter(Boolean)
  if (uniqueIds.length === 0) return {}

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, discord_username")
    .in("id", uniqueIds)

  if (error) {
    console.error("[fetchProfilesMap] Error:", error.message)
    return {}
  }

  const map: Record<string, ProfileDisplay> = {}
  for (const p of data ?? []) {
    if (!p.id) continue
    const rawAvatar = (p.avatar_url ?? "").trim() || null
    map[p.id] = {
      username: (p.username ?? "").trim() || "",
      avatar_url: rawAvatar,
      discord_username: (p as { discord_username?: string | null }).discord_username ?? null,
    }
  }
  return map
}
