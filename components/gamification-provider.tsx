"use client"

import type { ReactNode } from "react"
import { LevelUpCelebration } from "@/components/level-up-celebration"

/**
 * Hosts the level-up celebration. Reward toasts use global Sonner:
 * call `showGamificationRewards` / `showGamificationRewardBatch` from
 * `@/components/gamification-reward-toasts` after server actions return `reward` / `gamification`.
 */
export function GamificationProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <LevelUpCelebration />
    </>
  )
}
