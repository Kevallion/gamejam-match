"use client"

import { useState } from "react"
import { BentoCard } from "@/components/dashboard/bento-card"
import { BentoCarousel } from "@/components/dashboard/bento-carousel"
import type { BentoDashboardData } from "@/components/dashboard/bento-data"
import {
  BadgeShelfCard,
  badgeShelf,
  CrewFeedCard,
  KpiGrid,
  LevelHero,
  LiveJamCard,
  LiveJamSlide,
  MobileBadgeShelf,
  MobileKpiStrip as MobileKpiStripFilled,
  MySquadsCard,
  QuestPill,
  QuestsCard,
  SquadMatchCard,
  SquadSlide,
  UpNextCard,
  UpcomingJamSlide,
  XpWeekCard,
  questXpLeft,
} from "@/components/dashboard/bento-filled"
import { BentoCell, BentoGrid } from "@/components/dashboard/bento-grid"
import { AppIcon } from "@/components/ui/app-icon"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Skeleton } from "@/components/ui/skeleton"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"

type BentoDashboardProps = {
  displayName: string
  /**
   * Card content built from real data (DS-3a, bento-real.ts); undefined while loading.
   * When omitted, every card shows its skeleton.
   */
  data?: BentoDashboardData
}

function greetingDateLabel(now = new Date()): string {
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })
}

function SectionHeading({
  icon,
  tone,
  title,
  action,
}: {
  icon: typeof ICON.dates
  tone?: "teal" | "lavender" | "peach" | "pink" | "mint"
  title: string
  action?: string
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2 px-0.5">
      <h2 className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight">
        <AppIcon icon={icon} size="md" tone={tone} />
        {title}
      </h2>
      {action ? (
        <span className="text-[12.5px] font-extrabold text-teal">{action}</span>
      ) : null}
    </div>
  )
}

function QuestAccordionPlaceholder({ data }: { data?: BentoDashboardData }) {
  const [open, setOpen] = useState(true)
  const quests = data?.quests ?? []
  const firstQuests = quests.slice(0, 2)
  const moreQuests = quests.slice(2)
  return (
    <div className="space-y-2.5">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-border bg-card",
            "shadow-[3px_3px_0_0_var(--neo-shadow)]",
          )}
        >
          <CollapsibleTrigger
            className={cn(
              "flex w-full items-center gap-2.5 px-3.5 py-3.5 text-left",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
            )}
          >
            <span
              className="size-5 shrink-0 rounded-[4px] border-2 border-warning"
              aria-hidden
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-extrabold">Next quest</span>
              <span className="block truncate text-[11.5px] font-semibold text-muted-foreground">
                {firstQuests[0]
                  ? `${firstQuests[0].title} · +${firstQuests[0].xp} XP`
                  : "Quests will appear here"}
              </span>
            </span>
            <span className="grid size-[30px] place-items-center rounded-lg bg-background">
              <AppIcon
                icon={ICON.navDown}
                size="sm"
                className={cn("transition-transform", open && "rotate-180")}
              />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2 px-3.5 pb-3.5">
              {firstQuests.length > 0 ? (
                firstQuests.map((quest) => <QuestPill key={quest.id} quest={quest} />)
              ) : (
                <>
                  <Skeleton className="h-11 w-full rounded-xl" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
      <Collapsible>
        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-border bg-card",
            "shadow-[3px_3px_0_0_var(--neo-shadow)]",
          )}
        >
          <CollapsibleTrigger
            className={cn(
              "flex w-full items-center gap-2.5 px-3.5 py-3 text-left",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
            )}
          >
            <span className="size-5 shrink-0 rounded-[4px] border-2 border-border" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-extrabold">More quests</span>
              <span className="block truncate text-[11.5px] font-semibold text-muted-foreground">
                {moreQuests.length > 0
                  ? `${moreQuests.length} more · +${questXpLeft(moreQuests)} XP`
                  : "Coming soon"}
              </span>
            </span>
            <span className="grid size-[30px] place-items-center rounded-lg bg-background">
              <AppIcon icon={ICON.navDown} size="sm" />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2 px-3.5 pb-3.5">
              {moreQuests.length > 0 ? (
                moreQuests.map((quest) => <QuestPill key={quest.id} quest={quest} />)
              ) : (
                <Skeleton className="h-10 w-full rounded-xl" />
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}

function LevelHeroPlaceholder({ compact }: { compact?: boolean }) {
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
        aria-hidden
      >
        <div className="absolute inset-[10%] rounded-full border-[8px] border-muted md:border-[12px]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[8px] font-black tracking-[0.14em] text-muted-foreground md:text-[11px]">
            {compact ? "LVL" : "LEVEL"}
          </span>
          <Skeleton className={cn("rounded-md", compact ? "h-7 w-8" : "h-12 w-14")} />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          {!compact ? <Skeleton className="h-6 w-28 rounded-full" /> : null}
        </div>
        <Skeleton className={cn("mt-3 rounded-full", compact ? "h-3.5 w-full" : "h-5 w-48")} />
        <div
          className={cn(
            "mt-3 overflow-hidden rounded-xl border border-border bg-background",
            compact ? "h-3.5" : "h-[22px]",
          )}
        >
          <div className="h-full w-3/5 bg-gradient-to-r from-teal to-peach" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
          {!compact ? <Skeleton className="h-8 w-32 rounded-xl" /> : null}
        </div>
        <p className="mt-3 text-xs font-semibold text-muted-foreground">
          Level & XP — content arrives in a later update
        </p>
      </div>
    </BentoCard>
  )
}

function KpiPlaceholderGrid() {
  const tones = [
    { tone: "mint" as const, label: "Active squads", tilt: "-rotate-1" },
    { tone: "peach" as const, label: "Jams joined", tilt: "rotate-1" },
    { tone: "lavender" as const, label: "Games shipped", tilt: "rotate-1" },
    { tone: "pink" as const, label: "Applications", tilt: "-rotate-1" },
  ]
  return (
    <div className="grid h-full grid-cols-2 gap-[18px]">
      {tones.map((item) => (
        <BentoCard
          key={item.label}
          tone={item.tone}
          neo
          className={cn("min-h-[126px] justify-between p-4", item.tilt)}
        >
          <div className="flex items-start justify-between">
            <span className="grid size-9 place-items-center rounded-xl bg-background/20">
              <AppIcon icon={ICON.squad} size="md" />
            </span>
            <Skeleton className="h-4 w-16 rounded-md opacity-50" />
          </div>
          <div>
            <Skeleton className="mb-1 h-9 w-12 rounded-md opacity-50" />
            <p className="text-[13px] font-extrabold">{item.label}</p>
          </div>
        </BentoCard>
      ))}
    </div>
  )
}

function MobileKpiStrip() {
  const items = [
    { tone: "bg-mint text-mint-foreground", label: "Squads" },
    { tone: "bg-peach text-peach-foreground", label: "Jams" },
    { tone: "bg-lavender text-lavender-foreground", label: "Shipped" },
    { tone: "bg-pink text-pink-foreground", label: "XP / week" },
  ]
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "flex flex-col items-center rounded-xl px-1 py-1.5",
            item.tone,
          )}
        >
          <Skeleton className="mb-0.5 h-4 w-6 rounded opacity-40" />
          <span className="text-[10px] font-extrabold">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * T7 Bento home — desktop grid + mobile carousels/accordions.
 * Cards render `data` when provided (T7c mock now, real query in T9), else T7 placeholders.
 */
export function BentoDashboard({ displayName, data }: BentoDashboardProps) {
  const firstName = displayName.trim().split(/\s+/)[0] || "Jammer"
  const dateLabel = greetingDateLabel()

  return (
    <div className="min-w-0">
      {/* Desktop greeting */}
      <div className="mb-5 hidden items-end justify-between gap-4 lg:flex">
        <div>
          <p className="text-[13px] font-extrabold text-muted-foreground">{dateLabel}</p>
          <h1 className="text-[30px] font-black tracking-tight">
            Hey {firstName}, ready to jam?
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 text-[13px] font-extrabold shadow-[3px_3px_0_0_var(--neo-shadow)]">
            <AppIcon icon={ICON.xp} size="sm" tone="peach" />
            {data ? `${data.level.streakDays}-day streak` : "Streak soon"}
          </span>
          <span className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 text-[13px] font-extrabold shadow-[3px_3px_0_0_var(--neo-shadow)]">
            <AppIcon icon={ICON.info} size="sm" tone="lavender" />
            Press 1–6 to switch
          </span>
        </div>
      </div>

      {/* ——— Desktop bento (≥1024px) ——— */}
      <BentoGrid>
        <BentoCell span={7}>
          {data ? <LevelHero level={data.level} /> : <LevelHeroPlaceholder />}
        </BentoCell>
        <BentoCell span={5}>
          {data ? <KpiGrid kpis={data.kpis} /> : <KpiPlaceholderGrid />}
        </BentoCell>

        <BentoCell span={4}>
          {data?.liveJam ? (
            <LiveJamCard jam={data.liveJam} />
          ) : (
            <BentoCard
              tone="live"
              title="Live jam"
              icon={ICON.jam}
              iconTone="muted"
              placeholder
              emptyLabel="No live jam right now"
              skeletonLines={data ? 0 : 5}
              className="min-h-[280px]"
            />
          )}
        </BentoCell>
        <BentoCell span={3}>
          {data && data.quests.length > 0 ? (
            <QuestsCard quests={data.quests} />
          ) : (
            <BentoCard
              title="Next quests"
              icon={ICON.roleWanted}
              iconTone="peach"
              placeholder
              emptyLabel={data ? "All quests done for today" : "No quests yet"}
              skeletonLines={data ? 0 : 4}
              className="min-h-[280px]"
            />
          )}
        </BentoCell>
        <BentoCell span={5}>
          {data ? (
            <BadgeShelfCard badges={data.badges} progress={data.badgeProgress} />
          ) : (
            <BentoCard
              title="Badge shelf"
              icon={ICON.achievement}
              iconTone="lavender"
              placeholder
              emptyLabel="Badges unlock as you play"
              skeletonLines={data ? 0 : 4}
              className="min-h-[280px]"
            />
          )}
        </BentoCell>

        <BentoCell span={5}>
          {data && data.xpWeekly.length > 0 ? (
            <XpWeekCard weeks={data.xpWeekly} />
          ) : (
            <BentoCard
              title="XP per week"
              icon={ICON.xp}
              iconTone="teal"
              placeholder
              emptyLabel={data ? "Weekly XP history is not tracked yet" : "XP chart coming soon"}
              skeletonLines={data ? 0 : 4}
              className="min-h-[220px]"
            />
          )}
        </BentoCell>
        <BentoCell span={3}>
          {data && data.upcoming.length > 0 ? (
            <UpNextCard jams={data.upcoming} />
          ) : (
            <BentoCard
              title="Up next"
              icon={ICON.dates}
              iconTone="mint"
              placeholder
              emptyLabel="No upcoming jams"
              skeletonLines={data ? 0 : 4}
              className="min-h-[220px]"
            />
          )}
        </BentoCell>
        <BentoCell span={4}>
          {data && data.feed.length > 0 ? (
            <CrewFeedCard items={data.feed} />
          ) : (
            <BentoCard
              title="Crew feed"
              icon={ICON.note}
              iconTone="pink"
              placeholder
              emptyLabel="Activity will show up here"
              skeletonLines={data ? 0 : 4}
              className="min-h-[220px]"
            />
          )}
        </BentoCell>

        <BentoCell span={8}>
          {data && data.squads.length > 0 ? (
            <MySquadsCard squads={data.squads} />
          ) : (
            <BentoCard
              title="My squads"
              icon={ICON.squad}
              iconTone="teal"
              placeholder
              emptyLabel="Create or join a squad to get started"
              skeletonLines={data ? 0 : 3}
              className="min-h-[200px]"
            />
          )}
        </BentoCell>
        <BentoCell span={4}>
          {data?.match ? (
            <SquadMatchCard match={data.match} />
          ) : (
            <BentoCard
              tone="match"
              title="Squad match"
              icon={ICON.recommended}
              placeholder
              emptyLabel="Matches appear when a seat is open"
              skeletonLines={data ? 0 : 3}
              className="min-h-[200px]"
            />
          )}
        </BentoCell>
      </BentoGrid>

      {/* ——— Mobile 2 (< lg) ——— */}
      <div className="space-y-5 lg:hidden">
        {data ? <LevelHero level={data.level} compact /> : <LevelHeroPlaceholder compact />}
        <div className="-mt-1">
          {data ? (
            <MobileKpiStripFilled kpis={data.kpis} xpThisWeek={data.level.xpThisWeek} />
          ) : (
            <MobileKpiStrip />
          )}
        </div>

        <section>
          <SectionHeading
            icon={ICON.dates}
            tone="pink"
            title="Live & upcoming"
            action="All jams"
          />
          <BentoCarousel label="Live and upcoming jams" itemClassName="w-[min(292px,85%)]">
            {data && (data.liveJam || data.upcoming.length > 0)
              ? [
                  ...(data.liveJam ? [<LiveJamSlide key="live" jam={data.liveJam} />] : []),
                  ...data.upcoming.slice(0, 2).map((jam) => <UpcomingJamSlide key={jam.id} jam={jam} />),
                ]
              : [
                <BentoCard
              key="placeholder-1"
              tone="live"
              neo
              className="h-[188px]"
              placeholder
              emptyLabel="No live jam"
              skeletonLines={data ? 0 : 4}
            />,
            <BentoCard
              key="placeholder-2"
              neo
              className="h-[188px]"
              placeholder
              emptyLabel="Upcoming jam"
              skeletonLines={data ? 0 : 3}
            />,
            <BentoCard
              key="placeholder-3"
              neo
              className="h-[188px]"
              placeholder
              emptyLabel="More jams soon"
              skeletonLines={data ? 0 : 2}
            />]}
          </BentoCarousel>
        </section>

        <section>
          <SectionHeading icon={ICON.roleWanted} tone="peach" title="Quests"
            action={data ? `+${questXpLeft(data.quests)} XP left` : "+ XP left"}
          />
          <QuestAccordionPlaceholder data={data} />
        </section>

        <section>
          <SectionHeading icon={ICON.squad} tone="teal" title="My squads" action="Manage" />
          <BentoCarousel label="My squads" itemClassName="w-[min(226px,72%)]">
            {data && data.squads.length > 0
              ? data.squads.map((squad) => <SquadSlide key={squad.id} squad={squad} />)
              : [
                <BentoCard key="placeholder-1" neo className="min-h-[160px]" placeholder emptyLabel="No squad yet" skeletonLines={data ? 0 : 3} />,
            <BentoCard key="placeholder-2" neo className="min-h-[160px]" placeholder emptyLabel="Join a squad" skeletonLines={data ? 0 : 3} />,
            <BentoCard key="placeholder-3" neo className="min-h-[160px]" placeholder emptyLabel="Create a squad" skeletonLines={data ? 0 : 2} />]}
          </BentoCarousel>
        </section>

        <section>
          <SectionHeading icon={ICON.achievement} tone="lavender" title="Badge shelf"
            action={
              data
                ? `${badgeShelf(data.badges, data.badgeProgress).earned} / ${badgeShelf(data.badges, data.badgeProgress).total}`
                : "0 / 0"
            }
          />
          {data ? (
            <MobileBadgeShelf badges={data.badges} progress={data.badgeProgress} />
          ) : (
            <BentoCard neo className="p-3.5" placeholder emptyLabel="Earn badges by jamming" skeletonLines={data ? 0 : 2} />
          )}
        </section>
      </div>
    </div>
  )
}
