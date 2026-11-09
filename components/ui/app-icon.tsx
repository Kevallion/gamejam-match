import type { ComponentPropsWithoutRef } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type AppIconSize = "xs" | "sm" | "md" | "lg" | "xl"
export type AppIconTone = "teal" | "lavender" | "peach" | "pink" | "mint" | "muted" | "destructive" | "primary"

const SIZE_CLASS: Record<AppIconSize, string> = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
  xl: "size-6",
}

const TONE_CLASS: Record<AppIconTone, string> = {
  teal: "text-teal",
  primary: "text-primary",
  lavender: "text-lavender",
  peach: "text-peach",
  pink: "text-pink",
  mint: "text-mint",
  muted: "text-muted-foreground",
  destructive: "text-destructive",
}

type AppIconProps = {
  icon: LucideIcon
  size?: AppIconSize
  tone?: AppIconTone
  className?: string
} & Omit<ComponentPropsWithoutRef<LucideIcon>, "size" | "strokeWidth">

/** Single Lucide icon with the app's fixed stroke width and size scale. */
export function AppIcon({ icon: Icon, size = "md", tone, className, ...props }: AppIconProps) {
  return (
    <Icon
      className={cn("shrink-0", SIZE_CLASS[size], tone && TONE_CLASS[tone], className)}
      strokeWidth={2}
      aria-hidden
      {...props}
    />
  )
}

const TILE_TONE_BG: Record<AppIconTone, string> = {
  teal: "bg-[color-mix(in_oklab,var(--teal)_14%,transparent)] text-teal",
  primary: "bg-[color-mix(in_oklab,var(--primary)_14%,transparent)] text-primary",
  lavender: "bg-[color-mix(in_oklab,var(--lavender)_14%,transparent)] text-lavender",
  peach: "bg-[color-mix(in_oklab,var(--peach)_14%,transparent)] text-peach",
  pink: "bg-[color-mix(in_oklab,var(--pink)_14%,transparent)] text-pink",
  mint: "bg-[color-mix(in_oklab,var(--mint)_14%,transparent)] text-mint",
  muted: "bg-muted text-muted-foreground",
  destructive: "bg-destructive/15 text-destructive",
}

/** Tinted rounded square holding an icon (section headers, empty states). */
export function IconTile({
  icon,
  tone = "teal",
  className,
}: {
  icon: LucideIcon
  tone?: AppIconTone
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex size-12 shrink-0 items-center justify-center rounded-2xl",
        TILE_TONE_BG[tone],
        className,
      )}
      aria-hidden
    >
      <AppIcon icon={icon} size="xl" />
    </span>
  )
}
