import { createAdminClient } from "@/lib/supabase/admin"
import { levelFromTotalXp } from "@/lib/gamification-level"
import type { GamificationRewardSummary } from "@/lib/gamification-reward-types"
import { teamRosterIsComplete } from "@/lib/team-utils"
import { isKudosCategoryDb, type KudosCategoryDb } from "@/lib/kudos"

/** XP granted per action — RPG pacing (tune with level curve in gamification-level.ts). */
export const XP_BY_ACTION: Record<string, number> = {
  DAILY_LOGIN: 10,
  COMPLETE_PROFILE: 50,
  POST_ANNOUNCEMENT: 30,
  JOIN_TEAM: 50,
  INVITE_MEMBER: 20,
  CREATE_TEAM: 100,
  TEAM_COMPLETED: 150,
  TEAM_ROSTER_COMPLETE: 0,
}

/**
 * Badges inserted on each action (deduped with dynamic badges below).
 * `founder` (first team) and `captain` (full roster) are computed in `awardXP` / `tryAwardCaptainBadgeForFullRoster`.
 */
export const BADGES_BY_ACTION: Record<string, string[]> = {
  CREATE_TEAM: [],
  JOIN_TEAM: ["team_player"],
  COMPLETE_PROFILE: ["early_bird"],
  TEAM_ROSTER_COMPLETE: ["captain"],
}

/** Titles unlocked when reaching a level (checked after XP is applied). */
export const TITLES_BY_LEVEL: Record<number, string> = {
  5: "Active Scouter",
  10: "Veteran",
}

/** Titles unlocked immediately when the action fires. */
export const TITLES_BY_ACTION: Record<string, string> = {
  /** Listing published — distinct from badge `captain` (full roster) and title "Captain". */
  CREATE_TEAM: "Squad Founder",
  JOIN_TEAM: "Squad Mate",
  INVITE_MEMBER: "Recruiter",
  POST_ANNOUNCEMENT: "Town Crier",
  COMPLETE_PROFILE: "Profile Pioneer",
  TEAM_COMPLETED: "Jam Champion",
  /** Same moment as badge `captain` (see `tryAwardCaptainBadgeForFullRoster`). */
  TEAM_ROSTER_COMPLETE: "Captain",
}

/**
 * Join-count thresholds per `team_members.role` / `join_requests.target_role` key
 * (must match `ROLE_OPTIONS` values: developer, writer, 2d-artist, voice_actor, …).
 * Counts are stored on `profiles.role_stats` under the same key, e.g. `role_stats['2d-artist']`.
 */
/** Unlocked when a jammer receives at least 5 kudos in that category (see `kudos` table). */
export const KUDOS_TITLES_BY_CATEGORY: Record<KudosCategoryDb, string> = {
  Technical: "Tech Virtuoso",
  Artistic: "Creative Spark",
  Leadership: "Natural Leader",
  Friendly: "Community Star",
}

export const ROLE_TITLES: Record<string, Record<number, string>> = {
  developer: { 1: "Code Monkey", 3: "Hacker", 5: "Code Wizard" },
  "2d-artist": { 1: "Sketcher", 3: "Pixel Pusher", 5: "Master Illustrator" },
  "3d-artist": { 1: "Modeler", 3: "Poly Weaver", 5: "3D Sculptor" },
  audio: { 1: "Beat Maker", 3: "Sound Engineer", 5: "Audio Sorcerer" },
  voice_actor: { 1: "Mic Tester", 3: "Vocal Talent", 5: "Golden Voice" },
  writer: { 1: "Scribe", 3: "Storyteller", 5: "Lore Keeper" },
  "game-design": { 1: "Level Builder", 3: "Mechanic Architect", 5: "Mastermind" },
  "ui-ux": { 1: "Wireframer", 3: "Interface Crafter", 5: "UX Guru" },
  qa: { 1: "Bug Hunter", 3: "Glitch Finder", 5: "The Exterminator" },
}

export type AwardXPOptions = {
  /** When `action` is JOIN_TEAM: role slot filled (e.g. writer, 2d-artist). Drives role_stats + role titles. */
  joinRole?: string | null
}

/** Canonical role key for `role_stats` / `ROLE_TITLES`, or null if not in the progression table. */
export function normalizeJoinRoleKey(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null
  const key = raw.trim().toLowerCase()
  if (!key) return null
  return key in ROLE_TITLES ? key : null
}

function parseRoleStats(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const n = typeof v === "number" ? v : Number(v)
    if (Number.isFinite(n) && n >= 0) out[k] = Math.floor(n)
  }
  return out
}

function countRolesWithAtLeastOneJoin(stats: Record<string, number>): number {
  return Object.values(stats).filter((n) => n >= 1).length
}

/** Titles newly earned when `role_stats[roleKey]` goes from prevCount → newCount (JOIN_TEAM). */
export function roleTitlesForCountCrossing(roleKey: string, prevCount: number, newCount: number): string[] {
  const thresholds = ROLE_TITLES[roleKey]
  if (!thresholds) return []
  const levels = Object.keys(thresholds)
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b)
  const out: string[] = []
  for (const t of levels) {
    if (newCount >= t && prevCount < t) {
      const title = thresholds[t]
      if (title) out.push(title)
    }
  }
  return out
}

export type AwardXPResult = {
  ok: boolean
  error?: string
  skipped?: boolean
  /** Serializable summary for client toasts (XP, level-up, titles, badges). */
  reward?: GamificationRewardSummary
  newXp?: number
  newLevel?: number
  previousLevel?: number
  leveledUp?: boolean
  titlesUnlocked?: string[]
  badgesGranted?: string[]
}

function buildGamificationReward(input: {
  xpGained: number
  levelUp: boolean
  newLevel?: number
  badgesGranted: string[]
  newTitles: string[]
}): GamificationRewardSummary {
  const { xpGained, levelUp, newLevel, badgesGranted, newTitles } = input
  const out: GamificationRewardSummary = { xpGained, levelUp }
  if (levelUp && newLevel !== undefined) out.newLevel = newLevel
  if (badgesGranted[0]) out.newBadge = badgesGranted[0]
  if (newTitles[0]) out.newTitle = newTitles[0]
  if (badgesGranted.length > 0) out.newBadges = [...badgesGranted]
  if (newTitles.length > 0) out.newTitles = [...newTitles]
  return out
}

const EMPTY_REWARD = buildGamificationReward({
  xpGained: 0,
  levelUp: false,
  badgesGranted: [],
  newTitles: [],
})

function utcCalendarDay(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Next calendar day after `ymd` (YYYY-MM-DD) in UTC. */
function addUtcCalendarDay(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split("-").map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + delta))
  return dt.toISOString().slice(0, 10)
}

function parseUnlockedTitles(raw: unknown): string[] {
  if (!Array.isArray(raw)) return ["Rookie Jammer"]
  const out = raw.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
  return out.length > 0 ? out : ["Rookie Jammer"]
}

function collectTitlesForLevelRange(fromLevelExclusive: number, toLevelInclusive: number): string[] {
  const out: string[] = []
  for (let L = fromLevelExclusive + 1; L <= toLevelInclusive; L++) {
    const t = TITLES_BY_LEVEL[L]
    if (t) out.push(t)
  }
  return out
}

function mergeUniqueTitles(existing: string[], additions: string[]): { merged: string[]; newTitles: string[] } {
  const seen = new Set(existing.map((t) => t.trim()))
  const newTitles: string[] = []
  const merged = [...existing]
  for (const add of additions) {
    const t = add.trim()
    if (!t || seen.has(t)) continue
    seen.add(t)
    merged.push(t)
    newTitles.push(t)
  }
  return { merged, newTitles }
}

/**
 * If the squad listing is full, awards the `captain` badge (+ `TEAM_ROSTER_COMPLETE` flow) to the team owner.
 */
const KUDOS_TITLE_THRESHOLD = 5

/**
 * After a new kudo is recorded, if the receiver has at least `KUDOS_TITLE_THRESHOLD` kudos in that
 * category, grants the matching title once (idempotent if already unlocked).
 */
export async function tryUnlockKudosCategoryTitle(
  receiverId: string,
  category: string,
): Promise<{ ok: boolean; error?: string; newTitles?: string[] }> {
  if (!isKudosCategoryDb(category)) {
    return { ok: false, error: "Invalid kudos category." }
  }

  const title = KUDOS_TITLES_BY_CATEGORY[category]
  const admin = createAdminClient()

  const { count, error: countErr } = await admin
    .from("kudos")
    .select("id", { count: "exact", head: true })
    .eq("receiver_id", receiverId)
    .eq("category", category)

  if (countErr) {
    return { ok: false, error: countErr.message }
  }
  const total = typeof count === "number" ? count : 0
  if (total < KUDOS_TITLE_THRESHOLD) {
    return { ok: true, newTitles: [] }
  }

  const { data: row, error: fetchError } = await admin
    .from("profiles")
    .select("unlocked_titles")
    .eq("id", receiverId)
    .maybeSingle()

  if (fetchError) {
    return { ok: false, error: fetchError.message }
  }
  if (!row) {
    return { ok: false, error: "Profile not found" }
  }

  const existingTitles = parseUnlockedTitles(row.unlocked_titles)
  if (existingTitles.some((t) => t.trim() === title)) {
    return { ok: true, newTitles: [] }
  }

  const { merged, newTitles } = mergeUniqueTitles(existingTitles, [title])
  if (newTitles.length === 0) {
    return { ok: true, newTitles: [] }
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({ unlocked_titles: merged })
    .eq("id", receiverId)

  if (updateError) {
    return { ok: false, error: updateError.message }
  }

  return { ok: true, newTitles }
}

export async function tryAwardCaptainBadgeForFullRoster(teamId: string): Promise<AwardXPResult | null> {
  const admin = createAdminClient()
  const { data: team, error: teamErr } = await admin
    .from("teams")
    .select("user_id, looking_for")
    .eq("id", teamId)
    .maybeSingle()

  if (teamErr || !team?.user_id) return null

  const { data: members, error: memErr } = await admin.from("team_members").select("role").eq("team_id", teamId)

  if (memErr || !members || !teamRosterIsComplete(team.looking_for, members)) {
    return null
  }

  return awardXP(team.user_id as string, "TEAM_ROSTER_COMPLETE")
}

/**
 * Awards XP, recomputes level, updates titles and optional badges (service role).
 * DAILY_LOGIN: only once per UTC calendar day (uses `last_daily_xp_at`).
 *
 * Role-slot title progression (`ROLE_TITLES` / `profiles.role_stats`) is applied here when
 * `action === "JOIN_TEAM"` and `options.joinRole` matches a known role key.
 */
export async function awardXP(
  userId: string,
  action: string,
  options?: AwardXPOptions,
): Promise<AwardXPResult> {
  const admin = createAdminClient()

  const { data: row, error: fetchError } = await admin
    .from("profiles")
    .select(
      "xp, level, last_daily_xp_at, unlocked_titles, role_stats, daily_login_streak, invitations_sent_count",
    )
    .eq("id", userId)
    .maybeSingle()

  if (fetchError) {
    return { ok: false, error: fetchError.message }
  }
  if (!row) {
    return { ok: false, error: "Profile not found" }
  }

  const now = new Date()

  if (action === "DAILY_LOGIN") {
    const last = row.last_daily_xp_at ? new Date(row.last_daily_xp_at as string) : null
    if (last && !Number.isNaN(last.getTime()) && utcCalendarDay(last) === utcCalendarDay(now)) {
      return { ok: true, skipped: true, reward: EMPTY_REWARD }
    }
  }

  const delta = XP_BY_ACTION[action] ?? 0
  const baseBadges = [...(BADGES_BY_ACTION[action] ?? [])]
  const actionTitle = TITLES_BY_ACTION[action]

  const roleKey =
    action === "JOIN_TEAM" ? normalizeJoinRoleKey(options?.joinRole ?? null) : null
  let roleStats = parseRoleStats(row.role_stats)
  const prevRoleDistinct = countRolesWithAtLeastOneJoin(roleStats)
  const roleTitleAdditions: string[] = []
  if (roleKey) {
    const prevR = roleStats[roleKey] ?? 0
    const nextR = prevR + 1
    roleStats = { ...roleStats, [roleKey]: nextR }
    roleTitleAdditions.push(...roleTitlesForCountCrossing(roleKey, prevR, nextR))
  }
  const nextRoleDistinct = countRolesWithAtLeastOneJoin(roleStats)

  const prevStreak = typeof row.daily_login_streak === "number" ? row.daily_login_streak : 0
  let newDailyStreak = prevStreak
  if (action === "DAILY_LOGIN") {
    const today = utcCalendarDay(now)
    const prevLastStr = row.last_daily_xp_at
      ? utcCalendarDay(new Date(row.last_daily_xp_at as string))
      : null
    if (prevLastStr === null) {
      newDailyStreak = 1
    } else {
      const expectedNext = addUtcCalendarDay(prevLastStr, 1)
      if (expectedNext === today) {
        newDailyStreak = prevStreak + 1
      } else {
        newDailyStreak = 1
      }
    }
  }

  const prevInvites = typeof row.invitations_sent_count === "number" ? row.invitations_sent_count : 0
  const nextInvites = action === "INVITE_MEMBER" ? prevInvites + 1 : prevInvites

  const dynamicBadges: string[] = []

  if (action === "CREATE_TEAM") {
    const { count, error: cErr } = await admin
      .from("teams")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
    if (!cErr && count === 1) {
      dynamicBadges.push("founder")
    }
  }

  if (action === "DAILY_LOGIN" && newDailyStreak >= 5 && prevStreak < 5) {
    dynamicBadges.push("stalwart")
  }

  if (action === "INVITE_MEMBER" && nextInvites >= 5 && prevInvites < 5) {
    dynamicBadges.push("recruiter")
  }

  if (action === "JOIN_TEAM" && nextRoleDistinct >= 3 && prevRoleDistinct < 3) {
    dynamicBadges.push("multi_tool")
  }

  const badgeIds = [...new Set([...baseBadges, ...dynamicBadges])]

  if (
    delta <= 0 &&
    !actionTitle &&
    badgeIds.length === 0 &&
    roleTitleAdditions.length === 0
  ) {
    return { ok: true, skipped: true, reward: EMPTY_REWARD }
  }

  const prevXp = typeof row.xp === "number" ? row.xp : 0
  const previousLevel = levelFromTotalXp(prevXp)
  const newXp = prevXp + delta
  const newLevel = levelFromTotalXp(newXp)
  const leveledUp = newLevel > previousLevel

  const existingTitles = parseUnlockedTitles(row.unlocked_titles)
  const additions: string[] = []
  if (actionTitle) additions.push(actionTitle)
  additions.push(...roleTitleAdditions)
  if (leveledUp) {
    additions.push(...collectTitlesForLevelRange(previousLevel, newLevel))
  }
  const { merged, newTitles } = mergeUniqueTitles(existingTitles, additions)

  const patch: Record<string, unknown> = {
    xp: newXp,
    level: newLevel,
    unlocked_titles: merged,
    role_stats: roleStats,
  }
  if (action === "DAILY_LOGIN") {
    patch.last_daily_xp_at = now.toISOString()
    patch.daily_login_streak = newDailyStreak
  }
  if (action === "INVITE_MEMBER") {
    patch.invitations_sent_count = nextInvites
  }

  const { error: updateError } = await admin.from("profiles").update(patch).eq("id", userId)

  if (updateError) {
    return { ok: false, error: updateError.message }
  }

  const badgesGranted: string[] = []
  for (const badgeId of badgeIds) {
    const { error: badgeError } = await admin.from("user_badges").insert({
      user_id: userId,
      badge_id: badgeId,
    })
    if (!badgeError) {
      badgesGranted.push(badgeId)
    } else if (badgeError.code !== "23505") {
      console.error("[gamification] user_badges insert:", badgeError.message)
    }
  }

  return {
    ok: true,
    newXp,
    newLevel,
    previousLevel,
    leveledUp,
    titlesUnlocked: newTitles,
    badgesGranted,
    reward: buildGamificationReward({
      xpGained: delta,
      levelUp: leveledUp,
      newLevel,
      badgesGranted,
      newTitles,
    }),
  }
}
