/**
 * Serializable summary returned to the client after XP / titles / badges change.
 * (Kept separate from `lib/gamification.ts` so client bundles do not pull admin Supabase.)
 */
export type GamificationRewardSummary = {
  xpGained: number
  levelUp: boolean
  newLevel?: number
  /** First badge id granted this call (if any) */
  newBadge?: string
  /** First title string unlocked this call (if any) */
  newTitle?: string
  newBadges?: string[]
  newTitles?: string[]
}

export function gamificationRewardHasToast(reward: GamificationRewardSummary): boolean {
  return (
    reward.xpGained > 0 ||
    reward.levelUp === true ||
    (reward.newBadges?.length ?? 0) > 0 ||
    (reward.newTitles?.length ?? 0) > 0
  )
}
