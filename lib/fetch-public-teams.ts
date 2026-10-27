import { createAnonClient } from "@/lib/supabase/anon"
import { EXPERIENCE_STYLES, JAM_STYLE_STYLES, ROLE_STYLES } from "@/lib/constants"
import { TEAMS_PUBLIC_WITH_MEMBERS, sanitizeJamDisplayName } from "@/lib/teams-public"
import type { TeamCardData } from "@/components/team-card"

const INITIAL_PAGE_SIZE = 24

type RawRoleEntry = { role?: string | null; level?: string | null }

type TeamRowDb = {
  id: string
  user_id: string
  team_name: string | null
  game_name: string | null
  engine: string | null
  language: string | null
  description: string | null
  team_vibe: string | null
  looking_for: unknown
  team_members: { id: string; role?: string | null }[] | null
  jam_start_date?: string | null
  jam_end_date?: string | null
  created_at?: string | null
}

export type PublicTeamCard = TeamCardData & {
  rawRoles: RawRoleEntry[]
  rawTeamVibe: string | null
}

function formatTeam(t: TeamRowDb): PublicTeamCard {
  const parsedRoles: RawRoleEntry[] = Array.isArray(t.looking_for)
    ? (t.looking_for as RawRoleEntry[])
    : []
  const roleBadges = parsedRoles.map((r) => ({
    ...(ROLE_STYLES[r.role ?? ""] ?? {
      label: r.role ?? "Other",
      emoji: "❓",
      color: "bg-gray-500/10 text-gray-500",
    }),
    key: r.role ?? undefined,
  }))
  const mainLevel = (parsedRoles.length > 0 ? parsedRoles[0].level : "beginner") ?? "beginner"
  const levelBadge = EXPERIENCE_STYLES[mainLevel] || EXPERIENCE_STYLES["beginner"]
  const acceptedRoleKeys: string[] = (t.team_members ?? [])
    .map((m) => m.role ?? null)
    .filter((r): r is string => !!r)
  const acceptedMembersCount = t.team_members ? t.team_members.length : 0
  const teamVibe = t.team_vibe ? JAM_STYLE_STYLES[t.team_vibe] : undefined

  return {
    id: t.id,
    user_id: t.user_id,
    name: t.team_name || "Unknown Team",
    jam: sanitizeJamDisplayName(t.game_name),
    engine: t.engine || "",
    language: t.language || "",
    description: t.description || "",
    rawRoles: parsedRoles,
    rawTeamVibe: t.team_vibe || null,
    members: 1 + acceptedMembersCount,
    maxMembers: 1 + parsedRoles.length,
    roles: roleBadges,
    level: levelBadge,
    teamVibe: teamVibe ?? undefined,
    filledRoleKeys: acceptedRoleKeys,
    jamStartDate: t.jam_start_date ?? null,
    jamEndDate: t.jam_end_date ?? null,
    createdAt: t.created_at ?? null,
  }
}

/**
 * Server-side public squad listing for SEO / no-JS HTML on `/teams`.
 */
export async function fetchPublicTeamsPage(): Promise<{
  teams: PublicTeamCard[]
  hasMore: boolean
}> {
  const supabase = createAnonClient()
  const { data, error } = await supabase
    .from("teams")
    .select(TEAMS_PUBLIC_WITH_MEMBERS)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .range(0, INITIAL_PAGE_SIZE - 1)

  if (error || !data) {
    console.error("[fetchPublicTeamsPage]", error?.message)
    return { teams: [], hasMore: false }
  }

  const formatted = (data as TeamRowDb[]).map(formatTeam)
  const ownerIds = formatted.map((t) => t.user_id).filter(Boolean)
  // Use anon client path via profiles table directly (fetchProfilesMap uses browser client).
  const uniqueOwnerIds = Array.from(new Set(ownerIds))
  let profilesMap: Record<string, { username: string; avatar_url: string | null }> = {}
  if (uniqueOwnerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", uniqueOwnerIds)
    for (const p of profiles ?? []) {
      if (!p.id) continue
      profilesMap[p.id] = {
        username: (p.username ?? "").trim() || "",
        avatar_url: (p.avatar_url ?? "").trim() || null,
      }
    }
  }

  const teams = formatted.map((team) => {
    const owner = team.user_id ? profilesMap[team.user_id] : undefined
    const ownerUsername = owner?.username?.trim() || ""
    return {
      ...team,
      ownerProfileExists: ownerUsername.length > 0,
      ownerUsername: ownerUsername || "Team owner",
      ownerAvatarUrl: owner?.avatar_url ?? null,
    }
  })

  return {
    teams,
    hasMore: data.length === INITIAL_PAGE_SIZE,
  }
}
