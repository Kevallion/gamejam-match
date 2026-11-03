"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"
import {
  ENGINE_OPTIONS_WITH_ANY,
  LANGUAGE_OPTIONS,
  ROLE_OPTIONS,
  parseProgrammingLanguages,
} from "@/lib/constants"
import { neoButton } from "@/lib/neo-style"
import { cn } from "@/lib/utils"
import { ExternalLink } from "lucide-react"
import { TagIcon } from "@/components/tag-icon"

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
  /** Programming language keys from `profiles.programming_languages`. */
  programmingLanguages?: string[] | null
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
  /** Earned after at least one completed jam */
  showVerifiedJammer?: boolean
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
  neo = false,
}: {
  level: number
  className?: string
  /** Profile pages use the neo-brutalist medallion. Dashboard keeps the soft badge. */
  neo?: boolean
}) {
  return (
    <span
      className={cn(
        neo
          ? "inline-flex shrink-0 items-center rounded-lg border-2 border-foreground bg-teal px-2 py-0.5 text-xs font-extrabold tabular-nums text-teal-foreground shadow-[2px_2px_0_0_var(--neo-shadow)]"
          : "inline-flex shrink-0 items-center rounded-lg border border-teal/40 bg-teal/15 px-2 py-0.5 text-xs font-extrabold tabular-nums text-teal shadow-[0_0_16px_-4px_rgba(45,212,191,0.35)]",
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
  programmingLanguages,
  roleSlots,
  defaultEngine,
  portfolioUrl,
  showPortfolioButton = true,
  size = "md",
  subtitle,
  className,
  framedAvatar = true,
  showVerifiedJammer = false,
}: ProfileCardProps) {
  const name = displayName?.trim() || fallbackName?.trim() || "Jammer"
  const fb = fallbackName?.trim() || name
  const showLevel = typeof level === "number" && level >= 1
  const roleLabel = defaultRoleLabel(defaultRole)
  const secondaryRoleLabel = defaultRoleLabel(secondaryRole)
  const engineLabel = defaultEngineLabel(defaultEngine)
  const langLabel = languageLabel(defaultLanguage)
  const codeKeys = parseProgrammingLanguages(programmingLanguages)
  const safePortfolioUrl = normalizePortfolioUrl(portfolioUrl)

  const slots = (roleSlots ?? []).filter((s) => s?.role?.trim())
  const showRoleSlots = slots.length > 0

  const avatar = (
    <UserAvatar
      src={avatarUrl}
      fallbackName={fb}
      size={avatarPropSize[size]}
      className={cn(avatarSize[size], "shrink-0 border-2 border-foreground shadow-[2px_2px_0_0_var(--neo-shadow)]")}
    />
  )

  return (
    <div className={cn("flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5", className)}>
      {framedAvatar ? (
        <div className="shrink-0 rounded-2xl border-2 border-foreground bg-peach/25 p-1 shadow-[3px_3px_0_0_var(--neo-shadow)]">
          {avatar}
        </div>
      ) : (
        avatar
      )}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2 gap-y-1">
          <p className="truncate text-base font-extrabold tracking-tight text-foreground sm:text-lg">{name}</p>
          {showLevel ? <JammerLevelBadge level={level} neo /> : null}
          {showVerifiedJammer ? (
            <Badge className="rounded-full border-2 border-foreground bg-mint px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-mint-foreground shadow-[2px_2px_0_0_var(--neo-shadow)]">
              Verified Jammer
            </Badge>
          ) : null}
        </div>
        {currentTitle?.trim() ? (
          <JammerTitleBadge title={currentTitle} className="text-sm sm:text-base" />
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          {jamStyle ? <TagIcon kind="style" value={jamStyle} size="md" showLabel /> : null}
          {langLabel ? <TagIcon kind="language" value={defaultLanguage} size="md" showLabel /> : null}
          {engineLabel ? <TagIcon kind="engine" value={defaultEngine} size="md" showLabel /> : null}
        </div>

        {codeKeys.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {codeKeys.map((key) => (
              <TagIcon key={key} kind="code" value={key} size="sm" showLabel />
            ))}
          </div>
        ) : null}

        {showRoleSlots ? (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Roles & experience</p>
            <ul className="space-y-2">
              {slots.map((slot, idx) => {
                const rKey = slot.role.trim().toLowerCase()
                const expKey = slot.experience_level?.trim().toLowerCase() || "regular"
                const isPrimarySlot = slot.is_primary === true || (slots.length === 1 && idx === 0)
                return (
                  <li
                    key={`${slot.role}-${idx}`}
                    className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-foreground bg-secondary/40 px-3 py-2 shadow-[2px_2px_0_0_var(--neo-shadow)]"
                  >
                    {isPrimarySlot ? (
                      <span className="text-xs font-bold uppercase tracking-wide text-teal">Primary</span>
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Secondary
                      </span>
                    )}
                    <TagIcon kind="role" value={rKey} size="md" showLabel />
                    <TagIcon kind="level" value={expKey} size="sm" showLabel />
                  </li>
                )
              })}
            </ul>
          </div>
        ) : roleLabel || secondaryRoleLabel ? (
          <div className="flex flex-wrap items-center gap-2">
            {defaultRole ? <TagIcon kind="role" value={defaultRole} size="md" showLabel /> : null}
            {secondaryRole ? (
              <span className="inline-flex items-center gap-1.5">
                <TagIcon kind="role" value={secondaryRole} size="md" showLabel />
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Secondary</span>
              </span>
            ) : null}
          </div>
        ) : null}
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        {showPortfolioButton && safePortfolioUrl ? (
          <div>
            <Button
              asChild
              size="sm"
              variant="outline"
              className={cn(neoButton, "mt-1 w-full gap-2 bg-card text-foreground hover:bg-card sm:w-auto")}
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
