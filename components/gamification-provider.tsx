"use client"

import type { ReactNode } from "react"

/**
 * Placeholder for future gamification context. Reward toasts use global Sonner:
 * call `showGamificationRewards` / `showGamificationRewardBatch` from
 * `@/components/gamification-reward-toasts` after server actions return `reward` / `gamification`.
 */
export function GamificationProvider({ children }: { children: ReactNode }) {
  return children
}
