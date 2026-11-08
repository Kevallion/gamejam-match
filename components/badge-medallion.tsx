import { createElement } from "react"
import {
  Coffee,
  Crown,
  Flag,
  Flame,
  Handshake,
  HeartHandshake,
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

const SIZE: Record<"sm" | "md", { box: string; icon: string }> = {
  sm: { box: "size-9", icon: "size-4" },
  md: { box: "size-11", icon: "size-5" },
}

export function badgeIcon(badgeId: string): LucideIcon {
  return BADGE_ICONS[badgeId.trim().toLowerCase()] ?? Trophy
}

export function badgeRarity(badgeId: string): BadgeRarity {
  return BADGE_RARITY[badgeId.trim().toLowerCase()] ?? "common"
}

/**
 * Soft badge medallion for dashboard / profile / reward toasts:
 * subtle ring by rarity, muted fill, Lucide pictogram.
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
  size?: "sm" | "md"
  locked?: boolean
  /** Plays the unlock "pop" animation once (reward toasts). */
  animate?: boolean
  className?: string
}) {
  const tier = rarity ?? badgeRarity(badgeId)
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-background/40 ring-2",
        SIZE[size].box,
        RARITY_RING[tier],
        locked && "opacity-50 saturate-0",
        animate && "badge-medallion-pop",
        className,
      )}
      aria-hidden
    >
      {createElement(badgeIcon(badgeId), { className: SIZE[size].icon, strokeWidth: 1.75 })}
    </span>
  )
}
