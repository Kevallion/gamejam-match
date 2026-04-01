import type { SupabaseClient } from "@supabase/supabase-js"

export type NotificationSender = {
  username: string | null
  avatar_url: string | null
}

export type NotificationTeam = {
  team_name: string | null
  game_name: string | null
  engine: string | null
  jam_id: string | null
  external_jams?: { title: string | null } | null
}

type TeamEmbed = {
  team_name?: string | null
  game_name?: string | null
  engine?: string | null
  jam_id?: string | null
  user_id?: string | null
  external_jams?: { title?: string | null } | { title?: string | null }[] | null
}

export type JoinRequestEmbed = {
  id?: string
  type?: string | null
  status?: string | null
  sender_id?: string | null
  /** Nom affiché au moment de la candidature / invitation (souvent présent même sans `username` profil). */
  sender_name?: string | null
  team_id?: string | null
  teams?: { user_id?: string | null } | { user_id?: string | null }[] | null
}

export type EnrichedNotificationRow = {
  id: string
  type: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
  sender_id: string | null
  team_id: string | null
  join_request_id: string | null
  sender: NotificationSender | NotificationSender[] | null
  team: TeamEmbed | TeamEmbed[] | null
  join_request?: JoinRequestEmbed | JoinRequestEmbed[] | null
}

export const NOTIFICATION_ENRICHED_SELECT = `
  id,
  type,
  message,
  link,
  is_read,
  created_at,
  sender_id,
  team_id,
  join_request_id,
  sender:profiles!notifications_sender_id_fkey(username, avatar_url),
  join_request:join_requests!notifications_join_request_id_fkey(
    id,
    type,
    status,
    sender_id,
    sender_name,
    team_id,
    teams(user_id)
  ),
  team:teams!notifications_team_id_fkey(
    team_name,
    game_name,
    engine,
    jam_id,
    user_id,
    external_jams(title)
  )
`

function unwrapTeam(raw: EnrichedNotificationRow["team"]): TeamEmbed | null {
  if (!raw) return null
  return Array.isArray(raw) ? raw[0] ?? null : raw
}

function unwrapJoinRequest(raw: EnrichedNotificationRow["join_request"]): JoinRequestEmbed | null {
  if (!raw) return null
  return Array.isArray(raw) ? raw[0] ?? null : raw
}

function teamOwnerFromJoinRequest(jr: JoinRequestEmbed | null): string | null {
  if (!jr?.teams) return null
  const tm = jr.teams
  const row = Array.isArray(tm) ? tm[0] : tm
  return row?.user_id ?? null
}

/** Récupère les lignes join_requests si l’embed sur `notifications` est vide (bug / edge PostgREST). */
async function hydrateJoinRequestsFromIds(
  client: SupabaseClient,
  rows: EnrichedNotificationRow[],
): Promise<EnrichedNotificationRow[]> {
  const needIds = new Set<string>()
  for (const r of rows) {
    if (!r.join_request_id) continue
    const existing = unwrapJoinRequest(r.join_request)
    if (!existing?.id) needIds.add(r.join_request_id)
  }
  if (needIds.size === 0) return rows

  const { data, error } = await client
    .from("join_requests")
    .select("id, type, status, sender_id, sender_name, team_id, teams(user_id)")
    .in("id", [...needIds])

  if (error || !data?.length) return rows

  const map = new Map(
    (data as JoinRequestEmbed[]).map((j) => [j.id as string, j]),
  )

  return rows.map((r) => {
    if (!r.join_request_id) return r
    const existing = unwrapJoinRequest(r.join_request)
    if (existing?.id) return r
    const hydrated = map.get(r.join_request_id)
    if (!hydrated) return r
    return { ...r, join_request: hydrated }
  })
}

function senderNameMatchesActor(type: string, jr: JoinRequestEmbed): boolean {
  const t = (jr.type ?? "").trim()
  if (t === "application") {
    return type === "application_received" || type === "player_joined"
  }
  if (t === "invitation") {
    return type === "invitation_declined" || type === "player_joined"
  }
  return false
}

/** Extrait un pseudo depuis le texte anglais généré par `team-actions`. */
export function extractDisplayNameFromNotificationMessage(type: string, message: string): string | null {
  const m = message.trim()
  if (type === "application_received") {
    const match = /^(.+?)\s+applied to your team\b/i.exec(m)
    return match?.[1]?.trim().replace(/^["']|["']$/g, "") ?? null
  }
  if (type === "player_joined") {
    const match = /^(.+?)\s+has officially joined your team/i.exec(m)
    return match?.[1]?.trim() ?? null
  }
  if (type === "invitation_declined") {
    const match = /^Player\s+(.+?)\s+declined your invitation\b/i.exec(m)
    return match?.[1]?.trim() ?? null
  }
  return null
}

/**
 * Utilisateur « à mettre en avant » (avatar / lien profil) quand `sender_id` est absent en base.
 */
export function deriveNotificationActorUserId(n: EnrichedNotificationRow): string | null {
  if (n.sender_id) return n.sender_id
  const jr = unwrapJoinRequest(n.join_request)
  const teamRow = unwrapTeam(n.team)
  const teamOwnerFromNotif = teamRow?.user_id ?? null
  const teamOwnerFromJr = teamOwnerFromJoinRequest(jr)
  const jrType = (jr?.type ?? "").trim()

  switch (n.type) {
    case "application_received":
      if (jrType === "application") return jr?.sender_id ?? null
      return null
    case "team_invitation":
      if (jrType === "invitation") return teamOwnerFromJr ?? teamOwnerFromNotif
      return teamOwnerFromNotif
    case "invitation_declined":
      if (jrType === "invitation") return jr?.sender_id ?? null
      return null
    case "player_joined":
      if (jrType === "application" || jrType === "invitation") return jr?.sender_id ?? null
      return null
    case "application_accepted":
      return teamOwnerFromNotif
    case "application_declined":
      return teamOwnerFromNotif
    default:
      return n.sender_id
  }
}

function normalizeSender(raw: EnrichedNotificationRow["sender"]): NotificationSender | null {
  if (!raw) return null
  const row = Array.isArray(raw) ? raw[0] : raw
  if (!row) return null
  return { username: row.username ?? null, avatar_url: row.avatar_url ?? null }
}

function normalizeTeam(raw: EnrichedNotificationRow["team"]): NotificationTeam | null {
  const row = unwrapTeam(raw)
  if (!row) return null
  const jamRaw = row.external_jams
  const jam = Array.isArray(jamRaw) ? jamRaw[0] : jamRaw
  return {
    team_name: row.team_name ?? null,
    game_name: row.game_name ?? null,
    engine: row.engine ?? null,
    jam_id: row.jam_id ?? null,
    external_jams: jam ? { title: jam.title ?? null } : null,
  }
}

export type NormalizedNotificationFeedItem = EnrichedNotificationRow & {
  senderResolved: NotificationSender | null
  teamResolved: NotificationTeam | null
  /** Profil affiché (candidat, capitaine, etc.) — peut différer de `sender_id` si colonne vide. */
  actorUserId: string | null
}

export function buildNormalizedFeedItem(
  row: EnrichedNotificationRow,
  profileMap: Map<
    string,
    { username: string | null; avatar_url: string | null; discord_username: string | null }
  >,
): NormalizedNotificationFeedItem {
  const jr = unwrapJoinRequest(row.join_request)
  const derived = deriveNotificationActorUserId(row)
  const actorUserId = derived ?? row.sender_id ?? null
  const embedded = normalizeSender(row.sender)
  const mapped = actorUserId ? profileMap.get(actorUserId) : undefined

  let username =
    mapped?.username?.trim() ||
    embedded?.username?.trim() ||
    null
  const avatar_url = mapped?.avatar_url ?? embedded?.avatar_url ?? null

  if (!username && jr?.sender_name?.trim() && senderNameMatchesActor(row.type, jr)) {
    username = jr.sender_name.trim()
  }
  if (!username) {
    const fromMsg = extractDisplayNameFromNotificationMessage(row.type, row.message)
    if (fromMsg) username = fromMsg
  }
  if (!username && mapped?.discord_username?.trim()) {
    username = mapped.discord_username.trim()
  }
  if (!username) {
    username = "Jammer"
  }

  const senderResolved: NotificationSender = { username, avatar_url }

  return {
    ...row,
    senderResolved,
    teamResolved: normalizeTeam(row.team),
    actorUserId,
  }
}

export async function fetchNotificationsAsNormalized(
  client: SupabaseClient,
  rows: EnrichedNotificationRow[],
): Promise<NormalizedNotificationFeedItem[]> {
  const hydrated = await hydrateJoinRequestsFromIds(client, rows)

  const ids = new Set<string>()
  for (const row of hydrated) {
    const a = deriveNotificationActorUserId(row) ?? row.sender_id
    if (a) ids.add(a)
  }
  let profileMap = new Map<
    string,
    { username: string | null; avatar_url: string | null; discord_username: string | null }
  >()
  if (ids.size > 0) {
    const { data, error } = await client
      .from("profiles")
      .select("id, username, avatar_url, discord_username")
      .in("id", [...ids])
    if (error) {
      console.warn("[notifications] profiles batch:", error.message)
    } else {
      profileMap = new Map(
        (data ?? []).map((p) => [
          p.id as string,
          {
            username: (p.username as string | null) ?? null,
            avatar_url: (p.avatar_url as string | null) ?? null,
            discord_username: (p.discord_username as string | null) ?? null,
          },
        ]),
      )
    }
  }
  return hydrated.map((row) => buildNormalizedFeedItem(row, profileMap))
}

/** @deprecated Utiliser `fetchNotificationsAsNormalized` pour avatar / pseudo corrects. */
export function normalizeEnrichedNotificationRow(n: EnrichedNotificationRow): NormalizedNotificationFeedItem {
  return buildNormalizedFeedItem(n, new Map())
}

export function inboxNotificationGroupLabel(type: string): string {
  if (
    type === "application_received" ||
    type === "team_invitation" ||
    type === "application_accepted" ||
    type === "application_declined" ||
    type === "invitation_declined" ||
    type === "player_joined"
  ) {
    return "Join requests & squad"
  }
  if (type === "team_chat" || type === "discord_updated") {
    return "Team & Discord"
  }
  if (type === "team_kicked") {
    return "Account"
  }
  if (type === "gamification_squad_complete") {
    return "Achievements"
  }
  return "Other"
}
