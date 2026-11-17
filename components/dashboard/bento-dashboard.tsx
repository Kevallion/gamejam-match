"use client"

import { useState } from "react"
import { BentoCard } from "@/components/dashboard/bento-card"
import { BentoCarousel } from "@/components/dashboard/bento-carousel"
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

function QuestAccordionPlaceholder() {
  const [open, setOpen] = useState(true)
  return (
    <div className="space-y-2.5">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div
          className={cn(
            "overflow-hidden rounded-[22px] border-2 border-[var(--neo-shadow)] bg-card",
            "shadow-[4px_4px_0_0_var(--neo-shadow)]",
          )}
        >
          <CollapsibleTrigger
            className={cn(
              "flex w-full items-center gap-2.5 px-3.5 py-3.5 text-left",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
            )}
          >
            <span
              className="size-5 shrink-0 rounded-[7px] border-2 border-warning"
              aria-hidden
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-extrabold">Next quest</span>
              <span className="block text-[11.5px] font-semibold text-muted-foreground">
                Quests will appear here
              </span>
            </span>
            <span className="grid size-[30px] place-items-center rounded-[10px] bg-background">
              <AppIcon
                icon={ICON.navDown}
                size="sm"
                className={cn("transition-transform", open && "rotate-180")}
              />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2 px-3.5 pb-3.5">
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
      <Collapsible>
        <div
          className={cn(
            "overflow-hidden rounded-[22px] border-2 border-[var(--neo-shadow)] bg-card",
            "shadow-[4px_4px_0_0_var(--neo-shadow)]",
          )}
        >
          <CollapsibleTrigger
            className={cn(
              "flex w-full items-center gap-2.5 px-3.5 py-3 text-left",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
            )}
          >
            <span className="size-5 shrink-0 rounded-[7px] border-2 border-border" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-extrabold">More quests</span>
              <span className="block text-[11.5px] font-semibold text-muted-foreground">
                Coming soon
              </span>
            </span>
            <span className="grid size-[30px] place-items-center rounded-[10px] bg-background">
              <AppIcon icon={ICON.navDown} size="sm" />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3.5 pb-3.5">
              <Skeleton className="h-10 w-full rounded-xl" />
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
          "relative shrink-0 rounded-full border-[3px] border-[var(--neo-shadow)] bg-background",
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
            "mt-3 overflow-hidden rounded-xl border-2 border-[var(--neo-shadow)] bg-background",
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
            <span className="grid size-9 place-items-center rounded-xl bg-[color-mix(in_oklch,var(--neo-shadow)_18%,transparent)]">
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
 * All cards are placeholders; real content lands in T8.
 */
export function BentoDashboard({ displayName }: BentoDashboardProps) {
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
          <span className="inline-flex h-10 items-center gap-1.5 rounded-xl border-2 border-[var(--neo-shadow)] bg-card px-3.5 text-[13px] font-extrabold shadow-[3px_3px_0_0_var(--neo-shadow)]">
            <AppIcon icon={ICON.xp} size="sm" tone="peach" />
            Streak soon
          </span>
          <span className="inline-flex h-10 items-center gap-1.5 rounded-xl border-2 border-[var(--neo-shadow)] bg-card px-3.5 text-[13px] font-extrabold shadow-[3px_3px_0_0_var(--neo-shadow)]">
            <AppIcon icon={ICON.info} size="sm" tone="lavender" />
            Press 1–6 to switch
          </span>
        </div>
      </div>

      {/* ——— Desktop bento (≥1024px) ——— */}
      <BentoGrid>
        <BentoCell span={7}>
          <LevelHeroPlaceholder />
        </BentoCell>
        <BentoCell span={5}>
          <KpiPlaceholderGrid />
        </BentoCell>

        <BentoCell span={4}>
          <BentoCard
            tone="live"
            title="Live jam"
            icon={ICON.jam}
            iconTone="muted"
            placeholder
            emptyLabel="No live jam right now"
            skeletonLines={5}
            className="min-h-[280px]"
          />
        </BentoCell>
        <BentoCell span={3}>
          <BentoCard
            title="Next quests"
            icon={ICON.roleWanted}
            iconTone="peach"
            placeholder
            emptyLabel="No quests yet"
            skeletonLines={4}
            className="min-h-[280px]"
          />
        </BentoCell>
        <BentoCell span={5}>
          <BentoCard
            title="Badge shelf"
            icon={ICON.achievement}
            iconTone="lavender"
            placeholder
            emptyLabel="Badges unlock as you play"
            skeletonLines={4}
            className="min-h-[280px]"
          />
        </BentoCell>

        <BentoCell span={5}>
          <BentoCard
            title="XP per week"
            icon={ICON.xp}
            iconTone="teal"
            placeholder
            emptyLabel="XP chart coming soon"
            skeletonLines={4}
            className="min-h-[220px]"
          />
        </BentoCell>
        <BentoCell span={3}>
          <BentoCard
            title="Up next"
            icon={ICON.dates}
            iconTone="mint"
            placeholder
            emptyLabel="No upcoming jams"
            skeletonLines={4}
            className="min-h-[220px]"
          />
        </BentoCell>
        <BentoCell span={4}>
          <BentoCard
            title="Crew feed"
            icon={ICON.note}
            iconTone="pink"
            placeholder
            emptyLabel="Activity will show up here"
            skeletonLines={4}
            className="min-h-[220px]"
          />
        </BentoCell>

        <BentoCell span={8}>
          <BentoCard
            title="My squads"
            icon={ICON.squad}
            iconTone="teal"
            placeholder
            emptyLabel="Create or join a squad to get started"
            skeletonLines={3}
            className="min-h-[200px]"
          />
        </BentoCell>
        <BentoCell span={4}>
          <BentoCard
            tone="match"
            title="Squad match"
            icon={ICON.recommended}
            placeholder
            emptyLabel="Matches appear when a seat is open"
            skeletonLines={3}
            className="min-h-[200px]"
          />
        </BentoCell>
      </BentoGrid>

      {/* ——— Mobile 2 (< lg) ——— */}
      <div className="space-y-5 lg:hidden">
        <LevelHeroPlaceholder compact />
        <div className="-mt-1">
          <MobileKpiStrip />
        </div>

        <section>
          <SectionHeading
            icon={ICON.dates}
            tone="pink"
            title="Live & upcoming"
            action="All jams"
          />
          <BentoCarousel label="Live and upcoming jams" itemClassName="w-[min(292px,85%)]">
            <BentoCard
              tone="live"
              neo
              className="h-[188px]"
              placeholder
              emptyLabel="No live jam"
              skeletonLines={4}
            />
            <BentoCard
              neo
              className="h-[188px]"
              placeholder
              emptyLabel="Upcoming jam"
              skeletonLines={3}
            />
            <BentoCard
              neo
              className="h-[188px]"
              placeholder
              emptyLabel="More jams soon"
              skeletonLines={2}
            />
          </BentoCarousel>
        </section>

        <section>
          <SectionHeading icon={ICON.roleWanted} tone="peach" title="Quests" action="+ XP left" />
          <QuestAccordionPlaceholder />
        </section>

        <section>
          <SectionHeading icon={ICON.squad} tone="teal" title="My squads" action="Manage" />
          <BentoCarousel label="My squads" itemClassName="w-[min(226px,72%)]">
            <BentoCard neo className="min-h-[160px]" placeholder emptyLabel="No squad yet" skeletonLines={3} />
            <BentoCard neo className="min-h-[160px]" placeholder emptyLabel="Join a squad" skeletonLines={3} />
            <BentoCard neo className="min-h-[160px]" placeholder emptyLabel="Create a squad" skeletonLines={2} />
          </BentoCarousel>
        </section>

        <section>
          <SectionHeading icon={ICON.achievement} tone="lavender" title="Badge shelf" action="0 / 0" />
          <BentoCard neo className="p-3.5" placeholder emptyLabel="Earn badges by jamming" skeletonLines={2} />
        </section>
      </div>
    </div>
  )
}
