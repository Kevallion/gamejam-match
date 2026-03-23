/**
 * Pure level / XP curve helpers (safe for client + server).
 * Level = floor(sqrt(XP / 25)) + 1 — matches `lib/gamification.ts` XP_BY_ACTION tuning.
 */

const XP_DIVISOR = 25

export function levelFromTotalXp(xp: number): number {
  const safe = Math.max(0, Math.floor(xp))
  return Math.floor(Math.sqrt(safe / XP_DIVISOR)) + 1
}

/** Total XP at which level `L` starts (L is 1-based). */
export function xpAtStartOfLevel(level: number): number {
  if (level <= 1) return 0
  return (level - 1) ** 2 * XP_DIVISOR
}

/** First total XP value where the player reaches `level + 1`. */
export function xpAtStartOfNextLevel(level: number): number {
  return level ** 2 * XP_DIVISOR
}

/** Progress within the current level for the XP bar and copy. */
export function gamificationLevelProgress(xp: number): {
  level: number
  xpInLevel: number
  xpToNextLevel: number
  span: number
  progressPercent: number
} {
  const safeXp = Math.max(0, Math.floor(xp))
  const level = levelFromTotalXp(safeXp)
  const xpStart = xpAtStartOfLevel(level)
  const xpNext = xpAtStartOfNextLevel(level)
  const span = Math.max(1, xpNext - xpStart)
  const xpInLevel = Math.min(span, Math.max(0, safeXp - xpStart))
  const progressPercent = Math.min(100, Math.max(0, (xpInLevel / span) * 100))
  return {
    level,
    xpInLevel,
    xpToNextLevel: Math.max(0, xpNext - safeXp),
    span,
    progressPercent,
  }
}
