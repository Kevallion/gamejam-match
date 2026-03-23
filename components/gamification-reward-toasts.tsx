"use client"

import { Star, Sparkles, Trophy } from "lucide-react"
import { toast } from "sonner"
import type { GamificationRewardSummary } from "@/lib/gamification-reward-types"
import { gamificationRewardHasToast } from "@/lib/gamification-reward-types"
import {
  formatBadgeLabel,
  GAMIFICATION_ACTION_LABELS,
} from "@/lib/gamification-toast-labels"

const STAGGER_MS = 95

function playRewardChime() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(523.25, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.06)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
    void ctx.resume().catch(() => {})
  } catch {
    /* ignore */
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

async function showGamificationRewardsAsync(
  actionKey: string,
  reward: GamificationRewardSummary,
  options?: { sound?: boolean },
): Promise<void> {
  if (!gamificationRewardHasToast(reward)) return

  const sound = options?.sound !== false
  if (sound) playRewardChime()

  const actionLabel = GAMIFICATION_ACTION_LABELS[actionKey] ?? actionKey.replace(/_/g, " ")

  let t = 0

  if (reward.xpGained > 0) {
    await delay(t)
    t += STAGGER_MS
    toast.message(`✨ +${reward.xpGained} XP (${actionLabel})`, {
      icon: <Star className="size-5 shrink-0 text-violet-400" aria-hidden />,
      classNames: {
        toast:
          "group gamification-toast-xp border-violet-500/25 bg-popover/95 backdrop-blur-sm shadow-lg shadow-violet-500/10",
      },
      duration: 3200,
    })
  }

  if (reward.levelUp && reward.newLevel != null) {
    await delay(t)
    t += STAGGER_MS
    toast.success(`🎊 Level up! You are now level ${reward.newLevel}`, {
      icon: <Sparkles className="size-5 shrink-0 text-teal-400" aria-hidden />,
      classNames: {
        toast:
          "group gamification-toast-level border-teal-400/45 bg-teal-950/30 dark:bg-teal-950/45 backdrop-blur-sm shadow-lg shadow-teal-500/15",
      },
      duration: 4800,
    })
  }

  const titles = reward.newTitles?.length ? reward.newTitles : reward.newTitle ? [reward.newTitle] : []
  for (const title of titles) {
    await delay(t)
    t += STAGGER_MS
    toast.message(`🏆 Achievement unlocked: ${title}`, {
      icon: <Trophy className="size-5 shrink-0 text-amber-500" aria-hidden />,
      classNames: {
        toast:
          "group gamification-toast-achievement border-amber-500/50 bg-amber-950/20 dark:bg-amber-950/35 backdrop-blur-sm shadow-lg shadow-amber-500/15",
      },
      duration: 4500,
    })
  }

  const badges = reward.newBadges?.length ? reward.newBadges : reward.newBadge ? [reward.newBadge] : []
  for (const badgeId of badges) {
    await delay(t)
    t += STAGGER_MS
    toast.message(`🏆 Achievement unlocked: ${formatBadgeLabel(badgeId)}`, {
      icon: <Trophy className="size-5 shrink-0 text-amber-500" aria-hidden />,
      classNames: {
        toast:
          "group gamification-toast-achievement border-amber-500/50 bg-amber-950/20 dark:bg-amber-950/35 backdrop-blur-sm shadow-lg shadow-amber-500/15",
      },
      duration: 4500,
    })
  }
}

/**
 * Shows stacked Sonner toasts for XP, level-up, titles, and badges.
 * Call from client code after a server action returns `reward` / `gamification`.
 */
export function showGamificationRewards(
  actionKey: string,
  reward: GamificationRewardSummary | null | undefined,
  options?: { sound?: boolean },
): void {
  if (!reward || !gamificationRewardHasToast(reward)) return
  void showGamificationRewardsAsync(actionKey, reward, options)
}

/** Runs several reward sequences one after another (e.g. onboarding: profile + announcement). */
export async function showGamificationRewardBatch(
  entries: { action: string; reward: GamificationRewardSummary }[],
  options?: { sound?: boolean },
): Promise<void> {
  let playSound = options?.sound !== false
  for (const { action, reward } of entries) {
    if (!reward || !gamificationRewardHasToast(reward)) continue
    await showGamificationRewardsAsync(action, reward, { sound: playSound })
    playSound = false
  }
}
