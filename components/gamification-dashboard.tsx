"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { UserAvatar } from "@/components/user-avatar"
import { supabase } from "@/lib/supabase"
import { gamificationLevelProgress, levelFromTotalXp } from "@/lib/gamification-level"
import {
  isTitleUnlocked,
  parseUnlockedTitlesJson,
  TITLE_CATALOG,
} from "@/lib/gamification-titles-catalog"
import { TitleSelection } from "@/components/title-selection"
import { JammerTitleBadge, JammerLevelBadge } from "@/components/profile-card"
import {
  ALL_BADGE_IDS,
  getClosestBadgeProgress,
  ProfileGamification,
} from "@/components/profile-gamification"
import { BadgeMedallion } from "@/components/badge-medallion"
import {
  countRolesWithAtLeastOneJoin,
  parseRoleStats,
  type BadgeProgressSnapshot,
} from "@/lib/gamification-badge-progress"
import { AppIcon } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"

export const ACHIEVEMENTS_SECTION_IDS = {
  title: "achievements-title",
  badges: "achievements-badges",
} as const

export type AchievementsView = "badges" | "titles"

function resolveAchievementsView(raw: string | null | undefined): AchievementsView {
  const key = (raw ?? "").trim().toLowerCase()
  if (key === "titles" || key === "title") return "titles"
  return "badges"
}

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
// Full — XP detail card (public profile / legacy)
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
  className,
}: GamificationDashboardProps) {
  const [xp, setXp] = useState<number | null>(null)
  const [currentTitle, setCurrentTitle] = useState("Rookie Jammer")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: resError } = await supabase
        .from("profiles")
        .select("xp, current_title")
        .eq("id", userId)
        .maybeSingle()

      if (resError) {
        setError(resError.message)
        setXp(0)
        setCurrentTitle("Rookie Jammer")
        return
      }

      const rawXp = data?.xp
      setXp(typeof rawXp === "number" ? rawXp : 0)
      const t = data?.current_title
      setCurrentTitle(typeof t === "string" && t.trim() ? t.trim() : "Rookie Jammer")
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
    </div>
  )
}

/** @deprecated Prefer `GamificationDashboardFull` or `GamificationDashboardCompact` explicitly. */
export function GamificationDashboard(props: GamificationDashboardProps) {
  return <GamificationDashboardFull {...props} />
}

// ---------------------------------------------------------------------------
// Achievements tab — header + Badges/Titles segmented control
// ---------------------------------------------------------------------------

export type DashboardAchievementsTabProps = {
  userId: string
  onDataChanged?: () => void
  className?: string
}

function AchievementsHeaderCard({
  displayName,
  level,
  xp,
  currentTitle,
  nextUnlock,
  onTitleClick,
  onNextUnlockClick,
}: {
  displayName: string
  level: number
  xp: number
  currentTitle: string
  nextUnlock: ReturnType<typeof getClosestBadgeProgress>
  onTitleClick: () => void
  onNextUnlockClick?: () => void
}) {
  const progress = gamificationLevelProgress(xp)
  const remaining = progress.xpToNextLevel

  return (
    <Card className="h-auto gap-0 overflow-hidden border-border/50 bg-card/80 py-0 shadow-sm">
      <CardContent className="space-y-4 p-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-400">
            <span className="text-[10px] font-bold uppercase tracking-wide">Level</span>
            <span className="text-xl font-extrabold tabular-nums leading-none">{level}</span>
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="truncate text-base font-bold text-foreground">{displayName}</p>
            <button
              type="button"
              onClick={onTitleClick}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-teal/35 bg-teal/10 px-2.5 py-1 text-left transition-colors hover:border-teal/50 hover:bg-teal/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <AppIcon icon={ICON.title} size="xs" tone="teal" />
              <JammerTitleBadge title={currentTitle} className="text-xs sm:text-sm" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-teal">Equipped</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-semibold tabular-nums text-foreground">
              {progress.xpInLevel} / {progress.span} XP
            </span>
            <span className="text-muted-foreground">
              {remaining} XP to Level {level + 1}
            </span>
          </div>
          <div
            className={cn(
              "[&_[data-slot=progress]]:h-2 [&_[data-slot=progress]]:rounded-full [&_[data-slot=progress]]:bg-muted/80",
              "[&_[data-slot=progress-indicator]]:rounded-full [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-teal [&_[data-slot=progress-indicator]]:to-peach",
            )}
          >
            <Progress value={progress.progressPercent} className="h-2 bg-transparent" />
          </div>
        </div>

        {nextUnlock ? (
          <button
            type="button"
            onClick={onNextUnlockClick}
            className="flex w-full min-w-0 items-center gap-3 rounded-xl border border-border/40 bg-background/40 p-2.5 text-left transition-colors hover:border-teal/30 hover:bg-teal/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <span className="relative inline-flex size-12 shrink-0 items-center justify-center">
              <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 48 48" aria-hidden>
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-border/50"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 18}
                  strokeDashoffset={2 * Math.PI * 18 * (1 - nextUnlock.percent / 100)}
                  className="text-teal"
                />
              </svg>
              <BadgeMedallion
                badgeId={nextUnlock.badgeId}
                rarity={nextUnlock.meta.rarity}
                size="sm"
                locked
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Next unlock
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {nextUnlock.meta.label}
                <span className="font-medium text-muted-foreground">
                  {" "}
                  — {nextUnlock.progress.label}
                </span>
              </p>
            </div>
            <AppIcon icon={ICON.navRight} size="sm" tone="muted" />
          </button>
        ) : null}
      </CardContent>
    </Card>
  )
}

function AchievementsSegmentedControl({
  view,
  onChange,
  badgesUnlocked,
  badgesTotal,
  titlesUnlocked,
  titlesTotal,
}: {
  view: AchievementsView
  onChange: (view: AchievementsView) => void
  badgesUnlocked: number
  badgesTotal: number
  titlesUnlocked: number
  titlesTotal: number
}) {
  return (
    <div
      role="tablist"
      aria-label="Achievements sections"
      className="grid grid-cols-2 gap-2 rounded-2xl border border-border/50 bg-secondary/40 p-1"
    >
      <button
        type="button"
        role="tab"
        aria-selected={view === "badges"}
        onClick={() => onChange("badges")}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          view === "badges"
            ? "bg-teal text-teal-foreground shadow-sm"
            : "bg-transparent text-muted-foreground hover:bg-background/40 hover:text-foreground",
        )}
      >
        <AppIcon
          icon={ICON.achievement}
          size="sm"
          className={view === "badges" ? "text-teal-foreground" : undefined}
          tone={view === "badges" ? undefined : "muted"}
        />
        <span>Badges</span>
        <span className="tabular-nums opacity-90">
          {badgesUnlocked}/{badgesTotal}
        </span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === "titles"}
        onClick={() => onChange("titles")}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          view === "titles"
            ? "bg-teal text-teal-foreground shadow-sm"
            : "bg-transparent text-muted-foreground hover:bg-background/40 hover:text-foreground",
        )}
      >
        <AppIcon
          icon={ICON.title}
          size="sm"
          className={view === "titles" ? "text-teal-foreground" : undefined}
          tone={view === "titles" ? undefined : "muted"}
        />
        <span>Titles</span>
        <span className="tabular-nums opacity-90">
          {titlesUnlocked}/{titlesTotal}
        </span>
      </button>
    </div>
  )
}

export function DashboardAchievementsTab({
  userId,
  onDataChanged,
  className,
}: DashboardAchievementsTabProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const view = resolveAchievementsView(searchParams.get("view") ?? searchParams.get("section"))

  const [displayName, setDisplayName] = useState("Jammer")
  const [xp, setXp] = useState(0)
  const [currentTitle, setCurrentTitle] = useState("Rookie Jammer")
  const [unlockedTitles, setUnlockedTitles] = useState<string[]>(["Rookie Jammer"])
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<Set<string>>(new Set())
  const [progressCtx, setProgressCtx] = useState<BadgeProgressSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  const setView = useCallback(
    (next: AchievementsView) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", "achievements")
      if (next === "titles") {
        params.set("view", "titles")
      } else {
        params.delete("view")
        params.delete("section")
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const [profileRes, badgesRes, teamsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "username, xp, current_title, unlocked_titles, daily_login_streak, invitations_sent_count, role_stats, has_completed_onboarding",
          )
          .eq("id", userId)
          .maybeSingle(),
        supabase.from("user_badges").select("badge_id").eq("user_id", userId),
        supabase.from("teams").select("id", { count: "exact", head: true }).eq("user_id", userId),
      ])

      const profile = profileRes.data
      const name =
        typeof profile?.username === "string" && profile.username.trim()
          ? profile.username.trim()
          : "Jammer"
      setDisplayName(name)
      setXp(typeof profile?.xp === "number" ? profile.xp : 0)
      const title = profile?.current_title
      setCurrentTitle(typeof title === "string" && title.trim() ? title.trim() : "Rookie Jammer")
      setUnlockedTitles(parseUnlockedTitlesJson(profile?.unlocked_titles))

      const earned = new Set(
        (badgesRes.data ?? [])
          .map((row) => (typeof row.badge_id === "string" ? row.badge_id : ""))
          .filter(Boolean),
      )
      setEarnedBadgeIds(earned)

      const roleStats = parseRoleStats(profile?.role_stats)
      setProgressCtx({
        dailyStreak:
          typeof profile?.daily_login_streak === "number" ? profile.daily_login_streak : 0,
        invitesSent:
          typeof profile?.invitations_sent_count === "number"
            ? profile.invitations_sent_count
            : 0,
        distinctRoles: countRolesWithAtLeastOneJoin(roleStats),
        squadListings: teamsRes.count ?? 0,
        onboardingDone: profile?.has_completed_onboarding === true,
      })
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void load()
  }, [load])

  const level = levelFromTotalXp(xp)
  const nextUnlock = useMemo(
    () => getClosestBadgeProgress(progressCtx, earnedBadgeIds),
    [progressCtx, earnedBadgeIds],
  )
  const badgesUnlocked = useMemo(
    () => ALL_BADGE_IDS.filter((id) => earnedBadgeIds.has(id)).length,
    [earnedBadgeIds],
  )
  const titlesUnlocked = useMemo(
    () => TITLE_CATALOG.filter((entry) => isTitleUnlocked(unlockedTitles, entry.title)).length,
    [unlockedTitles],
  )

  const handleDataChanged = () => {
    void load()
    onDataChanged?.()
  }

  if (loading) {
    return (
      <div className={cn("grid min-w-0 max-w-full gap-4 xl:grid-cols-12", className)}>
        <div className="xl:col-span-4">
          <div className="h-48 animate-pulse rounded-2xl bg-muted/60" />
        </div>
        <div className="space-y-4 xl:col-span-8">
          <div className="h-12 animate-pulse rounded-2xl bg-muted/60" />
          <div className="h-64 animate-pulse rounded-2xl bg-muted/60" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("grid min-w-0 max-w-full items-start gap-4 xl:grid-cols-12", className)}>
      <aside className="min-w-0 xl:sticky xl:top-4 xl:col-span-4 xl:self-start">
        <AchievementsHeaderCard
          displayName={displayName}
          level={level}
          xp={xp}
          currentTitle={currentTitle}
          nextUnlock={nextUnlock}
          onTitleClick={() => setView("titles")}
          onNextUnlockClick={
            nextUnlock
              ? () => {
                  setView("badges")
                }
              : undefined
          }
        />
      </aside>

      <div className="min-w-0 space-y-4 xl:col-span-8">
        <AchievementsSegmentedControl
          view={view}
          onChange={setView}
          badgesUnlocked={badgesUnlocked}
          badgesTotal={ALL_BADGE_IDS.length}
          titlesUnlocked={titlesUnlocked}
          titlesTotal={TITLE_CATALOG.length}
        />

        {view === "badges" ? (
          <section id={ACHIEVEMENTS_SECTION_IDS.badges} className="min-w-0">
            <ProfileGamification userId={userId} badgesOnly />
          </section>
        ) : (
          <section id={ACHIEVEMENTS_SECTION_IDS.title} className="min-w-0">
            <TitleSelection
              unlockedTitles={unlockedTitles}
              currentTitle={currentTitle}
              onUpdated={handleDataChanged}
            />
          </section>
        )}
      </div>
    </div>
  )
}
