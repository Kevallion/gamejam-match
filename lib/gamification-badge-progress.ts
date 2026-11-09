export function parseRoleStats(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const n = typeof v === "number" ? v : Number(v)
    if (Number.isFinite(n) && n >= 0) out[k] = Math.floor(n)
  }
  return out
}

export function countRolesWithAtLeastOneJoin(stats: Record<string, number>): number {
  return Object.values(stats).filter((n) => n >= 1).length
}

export type BadgeProgressSnapshot = {
  dailyStreak: number
  invitesSent: number
  distinctRoles: number
  squadListings: number
  onboardingDone: boolean
}

export type BadgeProgressLine = {
  current: number
  target: number
  label: string
}

export function badgeProgressLine(
  badgeId: string,
  ctx: BadgeProgressSnapshot,
  unlocked: boolean,
): BadgeProgressLine | null {
  if (unlocked) return null

  switch (badgeId) {
    case "stalwart":
      return {
        current: Math.min(ctx.dailyStreak, 5),
        target: 5,
        label: `${Math.min(ctx.dailyStreak, 5)}/5 day streak`,
      }
    case "recruiter":
      return {
        current: Math.min(ctx.invitesSent, 5),
        target: 5,
        label: `${Math.min(ctx.invitesSent, 5)}/5 invites sent`,
      }
    case "multi_tool":
      return {
        current: Math.min(ctx.distinctRoles, 3),
        target: 3,
        label: `${Math.min(ctx.distinctRoles, 3)}/3 roles`,
      }
    case "founder":
      return {
        current: Math.min(ctx.squadListings, 1),
        target: 1,
        label: `${Math.min(ctx.squadListings, 1)}/1 squad listing`,
      }
    case "team_player":
      return { current: 0, target: 1, label: "0/1 squad joined" }
    case "early_bird":
      return {
        current: ctx.onboardingDone ? 1 : 0,
        target: 1,
        label: ctx.onboardingDone ? "1/1 onboarding" : "0/1 onboarding",
      }
    default:
      return null
  }
}
