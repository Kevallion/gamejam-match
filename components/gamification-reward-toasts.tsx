"use client"

import { AppIcon } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"
import { toast } from "sonner"
import { BadgeMedallion } from "@/components/badge-medallion"
import { announceLevelUp } from "@/lib/level-up-bus"
import type { GamificationRewardSummary } from "@/lib/gamification-reward-types"
import { gamificationRewardHasToast } from "@/lib/gamification-reward-types"
import {
  formatBadgeLabel,
  GAMIFICATION_ACTION_LABELS,
} from "@/lib/gamification-toast-labels"

const STAGGER_MS = 95

/** Badge id → title string unlocked at the same moment. Toast the badge only. */
const TITLE_DUPLICATED_BY_BADGE: Record<string, string> = {
  founder: "Squad Founder",
  recruiter: "Recruiter",
  captain: "Captain",
  jam_champion: "Jam Champion",
}

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
    toast.message(`+${reward.xpGained} XP (${actionLabel})`, {
      icon: <AppIcon icon={ICON.xp} size="lg" tone="lavender" />,
      classNames: {
        toast:
          "group gamification-toast-xp border-lavender/25 bg-popover/95 backdrop-blur-sm shadow-lg shadow-lavender/10",
      },
      duration: 3200,
    })
  }

  if (reward.levelUp && reward.newLevel != null) {
    announceLevelUp(reward.newLevel)
  }

  const badges = reward.newBadges?.length ? reward.newBadges : reward.newBadge ? [reward.newBadge] : []
  const titleCoveredByBadge = new Set(
    badges
      .map((badgeId) => TITLE_DUPLICATED_BY_BADGE[badgeId.trim().toLowerCase()])
      .filter((title): title is string => Boolean(title)),
  )
  const titles = (reward.newTitles?.length ? reward.newTitles : reward.newTitle ? [reward.newTitle] : []).filter(
    (title) => !titleCoveredByBadge.has(title),
  )
  for (const title of titles) {
    await delay(t)
    t += STAGGER_MS
    toast.message(`Achievement unlocked: ${title}`, {
      icon: <AppIcon icon={ICON.achievement} size="lg" tone="peach" />,
      classNames: {
        toast:
          "group gamification-toast-achievement border-peach/40 bg-peach/10 backdrop-blur-sm shadow-lg shadow-peach/15",
      },
      duration: 4500,
    })
  }

  for (const badgeId of badges) {
    await delay(t)
    t += STAGGER_MS
    toast.message(`Badge unlocked: ${formatBadgeLabel(badgeId)}`, {
      icon: <BadgeMedallion badgeId={badgeId} animate />,
      classNames: {
        icon: "!h-auto !w-auto !mr-0",
        toast:
          "group gamification-toast-achievement flex items-center gap-2 border-peach/40 bg-peach/10 backdrop-blur-sm shadow-lg shadow-peach/15",
      },
      duration: 4500,
    })
  }
}

/**
 * Shows stacked Sonner toasts for XP, titles, and badges.
 * A level-up opens the celebration dialog once instead of a toast.
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
