import Image from "next/image"
import { createElement } from "react"
import {
  Coffee,
  Crown,
  Flag,
  Flame,
  Handshake,
  HeartHandshake,
  Lock,
  Megaphone,
  Sunrise,
  Trophy,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type BadgeRarity = "common" | "uncommon" | "rare" | "epic" | "special"

export const BADGE_ICONS: Record<string, LucideIcon> = {
  early_bird: Sunrise,
  team_player: Handshake,
  founder: Flag,
  stalwart: Flame,
  multi_tool: Wrench,
  recruiter: Megaphone,
  captain: Crown,
  jam_champion: Trophy,
  supporter: Coffee,
  golden_heart: HeartHandshake,
}

/** Badge ids with custom SVG art under `/public/badges/<id>.svg` (includes rarity frame). */
export const BADGE_ART_IDS = new Set([
  "founder",
  "captain",
  "team_player",
  "early_bird",
  "stalwart",
  "recruiter",
  "multi_tool",
  "jam_champion",
  "supporter",
  "golden_heart",
])

/** Rarity per badge_id (kept here so toasts can render a medallion without loading the profile module). */
export const BADGE_RARITY: Record<string, BadgeRarity> = {
  early_bird: "common",
  team_player: "common",
  founder: "uncommon",
  stalwart: "uncommon",
  multi_tool: "rare",
  recruiter: "rare",
  captain: "rare",
  jam_champion: "epic",
  supporter: "special",
  golden_heart: "special",
}

const RARITY_RING: Record<BadgeRarity, string> = {
  common: "ring-border",
  uncommon: "ring-teal",
  rare: "ring-lavender",
  epic: "ring-amber-400",
  special: "ring-pink",
}

const SIZE: Record<"sm" | "md" | "lg", { box: string; icon: string; px: number }> = {
  sm: { box: "size-9", icon: "size-4", px: 36 },
  md: { box: "size-11", icon: "size-5", px: 44 },
  lg: { box: "size-16", icon: "size-7", px: 64 },
}

export function badgeIcon(badgeId: string): LucideIcon {
  return BADGE_ICONS[badgeId.trim().toLowerCase()] ?? Trophy
}

export function badgeRarity(badgeId: string): BadgeRarity {
  return BADGE_RARITY[badgeId.trim().toLowerCase()] ?? "common"
}

function hasBadgeArt(badgeId: string): boolean {
  return BADGE_ART_IDS.has(badgeId.trim().toLowerCase())
}

/**
 * Soft badge medallion for dashboard / profile / reward toasts.
 * Known ids render custom SVG art; unknown ids fall back to a Lucide pictogram in a rarity ring.
 */
export function BadgeMedallion({
  badgeId,
  rarity,
  size = "sm",
  locked = false,
  animate = false,
  className,
}: {
  badgeId: string
  rarity?: BadgeRarity
  size?: "sm" | "md" | "lg"
  locked?: boolean
  /** Plays the unlock "pop" animation once (reward toasts). */
  animate?: boolean
  className?: string
}) {
  const id = badgeId.trim().toLowerCase()
  const dims = SIZE[size]

  if (hasBadgeArt(id)) {
    return (
      <span
        className={cn(
          "relative inline-flex shrink-0",
          dims.box,
          locked && "opacity-[0.55] grayscale",
          animate && "badge-medallion-pop",
          className,
        )}
        aria-hidden
      >
        <Image
          src={`/badges/${id}.svg`}
          alt=""
          width={dims.px}
          height={dims.px}
          unoptimized
          className="size-full object-contain"
          aria-hidden
        />
        {locked ? (
          <span
            className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-background/95 text-muted-foreground ring-1 ring-border/70"
            aria-hidden
          >
            <Lock className="size-2.5" strokeWidth={2.25} />
          </span>
        ) : null}
      </span>
    )
  }

  const tier = rarity ?? badgeRarity(badgeId)
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full bg-background/40 ring-2",
        dims.box,
        RARITY_RING[tier],
        locked && "opacity-[0.55] grayscale",
        animate && "badge-medallion-pop",
        className,
      )}
      aria-hidden
    >
      {createElement(badgeIcon(badgeId), { className: dims.icon, strokeWidth: 1.75 })}
      {locked ? (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-background/95 text-muted-foreground ring-1 ring-border/70"
          aria-hidden
        >
          <Lock className="size-2.5" strokeWidth={2.25} />
        </span>
      ) : null}
    </span>
  )
}
