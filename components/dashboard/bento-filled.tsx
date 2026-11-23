import { BadgeMedallion } from "@/components/badge-medallion"
import { BentoCard } from "@/components/dashboard/bento-card"
import type {
  BentoBadge,
  BentoFeedItem,
  BentoKpis,
  BentoLevel,
  BentoLiveJam,
  BentoQuest,
  BentoSquad,
  BentoSquadMatch,
  BentoTone,
  BentoUpcomingJam,
  BentoXpWeek,
} from "@/components/dashboard/bento-data"
import {
  ALL_BADGE_IDS,
  BADGE_DICTIONARY,
  getClosestBadgeProgress,
  type BadgeCatalogMeta,
} from "@/components/profile-gamification"
import { AppIcon } from "@/components/ui/app-icon"
import type { BadgeProgressSnapshot } from "@/lib/gamification-badge-progress"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"

/**
 * Filled Bento tiles (T7c v3). Pure presentational: data comes in via props
 * (`BentoDashboardData`), never fetched here. Same tile sizes as the T7 placeholders.
 */

const SOLID: Record<BentoTone, string> = {
  teal: "bg-teal text-teal-foreground",
  pink: "bg-pink text-pink-foreground",
  lavender: "bg-lavender text-lavender-foreground",
  peach: "bg-peach text-peach-foreground",
  mint: "bg-mint text-mint-foreground",
}

const SOFT: Record<BentoTone, string> = {
  teal: "bg-teal/15 text-teal",
  pink: "bg-pink/15 text-pink",
  lavender: "bg-lavender/15 text-lavender",
  peach: "bg-peach/15 text-peach",
  mint: "bg-mint/15 text-mint",
}

function percent(value: number, total: number): number {
  if (total <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)))
}

/* ——— Level & XP hero ——— */

export function LevelHero({ level, compact }: { level: BentoLevel; compact?: boolean }) {
  const pct = percent(level.xp, level.xpForNextLevel)
  const toNext = Math.max(level.xpForNextLevel - level.xp, 0)
  return (
    <BentoCard
      tone="hero"
      className={cn(compact ? "gap-3 p-4" : "flex-row items-center gap-6 p-6 md:p-7")}
    >
      <div
        className={cn(
          "relative shrink-0 rounded-full border-2 border-border bg-background",
          compact ? "size-[76px]" : "size-[170px]",
        )}
      >
        <div className="absolute inset-[10%] rounded-full border-[8px] border-muted md:border-[12px]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[8px] font-black tracking-[0.14em] text-muted-foreground md:text-[11px]">
            {compact ? "LVL" : "LEVEL"}
          </span>
          <span
            className={cn(
              "font-black leading-none text-foreground",
              compact ? "text-2xl" : "text-5xl",
            )}
          >
            {level.level}
          </span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex h-6 items-center rounded-full border border-teal/40 bg-teal/15 px-2.5 text-xs font-extrabold text-teal">
            {level.title}
          </span>
          {!compact && level.seasonRank != null ? (
            <span className="inline-flex h-6 items-center rounded-full border border-lavender/40 bg-lavender/15 px-2.5 text-xs font-extrabold text-lavender">
              Season rank #{level.seasonRank}
            </span>
          ) : null}
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <p className={cn("truncate font-extrabold", compact ? "text-sm" : "text-lg")}>
            {toNext} XP to Level {level.level + 1}
          </p>
          <span className="shrink-0 text-xs font-bold text-muted-foreground">
            {level.xp} / {level.xpForNextLevel} XP
          </span>
        </div>
        <div
          className={cn(
            "mt-3 overflow-hidden rounded-xl border border-border bg-background",
            compact ? "h-3.5" : "h-[22px]",
          )}
          role="progressbar"
          aria-label="Progress to next level"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div className="h-full bg-gradient-to-r from-teal to-peach" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <HeroPill icon={ICON.dates} tone="peach" label={`${level.streakDays}-day streak`} />
          {level.xpThisWeek != null ? (
            <HeroPill icon={ICON.xp} tone="teal" label={`+${level.xpThisWeek} XP this week`} />
          ) : null}
          {!compact ? (
            <HeroPill icon={ICON.kudos} tone="pink" label={`${level.kudos} kudos received`} />
          ) : null}
        </div>
        {level.nextTitle && level.nextTitleLevel != null ? (
          <p className="mt-3 text-xs font-semibold text-muted-foreground">
            Next title: {level.nextTitle} at Level {level.nextTitleLevel}
          </p>
        ) : null}
      </div>
    </BentoCard>
  )
}

function HeroPill({
  icon,
  tone,
  label,
}: {
  icon: typeof ICON.xp
  tone: "peach" | "teal" | "pink"
  label: string
}) {
  return (
    <span className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-border bg-background/60 px-3 text-xs font-extrabold">
      <AppIcon icon={icon} size="sm" tone={tone} />
      {label}
    </span>
  )
}

/* ——— KPIs ——— */

export function KpiGrid({ kpis }: { kpis: BentoKpis }) {
  const items = [
    { tone: "mint" as const, label: "Active squads", icon: ICON.squad, tilt: "-rotate-1", ...kpis.activeSquads },
    { tone: "peach" as const, label: "Jams joined", icon: ICON.jam, tilt: "rotate-1", ...kpis.jamsJoined },
    { tone: "lavender" as const, label: "Games shipped", icon: ICON.publish, tilt: "rotate-1", ...kpis.gamesShipped },
    { tone: "pink" as const, label: "Applications", icon: ICON.applications, tilt: "-rotate-1", ...kpis.applications },
  ]
  return (
    <div className="grid h-full grid-cols-2 gap-[18px]">
      {items.map((item) => (
        <BentoCard
          key={item.label}
          tone={item.tone}
          neo
          className={cn("min-h-[126px] justify-between p-4", item.tilt)}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-background/20">
              <AppIcon icon={item.icon} size="md" />
            </span>
            <span className="truncate pt-1 text-right text-[11px] font-extrabold opacity-75">
              {item.hint}
            </span>
          </div>
          <div>
            <p className="mb-1 text-[32px] font-black leading-none">{item.value ?? "—"}</p>
            <p className="text-[13px] font-extrabold">{item.label}</p>
          </div>
        </BentoCard>
      ))}
    </div>
  )
}

export function MobileKpiStrip({ kpis, xpThisWeek }: { kpis: BentoKpis; xpThisWeek: number | null }) {
  const items = [
    { tone: "bg-mint text-mint-foreground", label: "Squads", value: kpis.activeSquads.value },
    { tone: "bg-peach text-peach-foreground", label: "Jams", value: kpis.jamsJoined.value },
    { tone: "bg-lavender text-lavender-foreground", label: "Shipped", value: kpis.gamesShipped.value },
    { tone: "bg-pink text-pink-foreground", label: "XP / week", value: xpThisWeek },
  ]
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn("flex flex-col items-center rounded-xl px-1 py-1.5", item.tone)}
        >
          <span className="mb-0.5 text-base font-black leading-4">{item.value ?? "—"}</span>
          <span className="text-[10px] font-extrabold">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ——— Live jam ——— */

function LivePill() {
  return (
    <span className="inline-flex h-5 w-fit items-center gap-1 rounded-full bg-pink-foreground px-2 text-[10px] font-black tracking-wide text-pink">
      <span className="size-1.5 rounded-full bg-pink" aria-hidden />
      LIVE
    </span>
  )
}

function JamTimeBar({ jam }: { jam: BentoLiveJam }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs font-extrabold">
        <span className="inline-flex items-center gap-1">
          <AppIcon icon={ICON.time} size="xs" />
          Ends in {jam.endsIn}
        </span>
        <span className="opacity-75">{jam.elapsedPercent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-background/25">
        <div className="h-full rounded-full bg-pink-foreground" style={{ width: `${jam.elapsedPercent}%` }} />
      </div>
    </div>
  )
}

export function LiveJamCard({ jam }: { jam: BentoLiveJam }) {
  return (
    <BentoCard
      tone="live"
      title="Live jam"
      icon={ICON.jam}
      action={<LivePill />}
      className="min-h-[280px]"
    >
      <div className="flex flex-1 flex-col">
        <p className="text-xl font-black leading-tight">{jam.name}</p>
        {jam.theme ? <p className="mt-1 text-sm font-bold opacity-80">Theme: {jam.theme}</p> : null}
        <div className="mt-4">
          <JamTimeBar jam={jam} />
        </div>
        <div className="mt-auto flex items-center gap-2.5 pt-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-background/20 text-xs font-black">
            {initialsOf(jam.squadName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold">{jam.squadName}</p>
            <p className="truncate text-xs font-semibold opacity-75">
              {jam.squadMembers}/{jam.squadMax} members
              {jam.entries != null ? ` · ${jam.entries} entries so far` : ""}
            </p>
          </div>
        </div>
      </div>
    </BentoCard>
  )
}

export function LiveJamSlide({ jam }: { jam: BentoLiveJam }) {
  return (
    <BentoCard tone="live" neo className="h-[188px]">
      <div className="flex flex-1 flex-col">
        <LivePill />
        <p className="mt-2 truncate text-lg font-black leading-tight">{jam.name}</p>
        {jam.theme ? <p className="truncate text-xs font-bold opacity-80">Theme: {jam.theme}</p> : null}
        <div className="mt-3">
          <JamTimeBar jam={jam} />
        </div>
        <p className="mt-auto truncate text-xs font-extrabold">
          {jam.squadName} · {jam.squadMembers}/{jam.squadMax} members
        </p>
      </div>
    </BentoCard>
  )
}

export function UpcomingJamSlide({ jam }: { jam: BentoUpcomingJam }) {
  return (
    <BentoCard neo className="h-[188px]">
      <div className="flex flex-1 flex-col">
        <DateBlock jam={jam} />
        <p className="mt-3 truncate text-base font-black">{jam.name}</p>
        <p className="truncate text-xs font-semibold text-muted-foreground">{jam.startsIn}</p>
        <span className="mt-auto w-fit rounded-full border border-border px-2 py-0.5 text-[11px] font-extrabold text-muted-foreground">
          {jam.duration} jam
        </span>
      </div>
    </BentoCard>
  )
}

function DateBlock({ jam }: { jam: BentoUpcomingJam }) {
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 flex-col items-center justify-center rounded-xl leading-none",
        SOLID[jam.tone],
      )}
    >
      <span className="text-[9px] font-black uppercase">{jam.month}</span>
      <span className="text-sm font-black">{jam.day}</span>
    </span>
  )
}

/* ——— Quests ——— */

export function questXpLeft(quests: BentoQuest[]): number {
  return quests.reduce((sum, q) => sum + (q.progress >= q.total ? 0 : q.xp), 0)
}

export function QuestRow({ quest }: { quest: BentoQuest }) {
  const pct = percent(quest.progress, quest.total)
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <span className="mt-0.5 size-4 shrink-0 rounded-[4px] border-2 border-warning" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-extrabold">{quest.title}</p>
          <span className="shrink-0 text-xs font-extrabold text-peach">+{quest.xp} XP</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-peach" style={{ width: `${pct}%` }} />
          </div>
          <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
            {quest.progress}/{quest.total}
          </span>
        </div>
      </div>
    </div>
  )
}

export function QuestsCard({ quests }: { quests: BentoQuest[] }) {
  return (
    <BentoCard
      title="Next quests"
      icon={ICON.roleWanted}
      iconTone="peach"
      action={
        <span className="text-xs font-extrabold text-peach">+{questXpLeft(quests)} XP left</span>
      }
      className="min-h-[280px]"
    >
      <div className="flex flex-1 flex-col gap-3">
        {quests.map((quest) => (
          <QuestRow key={quest.id} quest={quest} />
        ))}
      </div>
    </BentoCard>
  )
}

/** Compact row used inside the mobile quest accordion. */
export function QuestPill({ quest }: { quest: BentoQuest }) {
  return (
    <div className="flex h-11 min-w-0 items-center gap-2.5 rounded-xl bg-background px-3">
      <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold">{quest.title}</span>
      <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
        {quest.progress}/{quest.total}
      </span>
      <span className="shrink-0 text-xs font-extrabold text-peach">+{quest.xp} XP</span>
    </div>
  )
}

/* ——— Badges (T7c v4: the site's real badges, medal art and progress rules) ——— */

type BadgeShelfItem = BentoBadge & { meta: BadgeCatalogMeta }

/** Joins mocked earned/locked state with the site's badge catalog and its closest-unlock rule. */
export function badgeShelf(badges: BentoBadge[], progress: BadgeProgressSnapshot) {
  const items: BadgeShelfItem[] = badges
    .filter((badge) => Boolean(BADGE_DICTIONARY[badge.id]))
    .map((badge) => ({ ...badge, meta: BADGE_DICTIONARY[badge.id] }))
  const earnedIds = new Set(items.filter((item) => item.earned).map((item) => item.id))
  return {
    items,
    earned: earnedIds.size,
    total: ALL_BADGE_IDS.length,
    next: getClosestBadgeProgress(progress, earnedIds),
  }
}

function ShelfGrid({ items, dense }: { items: BadgeShelfItem[]; dense?: boolean }) {
  return (
    <ul className={cn("grid grid-cols-5", dense ? "gap-x-1 gap-y-2" : "gap-x-1.5 gap-y-2")}>
      {items.map((item) => (
        <li
          key={item.id}
          className="flex min-w-0 flex-col items-center gap-1 text-center"
          title={item.earned ? item.meta.label : `${item.meta.label} (locked)`}
        >
          <BadgeMedallion
            badgeId={item.id}
            rarity={item.meta.rarity}
            size="md"
            locked={!item.earned}
          />
          <span
            className={cn(
              "w-full font-extrabold",
              dense ? "text-balance break-words text-[10px] leading-tight" : "truncate text-[11px]",
              !item.earned && "text-muted-foreground",
            )}
          >
            {item.meta.label}
            {item.earned ? null : <span className="sr-only"> (locked)</span>}
          </span>
        </li>
      ))}
    </ul>
  )
}

function AlmostThere({
  next,
  dense,
}: {
  next: NonNullable<ReturnType<typeof badgeShelf>["next"]>
  dense?: boolean
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-xl border border-dashed border-peach/60 bg-peach/10",
        dense ? "mt-3 p-2.5" : "mt-auto p-2.5",
      )}
    >
      <BadgeMedallion badgeId={next.badgeId} rarity={next.meta.rarity} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-[13px] font-extrabold">Almost there: {next.meta.label}</p>
          <span className="shrink-0 text-xs font-extrabold tabular-nums text-peach">
            {next.progress.current}/{next.progress.target}
          </span>
        </div>
        <p className="truncate text-[11px] font-semibold text-muted-foreground">{next.meta.blurb}</p>
        <div
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label={`${next.meta.label}: ${next.progress.label}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={next.percent}
        >
          <div className="h-full rounded-full bg-peach" style={{ width: `${next.percent}%` }} />
        </div>
      </div>
    </div>
  )
}

export function BadgeShelfCard({
  badges,
  progress,
}: {
  badges: BentoBadge[]
  progress: BadgeProgressSnapshot
}) {
  const shelf = badgeShelf(badges, progress)
  return (
    <BentoCard
      title="Badge shelf"
      icon={ICON.achievement}
      iconTone="lavender"
      action={
        <span className="text-xs font-extrabold tabular-nums text-muted-foreground">
          {shelf.earned} / {shelf.total}
        </span>
      }
      className="min-h-[280px]"
    >
      <div className="flex flex-1 flex-col gap-2.5">
        <ShelfGrid items={shelf.items} />
        {shelf.next ? <AlmostThere next={shelf.next} /> : null}
      </div>
    </BentoCard>
  )
}

export function MobileBadgeShelf({
  badges,
  progress,
}: {
  badges: BentoBadge[]
  progress: BadgeProgressSnapshot
}) {
  const shelf = badgeShelf(badges, progress)
  return (
    <BentoCard neo className="p-3.5">
      <ShelfGrid items={shelf.items} dense />
      {shelf.next ? (
        <AlmostThere next={shelf.next} dense />
      ) : (
        <p className="mt-3 truncate text-xs font-semibold text-muted-foreground">All badges unlocked</p>
      )}
    </BentoCard>
  )
}

/* ——— XP per week (CSS bar chart, charter tokens, no chart lib) ——— */

export function XpWeekCard({ weeks }: { weeks: BentoXpWeek[] }) {
  const max = Math.max(1, ...weeks.map((w) => w.xp))
  const current = weeks[weeks.length - 1]
  const total = weeks.reduce((sum, w) => sum + w.xp, 0)
  const summary = weeks.map((w) => `${w.label}: ${w.xp} XP`).join(", ")
  return (
    <BentoCard
      title="XP per week"
      icon={ICON.xp}
      iconTone="teal"
      action={
        <span className="rounded-full border border-teal/40 bg-teal/15 px-2 py-0.5 text-[11px] font-extrabold text-teal">
          +{current?.xp ?? 0} XP
        </span>
      }
      className="min-h-[220px]"
    >
      <div className="flex flex-1 flex-col">
        <div
          className="flex h-[104px] items-end gap-2"
          role="img"
          aria-label={`XP earned per week, ${total} XP over the last ${weeks.length} weeks. ${summary}`}
        >
          {weeks.map((week, i) => {
            const isCurrent = i === weeks.length - 1
            return (
              <div key={week.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                <span
                  className={cn(
                    "text-[10px] font-extrabold",
                    isCurrent ? "text-teal" : "text-muted-foreground",
                  )}
                >
                  {week.xp}
                </span>
                <div
                  className={cn("w-full rounded-t-md", isCurrent ? "bg-teal" : "bg-teal/35")}
                  style={{ height: `${Math.max(6, (week.xp / max) * 80)}%` }}
                />
              </div>
            )
          })}
        </div>
        <div className="mt-1.5 flex gap-2 border-t border-border pt-1.5" aria-hidden>
          {weeks.map((week) => (
            <span key={week.label} className="min-w-0 flex-1 text-center text-[10px] font-bold text-muted-foreground">
              {week.label}
            </span>
          ))}
        </div>
      </div>
    </BentoCard>
  )
}

/* ——— Up next ——— */

export function UpNextCard({ jams }: { jams: BentoUpcomingJam[] }) {
  return (
    <BentoCard title="Up next" icon={ICON.dates} iconTone="mint" className="min-h-[220px]">
      <ul className="flex flex-1 flex-col gap-3">
        {jams.map((jam) => (
          <li key={jam.id} className="flex min-w-0 items-center gap-2.5">
            <DateBlock jam={jam} />
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">{jam.name}</p>
              <p className="truncate text-[11px] font-semibold text-muted-foreground">
                {jam.startsIn} · {jam.duration}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </BentoCard>
  )
}

/* ——— Crew feed ——— */

export function CrewFeedCard({ items }: { items: BentoFeedItem[] }) {
  return (
    <BentoCard title="Crew feed" icon={ICON.note} iconTone="pink" className="min-h-[220px]">
      <ul className="flex flex-1 flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="flex min-w-0 items-center gap-2.5">
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-black",
                SOLID[item.tone],
              )}
              aria-hidden
            >
              {item.initials}
            </span>
            <p className="min-w-0 flex-1 truncate text-[13px] font-semibold">
              <span className="font-extrabold">{item.actor}</span>{" "}
              <span className="text-muted-foreground">{item.text}</span>
            </p>
            <span className="shrink-0 text-[11px] font-semibold text-muted-foreground">{item.time}</span>
          </li>
        ))}
      </ul>
    </BentoCard>
  )
}

/* ——— Squads ——— */

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter((part) => /[A-Za-z0-9]/.test(part))
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function SquadBody({ squad }: { squad: BentoSquad }) {
  return (
    <>
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-xl text-xs font-black",
            SOLID[squad.tone],
          )}
          aria-hidden
        >
          {squad.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold">{squad.name}</p>
          <p className="truncate text-[11px] font-semibold text-muted-foreground">{squad.jam}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1" aria-label={`${squad.members} of ${squad.maxMembers} members`}>
        {Array.from({ length: squad.maxMembers }).map((_, i) => (
          <span
            key={i}
            className={cn("size-2 rounded-full", i < squad.members ? "bg-teal" : "bg-muted")}
            aria-hidden
          />
        ))}
        <span className="ml-1 text-[11px] font-bold text-muted-foreground">
          {squad.members}/{squad.maxMembers}
        </span>
      </div>
      <span
        className={cn(
          "mt-auto inline-flex w-fit max-w-full truncate rounded-full px-2 py-0.5 text-[11px] font-extrabold",
          SOFT[squad.tone],
        )}
      >
        {squad.status}
      </span>
    </>
  )
}

export function MySquadsCard({ squads }: { squads: BentoSquad[] }) {
  return (
    <BentoCard
      title="My squads"
      icon={ICON.squad}
      iconTone="teal"
      action={<span className="text-xs font-extrabold text-teal">Manage</span>}
      className="min-h-[200px]"
    >
      <div className="grid flex-1 grid-cols-3 gap-3">
        {squads.map((squad) => (
          <div
            key={squad.id}
            className="flex min-w-0 flex-col gap-0 rounded-xl border border-border bg-background/40 p-3"
          >
            <SquadBody squad={squad} />
          </div>
        ))}
      </div>
    </BentoCard>
  )
}

export function SquadSlide({ squad }: { squad: BentoSquad }) {
  return (
    <BentoCard neo className="min-h-[160px]">
      <div className="flex flex-1 flex-col">
        <SquadBody squad={squad} />
      </div>
    </BentoCard>
  )
}

/* ——— Squad match ——— */

export function SquadMatchCard({ match }: { match: BentoSquadMatch }) {
  return (
    <BentoCard
      tone="match"
      title="Squad match"
      icon={ICON.recommended}
      action={
        <span className="rounded-full bg-teal-foreground px-2 py-0.5 text-[11px] font-black text-teal">
          {match.fitPercent}% fit
        </span>
      }
      className="min-h-[200px]"
    >
      <div className="flex flex-1 flex-col">
        <p className="truncate text-lg font-black leading-tight">{match.squadName}</p>
        <p className="truncate text-sm font-bold opacity-85">needs a {match.role}</p>
        <p className="mt-1 truncate text-xs font-semibold opacity-75">
          {match.jam} · {match.reason}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-3">
          <div className="flex -space-x-1.5">
            {match.memberInitials.map((initials) => (
              <span
                key={initials}
                className="grid size-8 place-items-center rounded-full border-2 border-teal bg-teal-foreground text-[10px] font-black text-teal"
                aria-hidden
              >
                {initials}
              </span>
            ))}
          </div>
          <span className="text-xs font-extrabold">1 seat open</span>
        </div>
      </div>
    </BentoCard>
  )
}
