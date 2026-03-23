"use client"

import { useCallback, useEffect, useState } from "react"
import { Sparkles, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { UserAvatar } from "@/components/user-avatar"
import { supabase } from "@/lib/supabase"
import { gamificationLevelProgress, levelFromTotalXp } from "@/lib/gamification-level"
import { parseUnlockedTitlesJson } from "@/lib/gamification-titles-catalog"
import { TitleSelection } from "@/components/title-selection"
import { JammerTitleBadge, JammerLevelBadge } from "@/components/profile-card"
import { cn } from "@/lib/utils"

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
            <span className="inline-flex max-w-full items-center rounded-full border border-amber-400/25 bg-amber-500/10 px-2.5 py-1 dark:border-amber-300/20 dark:bg-amber-400/10">
              <JammerTitleBadge title={title} className="text-sm font-extrabold sm:text-base" />
            </span>
            <JammerLevelBadge
              level={level}
              className="border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[11px] font-extrabold text-amber-600 shadow-[0_0_16px_-4px_rgba(245,158,11,0.35)] dark:text-amber-400 sm:text-xs"
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
  const totalLabel = `${xp ?? 0} total XP`

  if (loading) {
    return <GamificationDashboardFullSkeleton className={className} />
  }

  return (
    <div className={cn("flex flex-col gap-4 sm:gap-6", className)}>
      <Card className="relative overflow-hidden border-border/50 bg-white/[0.05] shadow-lg shadow-teal/5 backdrop-blur-xl light:bg-white/70 dark:bg-slate-900/45">
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-gradient-to-br from-amber-500/15 via-teal/10 to-peach/10 blur-3xl sm:size-48"
          aria-hidden
        />
        <CardHeader className="relative space-y-2 pb-2 pt-4 sm:space-y-3 sm:pt-6">
          <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 ring-2 ring-amber-500/35 sm:size-12 sm:rounded-2xl">
                <Trophy className="size-6 text-amber-500 sm:size-7" aria-hidden />
              </div>
              <div className="min-w-0 space-y-1.5 sm:space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-tight text-muted-foreground sm:text-xs">
                  Your progress
                </p>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-2xl font-semibold tracking-tight text-amber-500 sm:text-3xl">
                    Level {level}
                  </span>
                  <JammerLevelBadge
                    level={level}
                    className="border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-xs text-amber-600 shadow-[0_0_16px_-4px_rgba(245,158,11,0.35)] dark:text-amber-400 sm:px-2.5 sm:py-1 sm:text-sm"
                  />
                </div>
                <JammerTitleBadge title={currentTitle} className="text-sm sm:text-base" />
                {error ? (
                  <p className="text-xs text-destructive">{error}</p>
                ) : (
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-medium text-foreground/90">
                      <Sparkles className="size-3.5 shrink-0 text-amber-500" />
                      {xpLabel}
                    </span>
                    <span className="text-muted-foreground/80">·</span>
                    <span>{totalLabel}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-2 pb-4 sm:pb-6">
          <div
            className={cn(
              "space-y-2",
              "[&_[data-slot=progress]]:h-3.5 [&_[data-slot=progress]]:overflow-hidden [&_[data-slot=progress]]:rounded-full [&_[data-slot=progress]]:bg-muted/70 [&_[data-slot=progress]]:ring-1 [&_[data-slot=progress]]:ring-border/40",
              "[&_[data-slot=progress-indicator]]:rounded-full [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-teal-500 [&_[data-slot=progress-indicator]]:to-peach [&_[data-slot=progress-indicator]]:shadow-[0_0_20px_rgba(20,184,166,0.28)]",
            )}
          >
            <Progress value={progress.progressPercent} className="h-3.5 bg-transparent" />
          </div>
          <p className="text-right text-xs font-semibold tracking-tight text-amber-600/90 dark:text-amber-400/90">
            {Math.round(progress.progressPercent)}% to level {level + 1}
          </p>
        </CardContent>
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
