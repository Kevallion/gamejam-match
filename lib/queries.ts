import { createClient } from "@/lib/supabase/client"
import { supabase } from "@/lib/supabase"
import {
  ENGINE_OPTIONS,
  EXPERIENCE_STYLES,
  JAM_STYLE_STYLES,
  LANGUAGE_OPTION_VALUE_ALIASES,
  LANGUAGE_OPTIONS,
  ROLE_STYLES,
} from "@/lib/constants"
import { levelFromTotalXp } from "@/lib/gamification-level"
import { kudosCountsMapFromRpcRows, type KudosCounts } from "@/lib/kudos"

/** Client navigateur Supabase (même type que `supabase` exporté par `@/lib/supabase`). */
export type GamejamSupabaseClient = ReturnType<typeof createClient>

/** Lignes brutes `join_requests` + `teams` pour le dashboard Inbox / Sent. */
export type DashboardIncomingApplicationRow = {
  id: string
  sender_id: string | null
  sender_name: string | null
  target_role: string | null
  message: string | null
  created_at: string
  teams?: { team_name?: string | null; user_id?: string | null }
}

export type DashboardIncomingInvitationRow = {
  id: string
  team_id: string
  target_role?: string | null
  message?: string | null
  teams?: {
    team_name?: string | null
    game_name?: string | null
    discord_link?: string | null
    engine?: string | null
    description?: string | null
    team_vibe?: string | null
    experience_required?: string | null
    external_jams?: { title?: string | null } | { title?: string | null }[] | null
  } | null
}

export type DashboardSentApplicationRow = {
  id: string
  status: string
  target_role?: string | null
  created_at?: string | null
  teams: { team_name?: string | null; discord_link?: string | null } | { team_name?: string | null; discord_link?: string | null }[] | null
}

/** Invitations envoyées par le propriétaire : `sender_id` en base = joueur invité. */
export type DashboardSentInvitationRow = {
  id: string
  status: string
  target_role?: string | null
  sender_id: string | null
  sender_name: string | null
  team_id: string
  created_at?: string | null
  teams?: { team_name?: string | null; discord_link?: string | null; user_id?: string | null }
}

export type DashboardJoinRequestsBundle = {
  incomingApplications: DashboardIncomingApplicationRow[]
  incomingInvitations: DashboardIncomingInvitationRow[]
  sentApplications: DashboardSentApplicationRow[]
  sentInvitations: DashboardSentInvitationRow[]
}

/**
 * Charge candidatures entrantes, invitations reçues, candidatures envoyées et invitations envoyées.
 * Les invitations utilisent `sender_id` = id du joueur invité ; les lignes « envoyées » par le capitaine
 * sont filtrées via `teams.user_id`.
 */
export async function fetchDashboardJoinRequests(
  userId: string,
  client: GamejamSupabaseClient = supabase,
): Promise<{ data: DashboardJoinRequestsBundle | null; error: string | null }> {
  const [
    incomingApplicationsRes,
    incomingInvitationsRes,
    sentApplicationsRes,
    sentInvitationsRes,
  ] = await Promise.all([
    client
      .from("join_requests")
      .select("*, target_role, teams!inner(team_name, user_id)")
      .eq("teams.user_id", userId)
      .eq("status", "pending")
      .eq("type", "application"),
    client
      .from("join_requests")
      .select(
        "id, team_id, status, target_role, message, teams(team_name, game_name, discord_link, engine, description, team_vibe, experience_required, external_jams(title))",
      )
      .eq("sender_id", userId)
      .eq("status", "pending")
      .eq("type", "invitation"),
    client
      .from("join_requests")
      .select("id, status, target_role, created_at, teams(team_name, discord_link)")
      .eq("sender_id", userId)
      .eq("type", "application")
      .order("created_at", { ascending: false }),
    client
      .from("join_requests")
      .select(
        "id, status, target_role, sender_id, sender_name, team_id, created_at, teams!inner(team_name, discord_link, user_id)",
      )
      .eq("type", "invitation")
      .eq("teams.user_id", userId)
      .order("created_at", { ascending: false }),
  ])

  const firstErr =
    incomingApplicationsRes.error?.message ||
    incomingInvitationsRes.error?.message ||
    sentApplicationsRes.error?.message ||
    sentInvitationsRes.error?.message

  if (firstErr) {
    console.error("[fetchDashboardJoinRequests]", firstErr)
    return { data: null, error: firstErr }
  }

  return {
    data: {
      incomingApplications: (incomingApplicationsRes.data ?? []) as DashboardIncomingApplicationRow[],
      incomingInvitations: (incomingInvitationsRes.data ?? []) as DashboardIncomingInvitationRow[],
      sentApplications: (sentApplicationsRes.data ?? []) as DashboardSentApplicationRow[],
      sentInvitations: (sentInvitationsRes.data ?? []) as DashboardSentInvitationRow[],
    },
    error: null,
  }
}

/** `team_id` où une invitation squad est déjà en attente pour ce joueur (`sender_id` = invité). */
export async function fetchPendingInvitationTeamIdsForInvitee(
  inviteeUserId: string,
  teamIds: string[],
  client: GamejamSupabaseClient = supabase,
): Promise<Set<string>> {
  if (teamIds.length === 0) return new Set()
  const { data, error } = await client
    .from("join_requests")
    .select("team_id")
    .eq("type", "invitation")
    .eq("sender_id", inviteeUserId)
    .eq("status", "pending")
    .in("team_id", teamIds)
  if (error) {
    console.error("[fetchPendingInvitationTeamIdsForInvitee]", error.message)
    return new Set()
  }
  return new Set((data ?? []).map((r) => r.team_id).filter(Boolean) as string[])
}

export async function hasPendingApplicationToTeam(
  applicantUserId: string,
  teamId: string,
  client: GamejamSupabaseClient = supabase,
): Promise<boolean> {
  const { data, error } = await client
    .from("join_requests")
    .select("id")
    .eq("team_id", teamId)
    .eq("sender_id", applicantUserId)
    .eq("type", "application")
    .eq("status", "pending")
    .limit(1)
  if (error) {
    console.error("[hasPendingApplicationToTeam]", error.message)
    return false
  }
  return (data?.length ?? 0) > 0
}

const SMART_MATCH_FETCH_LIMIT = 80
const SMART_MATCH_RESULT_CAP = 3

/**
 * Profil minimal pour le smart matchmaking côté client.
 * `main_role` est prévu pour une évolution du schéma ; aujourd’hui on utilise surtout `default_role`.
 */
export type SmartMatchUserProfile = {
  id: string
  main_role?: string | null
  default_role?: string | null
  profile_roles?: SmartMatchRoleInput[] | null
  /** Préférence moteur : aligner sur le profil (`default_engine` ou colonne `engine` si défaut vide). */
  default_engine?: string | null
  profile_engine?: string | null
  /** Équipes déjà possédées ou rejointes — à exclure des suggestions. */
  excludeTeamIds?: string[]
}

export type SmartMatchRoleInput = {
  role?: string | null
  experience_level?: string | null
  is_primary?: boolean | null
}

export type SmartRecommendedTeam = {
  id: string
  team_name: string
  matched_role: string
  role_label: string
  /** Moteur indiqué sur l’annonce d’équipe (`teams.engine`). */
  team_engine_label: string
  /** Vrai seulement si le moteur du profil et celui de l’annonce sont identiques (hors « any » / vide). */
  matches_your_engine: boolean
}

type TeamMatchRow = {
  id: string
  user_id: string
  team_name: string | null
  engine: string | null
  looking_for: unknown
  created_at: string | null
  expires_at: string | null
}

function norm(s: string | null | undefined): string {
  return (s ?? "").trim()
}

function parseRequiredRolesFromLookingFor(lookingFor: unknown): string[] {
  type Entry = { role?: string | null }
  let parsed: Entry[] = []
  try {
    parsed = Array.isArray(lookingFor)
      ? (lookingFor as Entry[])
      : (JSON.parse(typeof lookingFor === "string" ? lookingFor : "[]") as Entry[])
  } catch {
    return []
  }
  return parsed.map((e) => norm(e.role).toLowerCase()).filter(Boolean)
}

/** Rôles recherchés : équivalent produit de `required_roles` (à brancher en SQL si la colonne est ajoutée). */
function requiredRolesForTeam(row: TeamMatchRow): string[] {
  return parseRequiredRolesFromLookingFor(row.looking_for)
}

/** En recrutement : annonce active (`expires_at` > maintenant). Avec une colonne `status`, filtrer `recruiting` ici. */
function isRecruitingTeam(row: TeamMatchRow): boolean {
  const exp = row.expires_at
  if (!exp) return false
  return new Date(exp).getTime() > Date.now()
}

function resolvedUserEngine(p: SmartMatchUserProfile): string {
  const d = norm(p.default_engine).toLowerCase()
  if (d && d !== "any") return d
  const e = norm(p.profile_engine).toLowerCase()
  return e
}

/** Priorité : même moteur que la préférence profil (hors « any » / vide). */
function engineBoost(userEngineKey: string, teamEngine: string | null | undefined): number {
  const ue = userEngineKey
  const te = norm(teamEngine).toLowerCase()
  if (!ue || ue === "any" || !te || te === "any") return 0
  return ue === te ? 1 : 0
}

/** Affichage « même moteur que moi » : uniquement si les deux valeurs sont précises et égales. */
function enginesMatchProfileDisplay(
  userEngineKey: string,
  teamEngine: string | null | undefined,
): boolean {
  const ue = userEngineKey
  const te = norm(teamEngine).toLowerCase()
  if (!ue || ue === "any" || !te || te === "any") return false
  return ue === te
}

function roleLabel(roleKey: string): string {
  return ROLE_STYLES[roleKey]?.label ?? roleKey
}

function engineLabel(engineValue: string): string {
  const v = norm(engineValue).toLowerCase()
  const opt = ENGINE_OPTIONS.find((o) => o.value === v)
  return opt?.label ?? (norm(engineValue) || "their stack")
}

/**
 * Équipes en recrutement : annonce active (`expires_at`), optionnellement `status = 'recruiting'` si la colonne est peuplée,
 * et rôle du joueur présent dans `required_roles` ou dans les `role` de `looking_for`.
 * Classement : boost si `default_engine` aligné avec `teams.engine`, puis plus récent d’abord.
 */
export async function getRecommendedTeams(
  userProfile: SmartMatchUserProfile,
): Promise<{ teams: SmartRecommendedTeam[]; error: string | null }> {
  const normalizedProfileRoles = (userProfile.profile_roles ?? [])
    .map((role) => ({
      role: norm(role.role).toLowerCase(),
      is_primary: role.is_primary === true,
    }))
    .filter((role) => role.role.length > 0)
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
  const fallbackRole = norm(userProfile.main_role ?? userProfile.default_role).toLowerCase()
  const roleKeys = normalizedProfileRoles.map((role) => role.role)
  if (roleKeys.length === 0 && fallbackRole) {
    roleKeys.push(fallbackRole)
  }

  if (roleKeys.length === 0) {
    return { teams: [], error: null }
  }

  const exclude = new Set((userProfile.excludeTeamIds ?? []).filter(Boolean))
  const userEngineKey = resolvedUserEngine(userProfile)

  const { data, error } = await supabase
    .from("teams")
    .select("id, user_id, team_name, engine, looking_for, created_at, expires_at")
    .gt("expires_at", new Date().toISOString())
    .neq("user_id", userProfile.id)
    .order("created_at", { ascending: false })
    .limit(SMART_MATCH_FETCH_LIMIT)

  if (error) {
    console.error("[getRecommendedTeams]", error.message)
    return { teams: [], error: error.message }
  }

  const candidates: TeamMatchRow[] = []
  for (const row of (data ?? []) as TeamMatchRow[]) {
    if (exclude.has(row.id)) continue
    if (!isRecruitingTeam(row)) continue
    const needed = requiredRolesForTeam(row)
    if (!roleKeys.some((roleKey) => needed.includes(roleKey))) continue
    candidates.push(row)
  }

  candidates.sort((a, b) => {
    const boostDiff = engineBoost(userEngineKey, b.engine) - engineBoost(userEngineKey, a.engine)
    if (boostDiff !== 0) return boostDiff
    const tb = new Date(b.created_at ?? 0).getTime()
    const ta = new Date(a.created_at ?? 0).getTime()
    return tb - ta
  })

  const teams: SmartRecommendedTeam[] = candidates.slice(0, SMART_MATCH_RESULT_CAP).map((row) => {
    const needed = requiredRolesForTeam(row)
    const matchedRole = roleKeys.find((roleKey) => needed.includes(roleKey)) ?? roleKeys[0]
    return {
      id: row.id,
      team_name: norm(row.team_name) || "Unnamed squad",
      matched_role: matchedRole,
      role_label: roleLabel(matchedRole),
      team_engine_label: engineLabel(row.engine ?? ""),
      matches_your_engine: enginesMatchProfileDisplay(userEngineKey, row.engine),
    }
  })

  return { teams, error: null }
}

const AVAILABLE_PLAYERS_DEFAULT_LIMIT = 24

/** Keys allowed in language filters / URL `lang` — matches `LANGUAGE_OPTIONS` values stored in Postgres. */
const AVAILABLE_PLAYERS_LANGUAGE_KEYS = new Set<string>(LANGUAGE_OPTIONS.map((o) => o.value))

const LEGACY_EXPERIENCE_EQUIVALENTS: Record<string, string[]> = {
  junior: ["junior", "hobbyist"],
  regular: ["regular", "confirmed"],
  senior: ["senior", "expert"],
}

type AvailablePlayersPostRow = {
  id: string
  user_id: string
  availability: string | null
  role: string | null
  experience: string | null
  jam_style: string | null
  engine: string | null
  language: string | null
  bio: string | null
  portfolio_link: string | null
}

type AvailablePlayerProfile = {
  id: string
  username: string | null
  avatar_url: string | null
  jam_id: string | null
  xp: number | null
  current_title: string | null
  role: string | null
  experience: string | null
  experience_level: string | null
  jam_style: string | null
  engine: string | null
  language: string | null
  default_language?: string | null
  bio: string | null
  portfolio_link: string | null
  external_jams?:
    | { id: string; title: string | null; url: string | null }
    | { id: string; title: string | null; url: string | null }[]
    | null
}

export type AvailablePlayerListItem = {
  id: string
  username: string
  avatar_url: string | null
  role: {
    key?: string
    label: string
    emoji: string
    color: string
  }
  level: {
    label: string
    emoji: string
    color: string
  }
  jamStyle?: {
    label: string
    emoji: string
    color: string
  }
  engine: string
  bio: string
  language: string
  portfolio_link?: string
  availability?: string
  jam?: { title: string; url?: string | null }
  jammerTitle?: string | null
  jammerLevel?: number
  kudosCounts?: KudosCounts | null
  rawRole: string
  rawEngine: string
  rawLevel: string
  availabilityPostId: string
}

export type AvailablePlayersFilters = {
  searchQuery?: string
  role?: string
  engine?: string
  experience?: string
  /** Spoken language key (e.g. from LANGUAGE_OPTIONS); matches `availability_posts.language` or `profiles.default_language`. */
  language?: string
  jamId?: string
  offset?: number
  limit?: number
}

type AvailablePlayersResult = {
  players: AvailablePlayerListItem[]
  hasMore: boolean
  nextOffset: number
  error: string | null
}

function normalizedFilterValue(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase()
}

function firstExternalJam(
  value: AvailablePlayerProfile["external_jams"],
): { title: string | null; url: string | null } | null {
  if (!value) return null
  if (Array.isArray(value)) return value[0] ?? null
  return value
}

function toDisplayRole(rawRole: string) {
  const roleKey = rawRole.toLowerCase()
  return {
    ...(ROLE_STYLES[roleKey] || {
      label: rawRole || "—",
      emoji: "❓",
      color: "bg-gray-500/10 text-gray-500",
    }),
    key: roleKey || undefined,
  }
}

function toDisplayLevel(rawLevel: string) {
  const levelKey = normalizedFilterValue(rawLevel)
  const normalizedKey = LEGACY_EXPERIENCE_EQUIVALENTS[levelKey]
    ? levelKey
    : ({
        hobbyist: "junior",
        confirmed: "regular",
        expert: "senior",
      }[levelKey] ?? levelKey)

  return (
    EXPERIENCE_STYLES[normalizedKey] || {
      label: rawLevel || "—",
      emoji: "⭐",
      color: "bg-gray-500/10 text-gray-500",
    }
  )
}

function toDisplayJamStyle(rawJamStyle: string) {
  const jamStyleKey = normalizedFilterValue(rawJamStyle)
  return jamStyleKey ? JAM_STYLE_STYLES[jamStyleKey] : undefined
}

export async function getAvailablePlayers(
  {
    searchQuery = "",
    role = "all",
    engine = "all",
    experience = "all",
    language = "all",
    jamId,
    offset = 0,
    limit = AVAILABLE_PLAYERS_DEFAULT_LIMIT,
  }: AvailablePlayersFilters = {},
  client: GamejamSupabaseClient = supabase,
): Promise<AvailablePlayersResult> {
  const cleanRole = normalizedFilterValue(role)
  const cleanEngine = normalizedFilterValue(engine)
  const cleanExperience = normalizedFilterValue(experience)
  const cleanLanguage = normalizedFilterValue(language)
  const cleanSearch = searchQuery.trim()
  const cleanJamId = jamId?.trim()
  const safeOffset = Math.max(0, offset)
  const safeLimit = Math.max(1, limit)
  let profileIdsFilter: string[] | null = null

  if (cleanSearch || cleanJamId) {
    let profilesFilterQuery = client
      .from("profiles")
      .select("id")

    if (cleanJamId) {
      profilesFilterQuery = profilesFilterQuery.eq("jam_id", cleanJamId)
    }
    if (cleanSearch) {
      profilesFilterQuery = profilesFilterQuery.ilike("username", `%${cleanSearch}%`)
    }

    const { data: filteredProfiles, error: filteredProfilesError } = await profilesFilterQuery
    if (filteredProfilesError) {
      console.error("[getAvailablePlayers:profilesFilter]", filteredProfilesError.message)
      return {
        players: [],
        hasMore: false,
        nextOffset: safeOffset,
        error: filteredProfilesError.message,
      }
    }

    profileIdsFilter = (filteredProfiles ?? [])
      .map((row) => row.id)
      .filter((id): id is string => Boolean(id))

    if (profileIdsFilter.length === 0) {
      return { players: [], hasMore: false, nextOffset: 0, error: null }
    }
  }

  let query = client
    .from("availability_posts")
    .select(
      "id, user_id, availability, role, experience, jam_style, engine, language, bio, portfolio_link",
    )
    .gt("expires_at", new Date().toISOString())
    .not("availability", "is", null)
    .neq("availability", "")
    .order("updated_at", { ascending: false })

  if (cleanRole && cleanRole !== "all") {
    query = query.eq("role", cleanRole)
  }

  if (cleanEngine && cleanEngine !== "all") {
    query = query.eq("engine", cleanEngine)
  }

  if (cleanExperience && cleanExperience !== "all") {
    const equivalentValues = LEGACY_EXPERIENCE_EQUIVALENTS[cleanExperience] ?? [cleanExperience]
    query = query.in("experience", equivalentValues)
  }

  const languageFilterKey = (() => {
    if (!cleanLanguage || cleanLanguage === "all") return null
    if (AVAILABLE_PLAYERS_LANGUAGE_KEYS.has(cleanLanguage)) return cleanLanguage
    const fromAlias = LANGUAGE_OPTION_VALUE_ALIASES[cleanLanguage]
    return fromAlias && AVAILABLE_PLAYERS_LANGUAGE_KEYS.has(fromAlias) ? fromAlias : null
  })()

  if (languageFilterKey) {
    const { data: defaultLangProfiles, error: defaultLangError } = await client
      .from("profiles")
      .select("id")
      .eq("default_language", languageFilterKey)

    if (defaultLangError) {
      console.error("[getAvailablePlayers:languageFilter]", defaultLangError.message)
      return {
        players: [],
        hasMore: false,
        nextOffset: safeOffset,
        error: defaultLangError.message,
      }
    }

    const userIdsWithDefaultLang = (defaultLangProfiles ?? [])
      .map((row) => row.id)
      .filter((id): id is string => Boolean(id))

    // Never emit `user_id.in.()` with zero UUIDs (malformed PostgREST filter). When no profile
    // has this `default_language`, only `availability_posts.language` can match.
    if (userIdsWithDefaultLang.length > 0) {
      query = query.or(
        `language.eq.${languageFilterKey},user_id.in.(${userIdsWithDefaultLang.join(",")})`,
      )
    } else {
      query = query.eq("language", languageFilterKey)
    }
  }

  if (profileIdsFilter) {
    query = query.in("user_id", profileIdsFilter)
  }

  const { data, error } = await query.range(safeOffset, safeOffset + safeLimit)

  if (error) {
    console.error("[getAvailablePlayers]", error.message)
    return { players: [], hasMore: false, nextOffset: safeOffset, error: error.message }
  }

  const rows = ((data ?? []) as AvailablePlayersPostRow[])
  const hasMore = rows.length > safeLimit
  const pageRows = hasMore ? rows.slice(0, safeLimit) : rows
  const userIds = [...new Set(pageRows.map((row) => row.user_id).filter(Boolean))]
  const profilesByUserId = new Map<string, AvailablePlayerProfile>()

  if (userIds.length > 0) {
    const { data: profilesData, error: profilesError } = await client
      .from("profiles")
      .select(
        "id, username, avatar_url, jam_id, xp, current_title, role, experience, experience_level, jam_style, engine, language, default_language, bio, portfolio_link, external_jams(id, title, url)",
      )
      .in("id", userIds)

    if (profilesError) {
      console.error("[getAvailablePlayers:profilesHydration]", profilesError.message)
      return {
        players: [],
        hasMore: false,
        nextOffset: safeOffset,
        error: profilesError.message,
      }
    }

    for (const profile of (profilesData ?? []) as AvailablePlayerProfile[]) {
      profilesByUserId.set(profile.id, profile)
    }
  }

  let kudosByUser = new Map<string, KudosCounts>()
  if (userIds.length > 0) {
    const { data: kudosRows, error: kudosError } = await client.rpc("get_kudos_counts_for_users", {
      p_user_ids: userIds,
    })
    if (!kudosError && kudosRows) {
      kudosByUser = kudosCountsMapFromRpcRows(
        kudosRows as { receiver_id: string; category: string; cnt: number | string }[],
      )
    }
  }

  const players: AvailablePlayerListItem[] = pageRows.map((row) => {
    const profile = profilesByUserId.get(row.user_id) ?? null
    const roleRaw = (row.role ?? profile?.role ?? "").trim()
    const levelRaw = (
      row.experience ??
      profile?.experience ??
      profile?.experience_level ??
      ""
    ).trim()
    const engineRaw = (row.engine ?? profile?.engine ?? "").trim()
    const languageRaw = (
      row.language ??
      profile?.language ??
      profile?.default_language ??
      ""
    ).trim()
    const bioRaw = (row.bio ?? profile?.bio ?? "").trim()
    const portfolioRaw = (row.portfolio_link ?? profile?.portfolio_link ?? "").trim()
    const xp = typeof profile?.xp === "number" ? profile.xp : 0
    const jam = firstExternalJam(profile?.external_jams)

    return {
      id: row.user_id,
      username: profile?.username?.trim() || "Anonymous",
      avatar_url: profile?.avatar_url?.trim() || null,
      role: toDisplayRole(roleRaw),
      level: toDisplayLevel(levelRaw),
      jamStyle: toDisplayJamStyle(row.jam_style ?? profile?.jam_style ?? ""),
      engine: engineRaw,
      bio: bioRaw,
      language: languageRaw,
      portfolio_link: portfolioRaw || undefined,
      availability: row.availability || undefined,
      jam: jam?.title ? { title: jam.title, url: jam.url ?? undefined } : undefined,
      jammerTitle: profile?.current_title?.trim() || "Rookie Jammer",
      jammerLevel: levelFromTotalXp(xp),
      kudosCounts: kudosByUser.get(row.user_id) ?? null,
      rawRole: roleRaw,
      rawEngine: engineRaw,
      rawLevel: levelRaw,
      availabilityPostId: row.id,
    }
  })

  return {
    players,
    hasMore,
    nextOffset: safeOffset + players.length,
    error: null,
  }
}
