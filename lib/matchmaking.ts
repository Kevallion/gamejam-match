import { fetchProfilesMap } from "@/lib/profiles"
import { supabase } from "@/lib/supabase"

export type SuggestedPlayer = {
  availabilityPostId: string
  userId: string
  username: string
  avatarUrl: string | null
  role: string
  engine: string
  /** Niveau d’expérience affiché (colonne `experience` sur l’annonce). */
  experience: string
  /** Langue parlée (colonne `language` sur l’annonce). */
  language: string
  createdAt: string
}

export type RecommendedTeam = {
  id: string
  team_name: string
  game_name: string
  engine: string
  description: string
  looking_for: unknown
  created_at: string
}

const SUGGESTED_PLAYERS_FETCH_WINDOW = 48
const RECOMMENDED_TEAMS_FETCH_WINDOW = 80

function normalizeEngine(engine: string | null | undefined): string {
  return (engine ?? "").trim()
}

/**
 * Moteur « non contraignant » : vide, any/none (insensible à la casse).
 */
function isEngineUnspecifiedForMatchmaking(engine: string | null | undefined): boolean {
  const t = normalizeEngine(engine)
  if (t === "") return true
  const lower = t.toLowerCase()
  return lower === "any" || lower === "none"
}

/**
 * Correspondance moteur souple : équipe ou joueur sans moteur précis → match ;
 * sinon égalité (insensible à la casse).
 */
function enginesLenientMatch(
  playerEngine: string | null | undefined,
  teamEngine: string | null | undefined,
): boolean {
  if (isEngineUnspecifiedForMatchmaking(teamEngine)) return true
  if (isEngineUnspecifiedForMatchmaking(playerEngine)) return true
  return normalizeEngine(playerEngine).toLowerCase() === normalizeEngine(teamEngine).toLowerCase()
}

function parseLookingForRoleKeys(raw: unknown): string[] {
  type Entry = { role?: string | null }
  let parsed: Entry[] = []
  try {
    parsed = Array.isArray(raw)
      ? (raw as Entry[])
      : (JSON.parse(typeof raw === "string" ? raw : "[]") as Entry[])
  } catch {
    return []
  }
  return parsed.map((e) => (e.role ?? "").trim().toLowerCase()).filter(Boolean)
}

/** L’équipe cherche au moins un des rôles du joueur (strict). */
function teamNeedsAnyPlayerRole(teamLookingFor: unknown, playerRoles: string[]): boolean {
  const needed = parseLookingForRoleKeys(teamLookingFor)
  if (needed.length === 0) return false
  const playerSet = new Set(playerRoles.map((r) => r.trim().toLowerCase()).filter(Boolean))
  if (playerSet.size === 0) return false
  return needed.some((r) => playerSet.has(r))
}

function mapPostsToSuggestedPlayers(
  rows: {
    id: string
    user_id: string
    role: string | null
    engine: string | null
    experience: string | null
    language: string | null
    created_at: string | null
    username: string | null
    avatar_url: string | null
  }[],
  profilesById: Awaited<ReturnType<typeof fetchProfilesMap>>,
): SuggestedPlayer[] {
  return rows.map((row) => {
    const prof = profilesById[row.user_id]
    const username =
      (prof?.username ?? "").trim() ||
      (row.username ?? "").trim() ||
      "Anonymous"
    const avatarUrl =
      (prof?.avatar_url ?? "").trim() ||
      (row.avatar_url ?? "").trim() ||
      null

    return {
      availabilityPostId: row.id,
      userId: row.user_id,
      username,
      avatarUrl,
      role: row.role ?? "",
      engine: row.engine ?? "",
      experience: row.experience ?? "",
      language: row.language ?? "",
      createdAt: row.created_at ?? "",
    }
  })
}

/**
 * Suggère jusqu’à 3 annonces (joueurs) dont le rôle est dans `teamLookingForRoles` (strict)
 * et le moteur est compatible (souple). Les plus récentes d’abord.
 */
export async function getSuggestedPlayers(
  teamLookingForRoles: string[],
  teamEngine: string | null | undefined,
): Promise<{ players: SuggestedPlayer[]; error: string | null }> {
  const roles = teamLookingForRoles.map((r) => r.trim().toLowerCase()).filter(Boolean)

  if (roles.length === 0) {
    return { players: [], error: null }
  }

  // Since S7 posts no longer carry a copy of the profile: match on the
  // published profile, then keep the jammers that have an active post.
  const safeRoles = roles.filter((r) => /^[a-z0-9_-]+$/.test(r))
  if (safeRoles.length === 0) {
    return { players: [], error: null }
  }
  const roleList = safeRoles.join(",")
  const { data: roleProfiles, error: roleProfilesError } = await supabase
    .from("profiles")
    .select("id, role, default_role, main_role, engine, default_engine, experience, experience_level, language, default_language")
    .or(`role.in.(${roleList}),default_role.in.(${roleList}),main_role.in.(${roleList})`)
  if (roleProfilesError) {
    console.error("[getSuggestedPlayers:profiles]", roleProfilesError.message)
    return { players: [], error: roleProfilesError.message }
  }
  const profileFieldsById = new Map(
    (roleProfiles ?? []).map((p) => {
      const pick = (...values: (string | null | undefined)[]) =>
        values.map((v) => v?.trim()).find((v) => Boolean(v)) ?? null
      const roleKey =
        [p.role, p.default_role, p.main_role]
          .map((v) => (v as string | null | undefined)?.trim().toLowerCase())
          .find((v) => Boolean(v && safeRoles.includes(v))) ?? null
      return [
        p.id as string,
        {
          role: roleKey,
          engine: pick(p.engine, p.default_engine),
          experience: pick(p.experience, p.experience_level),
          language: pick(p.language, p.default_language),
        },
      ] as const
    }),
  )
  const candidateIds = [...profileFieldsById.keys()]
  if (candidateIds.length === 0) {
    return { players: [], error: null }
  }

  const { data: rawPosts, error: postsError } = await supabase
    .from("availability_posts")
    .select("id, user_id, created_at")
    .in("user_id", candidateIds)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(SUGGESTED_PLAYERS_FETCH_WINDOW)

  const posts = (rawPosts ?? []).map((post) => {
    const fields = profileFieldsById.get(post.user_id as string)
    return {
      id: post.id as string,
      user_id: post.user_id as string,
      created_at: (post.created_at as string | null) ?? null,
      role: fields?.role ?? null,
      engine: fields?.engine ?? null,
      experience: fields?.experience ?? null,
      language: fields?.language ?? null,
      username: null,
      avatar_url: null,
    }
  })

  if (postsError) {
    console.error("[getSuggestedPlayers]", postsError.message)
    return { players: [], error: postsError.message }
  }

  const rows = posts ?? []
  const engineOk = rows.filter((row) => enginesLenientMatch(row.engine, teamEngine)).slice(0, 3)

  const userIds = engineOk.map((r) => r.user_id).filter(Boolean)
  const profilesById = await fetchProfilesMap(userIds)
  const players = mapPostsToSuggestedPlayers(engineOk, profilesById)

  return { players, error: null }
}

/**
 * Suggère jusqu’à 3 équipes qui recherchent un des rôles du joueur (strict sur le rôle)
 * et dont le moteur est compatible avec celui du joueur (souple).
 *
 * `playerRoleOrRoles` peut être un rôle unique (`default_role`) ou plusieurs clés de rôle.
 */
export async function getRecommendedTeams(
  playerRoleOrRoles: string | string[],
  playerEngine: string | null | undefined,
): Promise<{ teams: RecommendedTeam[]; error: string | null }> {
  const roles = (Array.isArray(playerRoleOrRoles) ? playerRoleOrRoles : [playerRoleOrRoles])
    .map((r) => String(r).trim().toLowerCase())
    .filter(Boolean)
  if (roles.length === 0) {
    return { teams: [], error: null }
  }

  const { data, error } = await supabase
    .from("teams")
    .select("id, team_name, game_name, engine, description, looking_for, created_at")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(RECOMMENDED_TEAMS_FETCH_WINDOW)

  if (error) {
    console.error("[getRecommendedTeams]", error.message)
    return { teams: [], error: error.message }
  }

  const picked: RecommendedTeam[] = []
  for (const row of data ?? []) {
    if (!teamNeedsAnyPlayerRole(row.looking_for, roles)) continue
    if (!enginesLenientMatch(playerEngine, row.engine)) continue
    picked.push({
      id: row.id,
      team_name: row.team_name ?? "",
      game_name: row.game_name ?? "",
      engine: row.engine ?? "",
      description: row.description ?? "",
      looking_for: row.looking_for,
      created_at: row.created_at ?? "",
    })
    if (picked.length >= 3) break
  }

  return { teams: picked, error: null }
}
