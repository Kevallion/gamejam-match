"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Sparkles, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import { gamificationLevelProgress } from "@/lib/gamification-level"
import { cn } from "@/lib/utils"

/** Ordered catalog: known badges + copy/styling. Extend when adding new badge_id values in the backend. */
export const BADGE_DICTIONARY: Record<
  string,
  {
    emoji: string
    label: string
    blurb: string
    /** Card when unlocked */
    unlocked: string
    /** Card when locked */
    locked: string
  }
> = {
  founder: {
    emoji: "🏗️",
    label: "Founder",
    blurb: "Created your first squad listing.",
    unlocked:
      "border-amber-500/50 bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-yellow-500/5 shadow-[0_0_24px_-4px_rgba(245,158,11,0.35)]",
    locked: "border-border/40 bg-muted/20 opacity-45 grayscale",
  },
  captain: {
    emoji: "👑",
    label: "Captain",
    blurb: "Filled every open role on your squad listing.",
    unlocked:
      "border-violet-500/45 bg-gradient-to-br from-violet-500/20 via-purple-600/10 to-fuchsia-500/5 shadow-[0_0_24px_-4px_rgba(139,92,246,0.35)]",
    locked: "border-border/40 bg-muted/20 opacity-45 grayscale",
  },
  team_player: {
    emoji: "🤝",
    label: "Team Player",
    blurb: "Joined a team on GameJamCrew.",
    unlocked:
      "border-teal/50 bg-gradient-to-br from-teal/25 via-teal/10 to-cyan-500/5 shadow-[0_0_20px_-4px_rgba(45,212,191,0.3)]",
    locked: "border-border/40 bg-muted/20 opacity-45 grayscale",
  },
  early_bird: {
    emoji: "🌅",
    label: "Early Bird",
    blurb: "Completed your jammer onboarding.",
    unlocked:
      "border-pink/40 bg-gradient-to-br from-peach/25 via-pink/15 to-lavender/10 shadow-[0_0_22px_-4px_rgba(244,114,182,0.28)]",
    locked: "border-border/40 bg-muted/20 opacity-45 grayscale",
  },
  stalwart: {
    emoji: "💎",
    label: "Stalwart",
    blurb: "Logged in 5 days in a row.",
    unlocked:
      "border-sky-500/45 bg-gradient-to-br from-sky-500/20 via-cyan-500/10 to-teal-500/5 shadow-[0_0_22px_-4px_rgba(14,165,233,0.3)]",
    locked: "border-border/40 bg-muted/20 opacity-45 grayscale",
  },
  recruiter: {
    emoji: "📣",
    label: "Recruiter",
    blurb: "Sent 5 squad invitations to other jammers.",
    unlocked:
      "border-orange-500/40 bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-yellow-500/5 shadow-[0_0_22px_-4px_rgba(249,115,22,0.28)]",
    locked: "border-border/40 bg-muted/20 opacity-45 grayscale",
  },
  multi_tool: {
    emoji: "🛠️",
    label: "Multi-Tool",
    blurb: "Joined squads in 3 different role slots.",
    unlocked:
      "border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 via-teal/15 to-lime-500/5 shadow-[0_0_22px_-4px_rgba(16,185,129,0.28)]",
    locked: "border-border/40 bg-muted/20 opacity-45 grayscale",
  },
}

/** Display order for the badge grid */
export const ALL_BADGE_IDS: (keyof typeof BADGE_DICTIONARY)[] = [
  "founder",
  "captain",
  "team_player",
  "early_bird",
  "stalwart",
  "recruiter",
  "multi_tool",
]

export type ProfileGamificationProps = {
  userId: string
  className?: string
  /** Only badge grid — pair with `GamificationDashboardFull` on the Achievements tab (or public profile). */
  badgesOnly?: boolean
}

type BadgeRow = { badge_id: string; earned_at: string }

function GamificationBadgeGrid({
  sortedBadgeIds,
  earnedIds,
  badges,
}: {
  sortedBadgeIds: (keyof typeof BADGE_DICTIONARY)[]
  earnedIds: Set<string>
  badges: BadgeRow[]
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {sortedBadgeIds.map((badgeId) => {
        const meta = BADGE_DICTIONARY[badgeId]
        if (!meta) return null
        const unlocked = earnedIds.has(badgeId)
        const earned = badges.find((b) => b.badge_id === badgeId)
        return (
          <div
            key={badgeId}
            className={cn(
              "relative flex flex-col gap-1 rounded-2xl border p-4 transition-all duration-300",
              unlocked ? meta.unlocked : meta.locked,
              !unlocked && "border-dashed",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn("text-2xl leading-none", !unlocked && "opacity-50 saturate-0")}
                aria-hidden
              >
                {meta.emoji}
              </span>
              <span
                className={cn(
                  "font-bold leading-tight",
                  unlocked ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {meta.label}
              </span>
            </div>
            <p className="text-xs leading-snug text-muted-foreground">{meta.blurb}</p>
            {!unlocked ? (
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                Locked — keep jamming to unlock
              </p>
            ) : earned?.earned_at ? (
              <p className="mt-auto pt-1 text-[10px] text-muted-foreground/80">
                Unlocked{" "}
                {new Date(earned.earned_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export function ProfileGamification({ userId, className, badgesOnly = false }: ProfileGamificationProps) {
  const [xp, setXp] = useState<number | null>(null)
  const [currentTitle, setCurrentTitle] = useState<string>("Rookie Jammer")
  const [badges, setBadges] = useState<BadgeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      if (badgesOnly) {
        const { data, error: badgesError } = await supabase
          .from("user_badges")
          .select("badge_id, earned_at")
          .eq("user_id", userId)
        if (badgesError) {
          setError(badgesError.message)
          setBadges([])
        } else {
          setBadges((data ?? []) as BadgeRow[])
        }
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-muted" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (badgesOnly) {
    return (
      <Card
        className={cn(
          "relative overflow-hidden border border-amber-500/20 bg-white/[0.05] shadow-md shadow-amber-500/5 backdrop-blur-xl dark:border-amber-500/15 dark:bg-slate-900/45 light:bg-white/75",
          className,
        )}
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-gradient-to-br from-amber-500/10 via-teal/10 to-peach/10 blur-3xl"
          aria-hidden
        />
        <CardHeader className="relative space-y-0 border-b border-border/40 pb-3 pt-4 dark:border-border/50 sm:pt-6">
          <h3 className="text-xs font-semibold uppercase tracking-tight text-muted-foreground sm:text-sm">
            Badges
          </h3>
          {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
        </CardHeader>
        <CardContent className="relative pb-4 pt-0 sm:pb-6">
          <GamificationBadgeGrid sortedBadgeIds={sortedBadgeIds} earnedIds={earnedIds} badges={badges} />
        </CardContent>
      </Card>
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
            <div
              className={cn(
                "level-badge-animated flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal/30 to-lavender/25 text-2xl ring-2 ring-teal/30",
              )}
              aria-hidden
            >
              <Trophy className="size-7 text-teal" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Jammer rank
              </p>
              <p className="mb-1 mt-0.5 inline-flex max-w-full items-center gap-2 rounded-full border border-lavender/35 bg-lavender/10 px-3 py-1 text-xs font-bold tracking-tight text-lavender">
                <span aria-hidden>⚔️</span>
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
                  <Sparkles className="size-3.5 text-peach" />
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
