"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { UserAvatar } from "@/components/user-avatar"
import { supabase } from "@/lib/supabase"
import { gamificationLevelProgress, levelFromTotalXp } from "@/lib/gamification-level"
import { parseUnlockedTitlesJson } from "@/lib/gamification-titles-catalog"
import { TitleSelection } from "@/components/title-selection"
import { JammerTitleBadge, JammerLevelBadge } from "@/components/profile-card"
import { ProfileGamification } from "@/components/profile-gamification"
import { MonthlyKudosLeaderboard } from "@/components/monthly-kudos-leaderboard"
import { SectionAnchorNav } from "@/components/section-anchor-nav"
import { useSectionScrollSpy } from "@/hooks/use-section-scroll-spy"
import { AppIcon } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"

export const ACHIEVEMENTS_SECTION_IDS = {
  title: "achievements-title",
  badges: "achievements-badges",
  leaderboard: "achievements-leaderboard",
} as const

// ---------------------------------------------------------------------------
// Thin XP bar (4px) — header or top-of-container
// ---------------------------------------------------------------------------

export function GamificationDashboardThinXpBar({
  xp,
  className,
}: {
  xp: number
  className?: string
}) {
  const progress = gamificationLevelProgress(xp)
  const level = levelFromTotalXp(xp)
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(progress.progressPercent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Experience progress toward level ${level + 1}`}
      className={cn("h-[4px] w-full overflow-hidden bg-muted/90", className)}
    >
      <div
        className="h-full rounded-none bg-gradient-to-r from-teal-500 to-peach transition-[width] duration-300"
        style={{ width: `${progress.progressPercent}%` }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Compact — dashboard identity header (avatar, name, title, level badge + XP line)
// ---------------------------------------------------------------------------

export type GamificationDashboardCompactProps = {
  displayName: string
  avatarUrl: string | null
  currentTitle: string
  xp: number
  className?: string
}

export function GamificationDashboardCompact({
  displayName,
  avatarUrl,
  currentTitle,
  xp,
  className,
}: GamificationDashboardCompactProps) {
  const level = levelFromTotalXp(xp)
  const title = currentTitle?.trim() || "Rookie Jammer"

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/50 bg-white/[0.05] shadow-sm backdrop-blur-xl light:bg-white/70 light:shadow-md dark:bg-slate-900/45",
        className,
      )}
    >
      <GamificationDashboardThinXpBar xp={xp} className="rounded-none" />
      <div className="flex flex-wrap items-center gap-3 px-3 py-3 sm:gap-4 sm:px-5 sm:py-4">
        <UserAvatar
          src={avatarUrl}
          fallbackName={displayName}
          size="lg"
          className="size-14 shrink-0 rounded-2xl ring-2 ring-border/40 shadow-md sm:size-16"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
            {displayName}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex max-w-full items-center rounded-full border border-amber-800/20 bg-amber-600/10 px-2.5 py-1 dark:border-amber-300/20 dark:bg-amber-400/10">
              <JammerTitleBadge title={title} className="text-sm font-extrabold sm:text-base" />
            </span>
            <JammerLevelBadge
              level={level}
              className="border-amber-800/35 bg-amber-600/12 px-2 py-0.5 text-[11px] font-extrabold text-amber-950 shadow-none dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-400 dark:shadow-[0_0_16px_-4px_rgba(245,158,11,0.35)] sm:text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Full — Achievements tab & public profile (XP detail, title picker, read-only mode)
// ---------------------------------------------------------------------------

export type GamificationDashboardProps = {
  userId: string
  readOnly?: boolean
  className?: string
  onDataChanged?: () => void
}

function GamificationDashboardFullSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("border-border/50 bg-white/[0.05] backdrop-blur-xl light:bg-white/70 dark:bg-slate-900/45", className)}>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-40 rounded-lg bg-muted" />
          <div className="h-4 w-full rounded-full bg-muted" />
          <div className="h-24 rounded-xl bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}

export function GamificationDashboardFull({
  userId,
  readOnly = false,
  className,
  onDataChanged,
}: GamificationDashboardProps) {
  const [xp, setXp] = useState<number | null>(null)
  const [currentTitle, setCurrentTitle] = useState("Rookie Jammer")
  const [unlockedTitles, setUnlockedTitles] = useState<string[]>(["Rookie Jammer"])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: resError } = await supabase
        .from("profiles")
        .select("xp, current_title, unlocked_titles")
        .eq("id", userId)
        .maybeSingle()

      if (resError) {
        setError(resError.message)
        setXp(0)
        setCurrentTitle("Rookie Jammer")
        setUnlockedTitles(["Rookie Jammer"])
        return
      }

      const rawXp = data?.xp
      setXp(typeof rawXp === "number" ? rawXp : 0)
      const t = data?.current_title
      setCurrentTitle(typeof t === "string" && t.trim() ? t.trim() : "Rookie Jammer")
      setUnlockedTitles(parseUnlockedTitlesJson(data?.unlocked_titles))
    } catch {
      setError("Could not load gamification data.")
      setXp(0)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void load()
  }, [load])

  const progress = gamificationLevelProgress(xp ?? 0)
  const level = levelFromTotalXp(xp ?? 0)
  const xpLabel = `${progress.xpInLevel} / ${progress.span} XP → next level`

  if (loading) {
    return <GamificationDashboardFullSkeleton className={className} />
  }

  return (
    <div className={cn("flex min-w-0 max-w-full flex-col gap-3", className)}>
      {/* Compact XP + level card */}
      <Card className="relative min-h-[92px] min-w-0 max-w-full overflow-hidden border-border/50 bg-white/[0.05] shadow-sm shadow-teal/5 backdrop-blur-xl light:bg-white/70 dark:bg-slate-900/45">
        <div
          className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-gradient-to-br from-amber-500/15 via-teal/10 to-peach/10 blur-2xl"
          aria-hidden
        />
        <CardContent className="relative flex min-h-[72px] min-w-0 items-center gap-3 px-4 py-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-peach/15 ring-1 ring-peach/25">
            <AppIcon icon={ICON.achievement} size="md" tone="peach" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-amber-900 dark:text-amber-400">
                Level {level}
              </span>
              <JammerLevelBadge
                level={level}
                className="border-amber-800/35 bg-amber-600/12 px-2 py-0.5 text-[10px] text-amber-950 shadow-none dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300"
              />
              <span className="ml-auto shrink-0 text-[11px] font-semibold tabular-nums text-amber-950 dark:text-amber-400/90">
                {Math.round(progress.progressPercent)}%
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <JammerTitleBadge title={currentTitle} className="text-xs sm:text-sm" />
              {error ? (
                <p className="text-[11px] text-destructive">{error}</p>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <AppIcon icon={ICON.xp} size="xs" tone="lavender" />
                  {xpLabel}
                </span>
              )}
            </div>
          </div>
        </CardContent>
        <div
          className={cn(
            "[&_[data-slot=progress]]:h-1.5 [&_[data-slot=progress]]:rounded-none [&_[data-slot=progress]]:bg-foreground/12 dark:[&_[data-slot=progress]]:bg-muted/60",
            "[&_[data-slot=progress-indicator]]:rounded-none [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-teal-500 [&_[data-slot=progress-indicator]]:to-peach",
          )}
        >
          <Progress value={progress.progressPercent} className="h-1.5 rounded-none bg-transparent" />
        </div>
      </Card>

      {!readOnly ? (
        <TitleSelection
          unlockedTitles={unlockedTitles}
          currentTitle={currentTitle}
          onUpdated={() => {
            void load()
            onDataChanged?.()
          }}
        />
      ) : null}
    </div>
  )
}

/** @deprecated Prefer `GamificationDashboardFull` or `GamificationDashboardCompact` explicitly. */
export function GamificationDashboard(props: GamificationDashboardProps) {
  return <GamificationDashboardFull {...props} />
}

export type DashboardAchievementsTabProps = {
  userId: string
  onDataChanged?: () => void
  className?: string
}

const ACHIEVEMENT_ANCHORS = [
  { id: ACHIEVEMENTS_SECTION_IDS.title, label: "Title" },
  { id: ACHIEVEMENTS_SECTION_IDS.badges, label: "Badges" },
  { id: ACHIEVEMENTS_SECTION_IDS.leaderboard, label: "Leaderboard" },
]

export function DashboardAchievementsTab({ userId, onDataChanged, className }: DashboardAchievementsTabProps) {
  const sectionIds = useMemo(
    () => [
      ACHIEVEMENTS_SECTION_IDS.title,
      ACHIEVEMENTS_SECTION_IDS.badges,
      ACHIEVEMENTS_SECTION_IDS.leaderboard,
    ],
    [],
  )
  const activeSection = useSectionScrollSpy(sectionIds)

  return (
    <div className={cn("flex min-w-0 max-w-full flex-col gap-4 md:gap-6", className)}>
      <SectionAnchorNav items={ACHIEVEMENT_ANCHORS} activeId={activeSection} />

      <section
        id={ACHIEVEMENTS_SECTION_IDS.title}
        className="scroll-mt-28 space-y-4 md:scroll-mt-32"
      >
        <GamificationDashboardFull userId={userId} onDataChanged={onDataChanged} />
      </section>

      <section id={ACHIEVEMENTS_SECTION_IDS.badges} className="scroll-mt-28 md:scroll-mt-32">
        <ProfileGamification userId={userId} badgesOnly />
      </section>

      <section id={ACHIEVEMENTS_SECTION_IDS.leaderboard} className="scroll-mt-28 md:scroll-mt-32">
        <MonthlyKudosLeaderboard />
      </section>
    </div>
  )
}
