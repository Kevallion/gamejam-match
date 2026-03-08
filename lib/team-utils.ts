import type { TeamCardData } from "@/components/team-card"
import { EXPERIENCE_STYLES, JAM_STYLE_STYLES, ROLE_STYLES } from "@/lib/constants"

type RawRoleEntry = { role?: string | null; level?: string | null }

export type TeamRowDb = {
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
}

export function formatTeamToCardData(t: TeamRowDb): TeamCardData {
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
  const mainLevel =
    (parsedRoles.length > 0 ? parsedRoles[0].level : "beginner") ?? "beginner"
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
    jam: t.game_name || "",
    engine: t.engine || "",
    language: t.language || "",
    description: t.description || "",
    members: 1 + acceptedMembersCount,
    maxMembers: 1 + parsedRoles.length,
    roles: roleBadges,
    level: levelBadge,
    teamVibe: teamVibe ?? undefined,
    filledRoleKeys: acceptedRoleKeys,
  }
}
