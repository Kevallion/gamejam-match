"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { IconTile, AppIcon } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"
import { BadgeMedallion, type BadgeRarity } from "@/components/badge-medallion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import { gamificationLevelProgress } from "@/lib/gamification-level"
import {
  badgeProgressLine,
  countRolesWithAtLeastOneJoin,
  parseRoleStats,
  type BadgeProgressLine,
  type BadgeProgressSnapshot,
} from "@/lib/gamification-badge-progress"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

export type { BadgeRarity }

export type BadgeCatalogMeta = {
  label: string
  blurb: string
  rarity: BadgeRarity
  /** Card when unlocked */
  unlocked: string
  /** Card when locked */
  locked: string
  /** Shown instead of the generic “keep jamming” line when locked */
  lockedHint?: string
}

const RARITY_RANK: Record<BadgeRarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  special: 4,
  epic: 5,
}

const RARITY_LABEL: Record<BadgeRarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  special: "Special",
}

function formatUnlocked(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/** Ordered catalog: known badges + copy/styling. Extend when adding new badge_id values in the backend. */
export const BADGE_DICTIONARY: Record<string, BadgeCatalogMeta> = {
  founder: {
    label: "Founder",
    rarity: "uncommon",
    blurb: "Created your first squad listing.",
    unlocked:
      "border-amber-500/50 bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-yellow-500/5 shadow-[0_0_24px_-4px_rgba(245,158,11,0.35)]",
    locked: "border-border/40 bg-muted/20",
  },
  captain: {
    label: "Captain",
    rarity: "rare",
    blurb: "Filled every open role on your squad listing.",
    unlocked:
      "border-violet-500/45 bg-gradient-to-br from-violet-500/20 via-purple-600/10 to-fuchsia-500/5 shadow-[0_0_24px_-4px_rgba(139,92,246,0.35)]",
    locked: "border-border/40 bg-muted/20",
  },
  team_player: {
    label: "Team Player",
    rarity: "common",
    blurb: "Joined a squad on GameJamCrew.",
    unlocked:
      "border-teal/50 bg-gradient-to-br from-teal/25 via-teal/10 to-cyan-500/5 shadow-[0_0_20px_-4px_rgba(45,212,191,0.3)]",
    locked: "border-border/40 bg-muted/20",
  },
  early_bird: {
    label: "Early Bird",
    rarity: "common",
    blurb: "Completed your jammer onboarding.",
    unlocked:
      "border-pink/40 bg-gradient-to-br from-peach/25 via-pink/15 to-lavender/10 shadow-[0_0_22px_-4px_rgba(244,114,182,0.28)]",
    locked: "border-border/40 bg-muted/20",
  },
  stalwart: {
    label: "Stalwart",
    rarity: "uncommon",
    blurb: "Logged in 5 days in a row.",
    unlocked:
      "border-sky-500/45 bg-gradient-to-br from-sky-500/20 via-cyan-500/10 to-teal-500/5 shadow-[0_0_22px_-4px_rgba(14,165,233,0.3)]",
    locked: "border-border/40 bg-muted/20",
  },
  recruiter: {
    label: "Recruiter",
    rarity: "rare",
    blurb: "Sent 5 squad invitations to other jammers.",
    unlocked:
      "border-orange-500/40 bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-yellow-500/5 shadow-[0_0_22px_-4px_rgba(249,115,22,0.28)]",
    locked: "border-border/40 bg-muted/20",
  },
  multi_tool: {
    label: "Multi-Tool",
    rarity: "rare",
    blurb: "Joined squads in 3 different role slots.",
    unlocked:
      "border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 via-teal/15 to-lime-500/5 shadow-[0_0_22px_-4px_rgba(16,185,129,0.28)]",
    locked: "border-border/40 bg-muted/20",
  },
  jam_champion: {
    label: "Jam Champion",
    rarity: "epic",
    blurb: "Claimed jam completion rewards on a squad you own.",
    unlocked:
      "border-amber-500/45 bg-gradient-to-br from-amber-500/20 via-peach/15 to-teal/10 shadow-[0_0_22px_-4px_rgba(245,158,11,0.3)]",
    locked: "border-border/40 bg-muted/20",
  },
  supporter: {
    label: "Supporter",
    rarity: "special",
    blurb: "Awarded to our Buy Me a Coffee supporters.",
    lockedHint: "Unlock by supporting the project on Buy Me a Coffee (use the email on your account).",
    unlocked:
      "border-amber-600/45 bg-gradient-to-br from-amber-500/25 via-orange-500/15 to-rose-500/10 shadow-[0_0_24px_-4px_rgba(245,158,11,0.35)]",
    locked: "border-border/40 bg-muted/20",
  },
  golden_heart: {
    label: "Golden Heart",
    rarity: "special",
    blurb: "Verified supporter — thank you for backing the community.",
    unlocked:
      "border-rose-500/45 bg-gradient-to-br from-rose-500/25 via-pink-500/15 to-amber-400/10 shadow-[0_0_26px_-4px_rgba(244,63,94,0.35)]",
    locked: "border-border/40 bg-muted/20",
  },
}

/** Display order for the badge grid */
export const ALL_BADGE_IDS: (keyof typeof BADGE_DICTIONARY)[] = [
  "founder",
  "captain",
  "team_player",
  "early_bird",
  "supporter",
  "golden_heart",
  "stalwart",
  "recruiter",
  "multi_tool",
  "jam_champion",
]

export type ProfileGamificationProps = {
  userId: string
  className?: string
  /** Only badge grid — pair with `GamificationDashboardFull` on the Achievements tab (or public profile). */
  badgesOnly?: boolean
  /** Render only unlocked badges (public profile recruiter view). */
  unlockedOnly?: boolean
  /** Public profile: top 3 medallions, +N opens the full list. */
  compact?: boolean
}

type BadgeRow = { badge_id: string; earned_at: string }

type BadgeGridProps = {
  sortedBadgeIds: (keyof typeof BADGE_DICTIONARY)[]
  earnedIds: Set<string>
  badges: BadgeRow[]
  unlockedOnly?: boolean
  progressCtx?: BadgeProgressSnapshot | null
  onSelectBadge?: (badgeId: keyof typeof BADGE_DICTIONARY) => void
}

function isRecentlyUnlocked(earnedAt: string | undefined, withinDays = 7): boolean {
  if (!earnedAt) return false
  const t = new Date(earnedAt).getTime()
  if (!Number.isFinite(t)) return false
  return Date.now() - t <= withinDays * 24 * 60 * 60 * 1000
}

function RarityPill({ rarity, muted = false }: { rarity: BadgeRarity; muted?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        muted
          ? "border-border/40 bg-muted/30 text-muted-foreground"
          : "border-border/50 bg-secondary/60 text-muted-foreground",
      )}
    >
      {RARITY_LABEL[rarity]}
    </span>
  )
}

function BadgeProgressRing({
  percent,
  children,
}: {
  percent: number
  children: ReactNode
}) {
  const clamped = Math.min(100, Math.max(0, percent))
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <span className="relative inline-flex size-14 shrink-0 items-center justify-center">
      <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 56 56" aria-hidden>
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-border/50"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-teal transition-[stroke-dashoffset] duration-300"
        />
      </svg>
      <span className="relative z-[1] flex items-center justify-center">{children}</span>
    </span>
  )
}

function GamificationBadgeGrid({
  sortedBadgeIds,
  earnedIds,
  badges,
  unlockedOnly = false,
  progressCtx = null,
  onSelectBadge,
}: BadgeGridProps) {
  const visibleBadgeIds = unlockedOnly
    ? sortedBadgeIds.filter((badgeId) => earnedIds.has(badgeId))
    : sortedBadgeIds

  return (
    <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3">
      {visibleBadgeIds.map((badgeId) => {
        const meta = BADGE_DICTIONARY[badgeId]
        if (!meta) return null
        const unlocked = earnedIds.has(badgeId)
        const earned = badges.find((b) => b.badge_id === badgeId)
        const progress =
          progressCtx && onSelectBadge
            ? badgeProgressLine(badgeId, progressCtx, unlocked)
            : null
        const Wrapper = onSelectBadge ? "button" : "div"
        return (
          <Wrapper
            key={badgeId}
            type={onSelectBadge ? "button" : undefined}
            onClick={onSelectBadge ? () => onSelectBadge(badgeId) : undefined}
            className={cn(
              "relative flex min-w-0 flex-col gap-1 rounded-2xl border p-4 text-left transition-all duration-300",
              unlocked ? meta.unlocked : meta.locked,
              !unlocked && "border-dashed opacity-[0.72] saturate-[0.9]",
              onSelectBadge && "card-interactive cursor-pointer hover:ring-2 hover:ring-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            )}
          >
            <div className="flex min-w-0 items-center gap-2">
              <BadgeMedallion badgeId={badgeId} rarity={meta.rarity} size="lg" locked={!unlocked} />
              <span
                className={cn(
                  "min-w-0 break-words text-balance font-bold leading-tight",
                  unlocked ? "text-foreground" : "text-foreground/85",
                )}
              >
                {meta.label}
              </span>
            </div>
            <p className="text-xs leading-snug text-muted-foreground">{meta.blurb}</p>
            {!unlocked ? (
              <p
                className={cn(
                  "mt-1 text-xs text-muted-foreground",
                  progress ? "font-semibold text-foreground/80" : "font-medium",
                )}
              >
                {progress?.label ?? meta.lockedHint ?? "Locked — keep jamming to unlock"}
              </p>
            ) : earned?.earned_at ? (
              <p className="mt-auto pt-1 text-xs text-muted-foreground/80">
                Unlocked {formatUnlocked(earned.earned_at)}
              </p>
            ) : null}
          </Wrapper>
        )
      })}
    </div>
  )
}

function AchievementsBadgesSections({
  earnedIds,
  badges,
  progressCtx,
  onSelectBadge,
}: {
  earnedIds: Set<string>
  badges: BadgeRow[]
  progressCtx: BadgeProgressSnapshot | null
  onSelectBadge: (badgeId: keyof typeof BADGE_DICTIONARY) => void
}) {
  const unlockedIds = ALL_BADGE_IDS.filter((id) => earnedIds.has(id))
  const inProgress = ALL_BADGE_IDS.map((badgeId) => {
    if (earnedIds.has(badgeId) || !progressCtx) return null
    const progress = badgeProgressLine(badgeId, progressCtx, false)
    if (!progress || progress.current <= 0) return null
    const percent =
      progress.target > 0 ? Math.min(100, Math.round((progress.current / progress.target) * 100)) : 0
    return { badgeId, progress, percent }
  })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => b.percent - a.percent || b.progress.current - a.progress.current)

  const inProgressIds = new Set(inProgress.map((row) => row.badgeId))
  const stillLocked = ALL_BADGE_IDS.filter(
    (id) => !earnedIds.has(id) && !inProgressIds.has(id),
  )

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h3 className="text-sm font-bold text-foreground">Unlocked · {unlockedIds.length}</h3>
          <p className="text-xs text-muted-foreground">Tap a badge for details</p>
        </div>
        {unlockedIds.length === 0 ? (
          <p className="text-sm text-muted-foreground">No badges unlocked yet — keep jamming.</p>
        ) : (
          <div className="grid min-w-0 grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-4">
            {unlockedIds.map((badgeId) => {
              const meta = BADGE_DICTIONARY[badgeId]
              if (!meta) return null
              const earned = badges.find((b) => b.badge_id === badgeId)
              const isNew = isRecentlyUnlocked(earned?.earned_at)
              return (
                <button
                  key={badgeId}
                  type="button"
                  onClick={() => onSelectBadge(badgeId)}
                  className="card-interactive relative flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-border/50 bg-card/70 p-3 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {isNew ? (
                    <span className="absolute right-1.5 top-1.5 rounded-md bg-teal px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-teal-foreground">
                      New
                    </span>
                  ) : null}
                  <BadgeMedallion badgeId={badgeId} rarity={meta.rarity} size="md" />
                  <span className="w-full text-balance break-words text-xs font-bold leading-tight text-foreground sm:text-sm">
                    {meta.label}
                  </span>
                  <RarityPill rarity={meta.rarity} />
                  {earned?.earned_at ? (
                    <span className="text-[11px] text-muted-foreground">
                      {formatUnlocked(earned.earned_at)}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        )}
      </section>

      {inProgress.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">In progress · {inProgress.length}</h3>
          <ul className="space-y-2">
            {inProgress.map(({ badgeId, progress, percent }) => {
              const meta = BADGE_DICTIONARY[badgeId]
              if (!meta) return null
              return (
                <li key={badgeId}>
                  <button
                    type="button"
                    onClick={() => onSelectBadge(badgeId)}
                    className="card-interactive flex w-full min-w-0 items-center gap-3 rounded-2xl border border-border/50 bg-card/70 p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <BadgeProgressRing percent={percent}>
                      <BadgeMedallion badgeId={badgeId} rarity={meta.rarity} size="sm" locked />
                    </BadgeProgressRing>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-balance break-words text-foreground">
                          {meta.label}
                        </span>
                        <RarityPill rarity={meta.rarity} />
                      </div>
                      <p className="line-clamp-3 break-words text-[13px] leading-snug text-muted-foreground sm:text-sm">
                        {meta.blurb}
                      </p>
                      <p className="text-[13px] font-semibold text-teal sm:text-sm">
                        {progress.label}{" "}
                        <span className="tabular-nums text-foreground/80">· {percent}%</span>
                      </p>
                    </div>
                    <AppIcon icon={ICON.navRight} size="sm" tone="muted" />
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {stillLocked.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">Still locked · {stillLocked.length}</h3>
          <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-4">
            {stillLocked.map((badgeId) => {
              const meta = BADGE_DICTIONARY[badgeId]
              if (!meta) return null
              return (
                <button
                  key={badgeId}
                  type="button"
                  onClick={() => onSelectBadge(badgeId)}
                  className="card-interactive flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-dashed border-border/40 bg-muted/10 p-3 text-center opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <BadgeMedallion badgeId={badgeId} rarity={meta.rarity} size="md" locked />
                  <span className="w-full text-balance break-words text-xs font-bold leading-tight text-muted-foreground sm:text-sm">
                    {meta.label}
                  </span>
                  <RarityPill rarity={meta.rarity} muted />
                  <p className="line-clamp-3 w-full break-words text-[13px] leading-snug text-muted-foreground sm:text-sm">
                    {meta.lockedHint ?? meta.blurb}
                  </p>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}

export function getClosestBadgeProgress(
  progressCtx: BadgeProgressSnapshot | null,
  earnedIds: Set<string>,
): {
  badgeId: keyof typeof BADGE_DICTIONARY
  meta: BadgeCatalogMeta
  progress: BadgeProgressLine
  percent: number
} | null {
  if (!progressCtx) return null
  const rows = ALL_BADGE_IDS.map((badgeId) => {
    if (earnedIds.has(badgeId)) return null
    const progress = badgeProgressLine(badgeId, progressCtx, false)
    if (!progress || progress.current <= 0) return null
    const percent =
      progress.target > 0 ? Math.min(100, Math.round((progress.current / progress.target) * 100)) : 0
    const meta = BADGE_DICTIONARY[badgeId]
    if (!meta) return null
    return { badgeId, meta, progress, percent }
  })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => b.percent - a.percent || b.progress.current - a.progress.current)

  return rows[0] ?? null
}

function BadgeDetailBody({
  badgeId,
  meta,
  unlocked,
  earnedAt,
  progress,
}: {
  badgeId: string
  meta: BadgeCatalogMeta
  unlocked: boolean
  earnedAt?: string
  progress: BadgeProgressLine | null
}) {
  const percent =
    progress && progress.target > 0
      ? Math.min(100, Math.round((progress.current / progress.target) * 100))
      : null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <BadgeMedallion badgeId={badgeId} rarity={meta.rarity} size="lg" locked={!unlocked} />
        <div className="min-w-0">
          <p className="text-lg font-bold text-foreground">{meta.label}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {RARITY_LABEL[meta.rarity]}
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{meta.blurb}</p>
      {!unlocked ? (
        <div className="space-y-2 rounded-xl border border-border/50 bg-muted/25 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">How to unlock</p>
          <p className="text-sm text-foreground/90">
            {meta.lockedHint ?? "Keep collaborating on GameJamCrew to earn this badge."}
          </p>
          {progress ? (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span>Progress</span>
                <span className="tabular-nums text-muted-foreground">{progress.label}</span>
              </div>
              <Progress value={percent ?? 0} className="h-2 bg-muted/80" />
            </div>
          ) : null}
        </div>
      ) : earnedAt ? (
        <p className="text-sm text-muted-foreground">
          Earned on <span className="font-semibold text-foreground">{formatUnlocked(earnedAt)}</span>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Unlocked</p>
      )}
    </div>
  )
}

function BadgeDetailResponsive({
  open,
  onOpenChange,
  badgeId,
  meta,
  unlocked,
  earnedAt,
  progress,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  badgeId: string
  meta: BadgeCatalogMeta
  unlocked: boolean
  earnedAt?: string
  progress: BadgeProgressLine | null
}) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="rounded-t-3xl border-border/40 bg-card">
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border/60" aria-hidden />
          <DrawerHeader className="text-left">
            <DrawerTitle>{meta.label}</DrawerTitle>
            <DrawerDescription className="sr-only">Badge details and progress</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-2">
            <BadgeDetailBody
              badgeId={badgeId}
              meta={meta}
              unlocked={unlocked}
              earnedAt={earnedAt}
              progress={progress}
            />
          </div>
          <DrawerFooter className="pb-8">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full rounded-xl">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-border/50 bg-card">
        <DialogHeader>
          <DialogTitle>{meta.label}</DialogTitle>
          <DialogDescription className="sr-only">Badge details and progress</DialogDescription>
        </DialogHeader>
        <BadgeDetailBody
          badgeId={badgeId}
          meta={meta}
          unlocked={unlocked}
          earnedAt={earnedAt}
          progress={progress}
        />
      </DialogContent>
    </Dialog>
  )
}

function CompactBadgeRow({ badges }: { badges: BadgeRow[] }) {
  const ranked = badges
    .map((badge) => ({ badge, meta: BADGE_DICTIONARY[badge.badge_id] }))
    .filter((entry): entry is { badge: BadgeRow; meta: BadgeCatalogMeta } => Boolean(entry.meta))
    .sort((a, b) => {
      const byRarity = RARITY_RANK[b.meta.rarity] - RARITY_RANK[a.meta.rarity]
      if (byRarity !== 0) return byRarity
      return new Date(b.badge.earned_at).getTime() - new Date(a.badge.earned_at).getTime()
    })

  if (ranked.length === 0) return null

  const top = ranked.slice(0, 3)
  const extra = ranked.length - top.length
  const earnedIds = new Set(ranked.map((entry) => entry.badge.badge_id))

  return (
    <Dialog>
      <div className="flex flex-wrap items-center gap-2">
        {top.map(({ badge, meta }) => {
          return (
            <Tooltip key={badge.badge_id}>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full transition-transform hover:-translate-y-0.5 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    aria-label={`${meta.label}, ${RARITY_LABEL[meta.rarity]}`}
                  >
                    <BadgeMedallion badgeId={badge.badge_id} rarity={meta.rarity} />
                  </button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent className="max-w-56 space-y-1 text-left">
                <p className="font-semibold">{meta.label}</p>
                <p>{meta.blurb}</p>
                <p>Unlocked {formatUnlocked(badge.earned_at)}</p>
                <p>{RARITY_LABEL[meta.rarity]}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
        {extra > 0 ? (
          <DialogTrigger asChild>
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-full bg-muted px-2.5 text-xs font-bold text-muted-foreground"
              aria-label={`Show ${extra} more badges`}
            >
              +{extra}
            </button>
          </DialogTrigger>
        ) : null}
      </div>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Badges</DialogTitle>
          <DialogDescription className="sr-only">
            All unlocked badges for this jammer.
          </DialogDescription>
        </DialogHeader>
        <GamificationBadgeGrid
          sortedBadgeIds={ranked.map((entry) => entry.badge.badge_id)}
          earnedIds={earnedIds}
          badges={ranked.map((entry) => entry.badge)}
          unlockedOnly
        />
      </DialogContent>
    </Dialog>
  )
}

export function ProfileGamification({
  userId,
  className,
  badgesOnly = false,
  unlockedOnly = false,
  compact = false,
}: ProfileGamificationProps) {
  const [xp, setXp] = useState<number | null>(null)
  const [currentTitle, setCurrentTitle] = useState<string>("Rookie Jammer")
  const [badges, setBadges] = useState<BadgeRow[]>([])
  const [progressCtx, setProgressCtx] = useState<BadgeProgressSnapshot | null>(null)
  const [selectedBadgeId, setSelectedBadgeId] = useState<keyof typeof BADGE_DICTIONARY | null>(null)
  const [badgeDetailOpen, setBadgeDetailOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      if (badgesOnly) {
        const [badgesRes, profileRes, teamsRes] = await Promise.all([
          supabase.from("user_badges").select("badge_id, earned_at").eq("user_id", userId),
          supabase
            .from("profiles")
            .select(
              "daily_login_streak, invitations_sent_count, role_stats, has_completed_onboarding",
            )
            .eq("id", userId)
            .maybeSingle(),
          supabase.from("teams").select("id", { count: "exact", head: true }).eq("user_id", userId),
        ])
        if (badgesRes.error) {
          setError(badgesRes.error.message)
          setBadges([])
        } else {
          setBadges((badgesRes.data ?? []) as BadgeRow[])
        }

        const roleStats = parseRoleStats(profileRes.data?.role_stats)
        setProgressCtx({
          dailyStreak:
            typeof profileRes.data?.daily_login_streak === "number"
              ? profileRes.data.daily_login_streak
              : 0,
          invitesSent:
            typeof profileRes.data?.invitations_sent_count === "number"
              ? profileRes.data.invitations_sent_count
              : 0,
          distinctRoles: countRolesWithAtLeastOneJoin(roleStats),
          squadListings: teamsRes.count ?? 0,
          onboardingDone: profileRes.data?.has_completed_onboarding === true,
        })
        return
      }

      const [profileRes, badgesRes] = await Promise.all([
        supabase.from("profiles").select("xp, current_title").eq("id", userId).maybeSingle(),
        supabase.from("user_badges").select("badge_id, earned_at").eq("user_id", userId),
      ])
      if (profileRes.error) {
        setError(profileRes.error.message)
        setXp(0)
        setCurrentTitle("Rookie Jammer")
      } else {
        const raw = profileRes.data?.xp
        setXp(typeof raw === "number" ? raw : 0)
        const t = profileRes.data?.current_title
        setCurrentTitle(typeof t === "string" && t.trim() ? t.trim() : "Rookie Jammer")
      }
      if (badgesRes.error) {
        setBadges([])
        if (!profileRes.error) setError(badgesRes.error.message)
      } else {
        setBadges((badgesRes.data ?? []) as BadgeRow[])
      }
    } catch {
      setError("Could not load gamification data.")
      setXp(0)
      setCurrentTitle("Rookie Jammer")
    } finally {
      setLoading(false)
    }
  }, [userId, badgesOnly])

  useEffect(() => {
    void load()
  }, [load])

  const earnedIds = useMemo(() => new Set(badges.map((b) => b.badge_id)), [badges])

  const progress = useMemo(() => {
    const x = xp ?? 0
    return gamificationLevelProgress(x)
  }, [xp])

  const progressLabel = `Level ${progress.level} • ${progress.xpInLevel}/${progress.span} XP to next level`

  const sortedBadgeIds = useMemo(() => {
    return [...ALL_BADGE_IDS].sort((a, b) => {
      const ae = earnedIds.has(a) ? 0 : 1
      const be = earnedIds.has(b) ? 0 : 1
      if (ae !== be) return ae - be
      return ALL_BADGE_IDS.indexOf(a) - ALL_BADGE_IDS.indexOf(b)
    })
  }, [earnedIds])

  if (loading) {
    if (compact) {
      return (
        <div className={cn("flex gap-2", className)} aria-hidden>
          {[1, 2, 3].map((item) => (
            <div key={item} className="size-9 animate-pulse rounded-full bg-muted" />
          ))}
        </div>
      )
    }
    return (
      <Card
        className={cn(
          "overflow-hidden border-border/60 bg-card/80 shadow-lg shadow-primary/5 backdrop-blur-sm",
          className,
        )}
      >
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {!badgesOnly && (
              <>
                <div className="h-8 w-48 rounded-lg bg-muted" />
                <div className="h-3 w-full rounded-full bg-muted" />
              </>
            )}
            <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-muted" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    if (loading) {
      return (
        <div className={cn("flex gap-2", className)} aria-hidden>
          {[1, 2, 3].map((item) => (
            <div key={item} className="size-9 animate-pulse rounded-full bg-muted" />
          ))}
        </div>
      )
    }
    if (error) return <p className={cn("text-xs text-destructive", className)}>{error}</p>
    return (
      <div className={className}>
        <CompactBadgeRow badges={badges} />
      </div>
    )
  }

  const openBadgeDetail = (badgeId: keyof typeof BADGE_DICTIONARY) => {
    setSelectedBadgeId(badgeId)
    setBadgeDetailOpen(true)
  }

  const selectedMeta = selectedBadgeId ? BADGE_DICTIONARY[selectedBadgeId] : null
  const selectedEarned = selectedBadgeId
    ? badges.find((row) => row.badge_id === selectedBadgeId)
    : undefined
  const selectedUnlocked = selectedBadgeId ? earnedIds.has(selectedBadgeId) : false
  const selectedProgress =
    selectedBadgeId && progressCtx
      ? badgeProgressLine(selectedBadgeId, progressCtx, selectedUnlocked)
      : null

  if (badgesOnly) {
    const unlockedCount = badges.filter((badge) => earnedIds.has(badge.badge_id)).length

    return (
      <>
        <div className={cn("min-w-0", className)}>
          {error ? <p className="mb-3 text-xs text-destructive">{error}</p> : null}
          {unlockedOnly ? (
            unlockedCount === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/50 bg-muted/25 px-4 py-8 text-center">
                <p className="text-sm font-semibold text-foreground">No badges unlocked yet.</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Keep jamming and collaborating to unlock your first badge.
                </p>
              </div>
            ) : (
              <GamificationBadgeGrid
                sortedBadgeIds={sortedBadgeIds}
                earnedIds={earnedIds}
                badges={badges}
                unlockedOnly
                onSelectBadge={openBadgeDetail}
              />
            )
          ) : (
            <AchievementsBadgesSections
              earnedIds={earnedIds}
              badges={badges}
              progressCtx={progressCtx}
              onSelectBadge={openBadgeDetail}
            />
          )}
        </div>
        {selectedBadgeId && selectedMeta ? (
          <BadgeDetailResponsive
            open={badgeDetailOpen}
            onOpenChange={setBadgeDetailOpen}
            badgeId={selectedBadgeId}
            meta={selectedMeta}
            unlocked={selectedUnlocked}
            earnedAt={selectedEarned?.earned_at}
            progress={selectedProgress}
          />
        ) : null}
      </>
    )
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/60 bg-card/90 shadow-xl shadow-teal/5 backdrop-blur-sm",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-gradient-to-br from-teal/15 via-lavender/10 to-pink/10 blur-3xl"
        aria-hidden
      />
      <CardHeader className="relative space-y-0 pb-2 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <IconTile icon={ICON.achievement} tone="teal" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Jammer rank
              </p>
              <p className="mb-1 mt-0.5 inline-flex max-w-full items-center rounded-full border border-lavender/35 bg-lavender/10 px-3 py-1 text-xs font-bold tracking-tight text-lavender">
                <span className="truncate">{currentTitle}</span>
              </p>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-2xl font-extrabold tracking-tight text-foreground">
                  Level {progress.level}
                </span>
                <span className="text-sm text-muted-foreground">{xp ?? 0} total XP</span>
              </div>
              {error ? (
                <p className="mt-1 text-xs text-destructive">{error}</p>
              ) : (
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <AppIcon icon={ICON.xp} size="sm" tone="lavender" />
                  {progressLabel}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-8 pb-6 pt-2">
        <div
          className={cn(
            "space-y-2",
            "[&_[data-slot=progress]]:h-3 [&_[data-slot=progress]]:overflow-hidden [&_[data-slot=progress]]:rounded-full [&_[data-slot=progress]]:bg-muted/70 [&_[data-slot=progress]]:ring-1 [&_[data-slot=progress]]:ring-border/40",
            "[&_[data-slot=progress-indicator]]:rounded-full [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-teal [&_[data-slot=progress-indicator]]:via-primary [&_[data-slot=progress-indicator]]:to-lavender [&_[data-slot=progress-indicator]]:shadow-[0_0_16px_rgba(45,212,191,0.35)]",
          )}
        >
          <Progress value={progress.progressPercent} className="h-3 bg-transparent" />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Badges
          </h3>
          <GamificationBadgeGrid sortedBadgeIds={sortedBadgeIds} earnedIds={earnedIds} badges={badges} />
        </div>
      </CardContent>
    </Card>
  )
}
