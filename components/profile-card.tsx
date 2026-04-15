"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"
import {
  ENGINE_OPTIONS_WITH_ANY,
  EXPERIENCE_STYLES,
  JAM_STYLE_STYLES,
  LANGUAGE_OPTIONS,
  ROLE_OPTIONS,
  ROLE_STYLES,
} from "@/lib/constants"
import { cn } from "@/lib/utils"
import { ExternalLink, Globe } from "lucide-react"

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

export type ProfileRoleSlot = {
  role: string
  experience_level: string
  is_primary?: boolean
}

export type ProfileCardProps = {
  avatarUrl: string | null
  displayName: string
  fallbackName?: string
  currentTitle?: string | null
  level?: number | null
  defaultRole?: string | null
  secondaryRole?: string | null
  /** From dashboard settings: jam style key (chill, learning, …). */
  jamStyle?: string | null
  /** From dashboard settings: language key (english, french, …). */
  defaultLanguage?: string | null
  /** From `profile_roles`: roles + per-role experience (dashboard). */
  roleSlots?: ProfileRoleSlot[] | null
  defaultEngine?: string | null
  portfolioUrl?: string | null
  showPortfolioButton?: boolean
  size?: keyof typeof avatarSize
  /** Text under name when title/level hidden */
  subtitle?: string | null
  className?: string
  /** Ring / frame around avatar */
  framedAvatar?: boolean
}

function defaultRoleLabel(value: string | null | undefined): string | null {
  const raw = value?.trim()
  if (!raw) return null
  const key = raw.toLowerCase()
  return ROLE_OPTIONS.find((opt) => opt.value === key)?.label ?? raw
}

function defaultEngineLabel(value: string | null | undefined): string | null {
  const raw = value?.trim()
  if (!raw) return null
  const key = raw.toLowerCase()
  if (key === "any") return null
  return ENGINE_OPTIONS_WITH_ANY.find((opt) => opt.value === key)?.label ?? raw
}

function languageLabel(value: string | null | undefined): string | null {
  const raw = value?.trim()
  if (!raw) return null
  const key = raw.toLowerCase()
  return LANGUAGE_OPTIONS.find((opt) => opt.value === key)?.label ?? raw
}

function jamStyleLabel(value: string | null | undefined): { label: string; emoji: string; badgeClass: string } | null {
  const raw = value?.trim()
  if (!raw) return null
  const key = raw.toLowerCase()
  const meta = JAM_STYLE_STYLES[key]
  if (!meta) return { label: raw, emoji: "🎮", badgeClass: "border-border/50 bg-muted/40 text-foreground" }
  return { label: meta.label, emoji: meta.emoji, badgeClass: meta.badgeColor }
}

function normalizePortfolioUrl(url: string | null | undefined): string | null {
  const raw = url?.trim()
  if (!raw) return null
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw
  }
  return `https://${raw}`
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
        "max-w-full truncate bg-gradient-to-r bg-clip-text text-sm font-bold tracking-wide text-transparent",
        /* Light theme: dark amber on pale cards (readable on white / glass-light) */
        "from-amber-900 via-amber-800 to-amber-900",
        /* Dark theme: bright metallic + glow */
        "dark:from-amber-300 dark:via-yellow-200 dark:to-amber-200 dark:drop-shadow-[0_0_14px_rgba(251,191,36,0.45)]",
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
  defaultRole,
  secondaryRole,
  jamStyle,
  defaultLanguage,
  roleSlots,
  defaultEngine,
  portfolioUrl,
  showPortfolioButton = true,
  size = "md",
  subtitle,
  className,
  framedAvatar = true,
}: ProfileCardProps) {
  const name = displayName?.trim() || fallbackName?.trim() || "Jammer"
  const fb = fallbackName?.trim() || name
  const showLevel = typeof level === "number" && level >= 1
  const roleLabel = defaultRoleLabel(defaultRole)
  const secondaryRoleLabel = defaultRoleLabel(secondaryRole)
  const engineLabel = defaultEngineLabel(defaultEngine)
  const langLabel = languageLabel(defaultLanguage)
  const jamStyleMeta = jamStyleLabel(jamStyle)
  const safePortfolioUrl = normalizePortfolioUrl(portfolioUrl)

  const slots = (roleSlots ?? []).filter((s) => s?.role?.trim())
  const showRoleSlots = slots.length > 0

  const avatar = (
    <UserAvatar
      src={avatarUrl}
      fallbackName={fb}
      size={avatarPropSize[size]}
      className={cn(avatarSize[size], "shrink-0 ring-2 ring-border/50 shadow-md")}
    />
  )

  return (
    <div className={cn("flex items-start gap-3 sm:items-center sm:gap-5", className)}>
      {framedAvatar ? (
        <div className="shrink-0 rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-card to-teal/10 p-1 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/20">
          {avatar}
        </div>
      ) : (
        avatar
      )}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2 gap-y-1">
          <p className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">{name}</p>
          {showLevel ? <JammerLevelBadge level={level} /> : null}
        </div>
        {currentTitle?.trim() ? (
          <JammerTitleBadge title={currentTitle} className="text-sm sm:text-base" />
        ) : null}

        {jamStyleMeta ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "max-w-full gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                jamStyleMeta.badgeClass,
              )}
            >
              <span aria-hidden>{jamStyleMeta.emoji}</span>
              <span className="truncate">Jam style: {jamStyleMeta.label}</span>
            </Badge>
          </div>
        ) : null}

        {langLabel ? (
          <div className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
            <Globe className="size-3.5 shrink-0 text-teal" aria-hidden />
            <span className="font-medium text-foreground/90">Language: {langLabel}</span>
          </div>
        ) : null}

        {showRoleSlots ? (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Roles & experience</p>
            <ul className="space-y-2">
              {slots.map((slot, idx) => {
                const rKey = slot.role.trim().toLowerCase()
                const expKey = slot.experience_level?.trim().toLowerCase() || "regular"
                const roleMeta = ROLE_STYLES[rKey] ?? {
                  label: defaultRoleLabel(slot.role) ?? slot.role,
                  emoji: "❓",
                  color: "bg-muted text-muted-foreground",
                }
                const expMeta = EXPERIENCE_STYLES[expKey] ?? EXPERIENCE_STYLES.regular
                const isPrimarySlot = slot.is_primary === true || (slots.length === 1 && idx === 0)
                return (
                  <li
                    key={`${slot.role}-${idx}`}
                    className="flex flex-wrap items-center gap-2 rounded-xl border border-border/50 bg-muted/20 px-3 py-2"
                  >
                    {isPrimarySlot ? (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-teal">Primary</span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        Secondary
                      </span>
                    )}
                    <span
                      className={cn(
                        "inline-flex min-w-0 max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                        roleMeta.color,
                      )}
                    >
                      <span aria-hidden>{roleMeta.emoji}</span>
                      <span className="truncate">{roleMeta.label}</span>
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                        expMeta.color,
                      )}
                    >
                      <span aria-hidden>{expMeta.emoji}</span>
                      {expMeta.label}
                    </span>
                  </li>
                )
              })}
            </ul>
            {engineLabel ? (
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge className="rounded-full border border-lavender/35 bg-lavender/15 px-2.5 py-0.5 text-[11px] font-semibold text-lavender">
                  Engine: {engineLabel}
                </Badge>
              </div>
            ) : null}
          </div>
        ) : roleLabel || secondaryRoleLabel || engineLabel ? (
          <div className="flex flex-wrap items-center gap-2">
            {roleLabel ? (
              <Badge className="rounded-full border border-teal/35 bg-teal/15 px-2.5 py-0.5 text-[11px] font-semibold text-teal">
                Role: {roleLabel}
              </Badge>
            ) : null}
            {secondaryRoleLabel ? (
              <Badge className="rounded-full border border-teal/25 bg-teal/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal/90">
                Secondary: {secondaryRoleLabel}
              </Badge>
            ) : null}
            {engineLabel ? (
              <Badge className="rounded-full border border-lavender/35 bg-lavender/15 px-2.5 py-0.5 text-[11px] font-semibold text-lavender">
                Engine: {engineLabel}
              </Badge>
            ) : null}
          </div>
        ) : engineLabel ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full border border-lavender/35 bg-lavender/15 px-2.5 py-0.5 text-[11px] font-semibold text-lavender">
              Engine: {engineLabel}
            </Badge>
          </div>
        ) : null}
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        {showPortfolioButton && safePortfolioUrl ? (
          <div>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="mt-1 w-full gap-2 rounded-lg border-border/60 bg-background/40 sm:w-auto"
            >
              <a href={safePortfolioUrl} target="_blank" rel="noopener noreferrer">
                Portfolio
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
