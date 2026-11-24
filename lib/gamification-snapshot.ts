import type { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { TITLES_BY_LEVEL } from "@/lib/gamification"
import {
  countRolesWithAtLeastOneJoin,
  parseRoleStats,
  type BadgeProgressSnapshot,
} from "@/lib/gamification-badge-progress"
import { gamificationLevelProgress } from "@/lib/gamification-level"
import { parseUnlockedTitlesJson } from "@/lib/gamification-titles-catalog"
import { kudosCountsMapFromRpcRows, type KudosCountRow, type KudosCounts } from "@/lib/kudos"

/**
 * DS-3a: single source of truth for the signed-in user's level / XP / badges.
 * Used by the Dashboard (Bento) and Rewards. Me (app shell) reads the same
 * `profiles.xp` server-side and the same `lib/gamification-level` curve.
 *
 * Server only. `xp`, `current_title`, `unlocked_titles` and badges are read with
 * the user's session. Since the S7 lockdown, `daily_login_streak`,
 * `invitations_sent_count`, `role_stats` and `last_daily_xp_at` are not readable
 * through the API, so they are read for the caller's own row only with the
 * service role. Before DS-3a, Rewards selected them with the user session: the
 * whole select failed (42501) and Rewards fell back to 0 XP / level 1.
 */

export type GamificationSnapshot = {
  userId: string
  username: string | null
  /** Total XP (profiles.xp). */
  xp: number
  level: number
  xpInLevel: number
  levelSpan: number
  xpToNextLevel: number
  progressPercent: number
  currentTitle: string
  unlockedTitles: string[]
  /** Next title unlocked by level (TITLES_BY_LEVEL), null when none is left. */
  nextLevelTitle: { title: string; level: number } | null
  earnedBadgeIds: string[]
  badgeProgress: BadgeProgressSnapshot
  /** False when the private counters (streak, invites, roles, daily claim) could not be read. */
  privateStatsAvailable: boolean
  dailyStreak: number
  invitesSent: number
  /** Null when unknown. */
  dailyLoginClaimedToday: boolean | null
  kudosReceived: number
  /** Per-category counts from the same RPC, used by own-post badges. */
  kudosByCategory: KudosCounts
}

type ServerSupabase = Awaited<ReturnType<typeof createClient>>

type PrivateStats = {
  daily_login_streak: number | null
  invitations_sent_count: number | null
  role_stats: unknown
  last_daily_xp_at: string | null
}

async function readOwnPrivateStats(userId: string): Promise<PrivateStats | null> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("profiles")
      .select("daily_login_streak, invitations_sent_count, role_stats, last_daily_xp_at")
      .eq("id", userId)
      .maybeSingle()
    if (error || !data) return null
    return data as PrivateStats
  } catch {
    return null
  }
}

function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function nextTitleByLevel(level: number): { title: string; level: number } | null {
  const next = Object.keys(TITLES_BY_LEVEL)
    .map(Number)
    .filter((lvl) => Number.isFinite(lvl) && lvl > level)
    .sort((a, b) => a - b)[0]
  return next ? { title: TITLES_BY_LEVEL[next], level: next } : null
}

export async function loadGamificationSnapshot(
  supabase: ServerSupabase,
  userId: string,
): Promise<GamificationSnapshot> {
  const [profileRes, badgesRes, teamsRes, kudosRes, privateStats] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, xp, current_title, unlocked_titles, has_completed_onboarding")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("user_badges").select("badge_id").eq("user_id", userId),
    supabase.from("teams").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.rpc("get_kudos_counts_for_users", { p_user_ids: [userId] }),
    readOwnPrivateStats(userId),
  ])

  if (profileRes.error) {
    throw new Error(profileRes.error.message)
  }

  const profile = profileRes.data as {
    username?: string | null
    xp?: number | null
    current_title?: string | null
    unlocked_titles?: unknown
    has_completed_onboarding?: boolean | null
  } | null

  const xp = typeof profile?.xp === "number" ? Math.max(0, profile.xp) : 0
  const progress = gamificationLevelProgress(xp)
  const title = profile?.current_title?.trim() || "Rookie Jammer"

  const earnedBadgeIds = [
    ...new Set(
      ((badgesRes.data ?? []) as { badge_id?: string | null }[])
        .map((row) => (typeof row.badge_id === "string" ? row.badge_id : ""))
        .filter(Boolean),
    ),
  ]

  const kudosRows = (kudosRes.data ?? []) as KudosCountRow[]
  const kudosByCategory = kudosCountsMapFromRpcRows(kudosRows).get(userId) ?? {}
  const kudosReceived = Object.values(kudosByCategory).reduce((sum, n) => sum + (n ?? 0), 0)

  const dailyStreak =
    typeof privateStats?.daily_login_streak === "number" ? privateStats.daily_login_streak : 0
  const invitesSent =
    typeof privateStats?.invitations_sent_count === "number"
      ? privateStats.invitations_sent_count
      : 0
  const lastDaily = privateStats?.last_daily_xp_at ? new Date(privateStats.last_daily_xp_at) : null

  return {
    userId,
    username: profile?.username?.trim() || null,
    xp,
    level: progress.level,
    xpInLevel: progress.xpInLevel,
    levelSpan: progress.span,
    xpToNextLevel: progress.xpToNextLevel,
    progressPercent: progress.progressPercent,
    currentTitle: title,
    unlockedTitles: parseUnlockedTitlesJson(profile?.unlocked_titles),
    nextLevelTitle: nextTitleByLevel(progress.level),
    earnedBadgeIds,
    badgeProgress: {
      dailyStreak,
      invitesSent,
      distinctRoles: countRolesWithAtLeastOneJoin(parseRoleStats(privateStats?.role_stats)),
      squadListings: teamsRes.count ?? 0,
      onboardingDone: profile?.has_completed_onboarding === true,
    },
    privateStatsAvailable: privateStats != null,
    dailyStreak,
    invitesSent,
    dailyLoginClaimedToday: privateStats
      ? lastDaily != null && !Number.isNaN(lastDaily.getTime()) && utcDay(lastDaily) === utcDay(new Date())
      : null,
    kudosReceived,
    kudosByCategory,
  }
}