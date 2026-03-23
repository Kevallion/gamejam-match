"use client"

import { UserAvatar } from "@/components/user-avatar"
import { cn } from "@/lib/utils"

const avatarSize = {
  sm: "size-12 rounded-xl",
  md: "size-16 rounded-2xl",
  lg: "size-20 rounded-2xl",
} as const

const avatarPropSize = {
  sm: "sm" as const,
  md: "md" as const,
  lg: "lg" as const,
}

export type ProfileCardProps = {
  avatarUrl: string | null
  displayName: string
  fallbackName?: string
  currentTitle?: string | null
  level?: number | null
  size?: keyof typeof avatarSize
  /** Text under name when title/level hidden */
  subtitle?: string | null
  className?: string
  /** Ring / frame around avatar */
  framedAvatar?: boolean
}

/** Premium title line — reuse in navbar or compact rows */
export function JammerTitleBadge({
  title,
  className,
}: {
  title: string
  className?: string
}) {
  if (!title?.trim()) return null
  return (
    <p
      className={cn(
        "max-w-full truncate bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300 bg-clip-text text-sm font-bold tracking-wide text-transparent",
        "drop-shadow-[0_0_14px_rgba(251,191,36,0.45)] dark:from-amber-300 dark:via-yellow-300 dark:to-amber-200",
        className,
      )}
    >
      {title.trim()}
    </p>
  )
}

export function JammerLevelBadge({
  level,
  className,
}: {
  level: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-lg border border-teal/40 bg-teal/15 px-2 py-0.5 text-xs font-extrabold tabular-nums text-teal",
        "shadow-[0_0_16px_-4px_rgba(45,212,191,0.35)]",
        className,
      )}
    >
      Lvl {level}
    </span>
  )
}

/**
 * Avatar + username + optional RPG title & level (settings, public profile, etc.).
 */
export function ProfileCard({
  avatarUrl,
  displayName,
  fallbackName,
  currentTitle,
  level,
  size = "md",
  subtitle,
  className,
  framedAvatar = true,
}: ProfileCardProps) {
  const name = displayName?.trim() || fallbackName?.trim() || "Jammer"
  const fb = fallbackName?.trim() || name
  const showLevel = typeof level === "number" && level >= 1

  const avatar = (
    <UserAvatar
      src={avatarUrl}
      fallbackName={fb}
      size={avatarPropSize[size]}
      className={cn(avatarSize[size], "shrink-0 ring-2 ring-border/50 shadow-md")}
    />
  )

  return (
    <div className={cn("flex items-center gap-4 sm:gap-5", className)}>
      {framedAvatar ? (
        <div className="shrink-0 rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-card to-teal/10 p-1 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/20">
          {avatar}
        </div>
      ) : (
        avatar
      )}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2 gap-y-1">
          <p className="truncate text-lg font-semibold tracking-tight text-foreground">{name}</p>
          {showLevel ? <JammerLevelBadge level={level} /> : null}
        </div>
        {currentTitle?.trim() ? (
          <JammerTitleBadge title={currentTitle} className="text-sm sm:text-base" />
        ) : null}
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
    </div>
  )
}
