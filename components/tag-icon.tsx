"use client"

import type { CSSProperties, ReactNode } from "react"
import {
  BookOpen,
  Box,
  Bug,
  CircleDashed,
  CodeXml,
  Coffee,
  Dices,
  Feather,
  Flame,
  LayoutTemplate,
  Mic,
  Music,
  Palette,
  Swords,
  type LucideIcon,
} from "lucide-react"
import { siConstruct3, siGamemaker, siGodotengine, siUnity, siUnrealengine } from "simple-icons"
import {
  EXPERIENCE_RANK,
  EXPERIENCE_STYLES,
  JAM_STYLE_STYLES,
  LANGUAGE_ISO,
  LANGUAGE_OPTION_VALUE_ALIASES,
  ROLE_OPTIONS,
  ROLE_STYLES,
  engineOptionLabel,
  languageOptionLabel,
} from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type TagKind = "role" | "engine" | "language" | "level" | "style"

type TagSize = "xs" | "sm" | "md"

const PILL: Record<TagSize, string> = {
  xs: "size-5 text-[10px]",
  sm: "size-6 text-[11px]",
  md: "size-8 text-xs",
}

const ICON: Record<TagSize, string> = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-5",
}

const ROLE_ICON: Record<string, { icon: LucideIcon; tone: string }> = {
  developer: { icon: CodeXml, tone: "--role-developer" },
  "2d-artist": { icon: Palette, tone: "--role-artist-2d" },
  "3d-artist": { icon: Box, tone: "--role-artist-3d" },
  audio: { icon: Music, tone: "--role-audio" },
  voice_actor: { icon: Mic, tone: "--role-voice" },
  writer: { icon: Feather, tone: "--role-writer" },
  "game-design": { icon: Dices, tone: "--role-design" },
  "ui-ux": { icon: LayoutTemplate, tone: "--role-ux" },
  qa: { icon: Bug, tone: "--role-qa" },
}

const STYLE_ICON: Record<string, LucideIcon> = {
  chill: Coffee,
  learning: BookOpen,
  dedicated: Flame,
  competitive: Swords,
}

/**
 * Official engine marks only, from simple-icons (CC0) using the slug that
 * names that engine. Checked against simple-icons 16.36:
 * godot → godotengine, unity → unity, unreal → unrealengine,
 * gamemaker → gamemaker, construct → construct3 (title "Construct 3";
 * there is no separate `construct` slug).
 * defold, gdevelop and pico8 have no entry. They use one neutral icon
 * plus the text label — never a stand-in logo.
 */
type EngineMark = {
  path?: string
  /** Brand hex without #. Omitted when that hex would disappear (white/black). */
  hex?: string
  /** simple-icons slug when the path is an official mark. */
  slug?: string
  verified: boolean
}

const ENGINE_MARK: Record<string, EngineMark> = {
  godot: { path: siGodotengine.path, hex: siGodotengine.hex, slug: siGodotengine.slug, verified: true },
  unity: { path: siUnity.path, slug: siUnity.slug, verified: true },
  unreal: { path: siUnrealengine.path, slug: siUnrealengine.slug, verified: true },
  gamemaker: { path: siGamemaker.path, slug: siGamemaker.slug, verified: true },
  construct: { path: siConstruct3.path, hex: siConstruct3.hex, slug: siConstruct3.slug, verified: true },
  pico8: { verified: false },
  defold: { verified: false },
  gdevelop: { verified: false },
  custom: { verified: false },
  any: { verified: false },
}

const EXPECTED_ENGINE_SLUG: Record<string, string> = {
  godot: "godotengine",
  unity: "unity",
  unreal: "unrealengine",
  gamemaker: "gamemaker",
  construct: "construct3",
}

for (const [value, slug] of Object.entries(EXPECTED_ENGINE_SLUG)) {
  if (ENGINE_MARK[value]?.slug !== slug) {
    throw new Error(`Engine ${value} must use simple-icons slug ${slug}`)
  }
}

function roleLabel(value: string): string {
  const key = value.trim().toLowerCase()
  return ROLE_OPTIONS.find((option) => option.value === key)?.label ?? ROLE_STYLES[key]?.label ?? value
}

function styleLabel(value: string): string {
  const key = value.trim().toLowerCase()
  return JAM_STYLE_STYLES[key]?.label ?? value
}

function levelLabel(value: string): string {
  const key = value.trim().toLowerCase()
  return EXPERIENCE_STYLES[key]?.label ?? value
}

function languageKey(value: string): string {
  const key = value.trim().toLowerCase()
  return LANGUAGE_OPTION_VALUE_ALIASES[key] ?? key
}

function toneStyle(token: string): CSSProperties {
  return {
    color: `var(${token})`,
    backgroundColor: `color-mix(in oklab, var(${token}) 18%, transparent)`,
  }
}

export function TagIcon({
  kind,
  value,
  size = "sm",
  withTooltip = true,
  showLabel = false,
  className,
}: {
  kind: TagKind
  value: string | null | undefined
  size?: TagSize
  withTooltip?: boolean
  /** Visible name beside the mark. Filters and detail rows keep this on. */
  showLabel?: boolean
  className?: string
}) {
  const raw = value?.trim() ?? ""
  if (!raw || raw.toLowerCase() === "all") return null

  const resolved = resolveTag(kind, raw)
  if (!resolved) return null

  const mark = (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-wide",
          resolved.gauge ? "h-6 px-1.5" : PILL[size],
          resolved.neutral && "bg-secondary text-foreground",
          resolved.mono && "bg-secondary text-muted-foreground",
          resolved.brandHover && "transition-colors hover:text-[var(--engine-brand)]",
        )}
        style={{
          ...(resolved.tone ? toneStyle(resolved.tone) : {}),
          ...(resolved.brandHover ? { ["--engine-brand" as string]: resolved.brandHover } : {}),
        }}
        aria-hidden={showLabel ? true : undefined}
      >
        {resolved.node(ICON[size])}
      </span>
      {resolved.forceLabel || showLabel ? (
        <span className="truncate text-xs font-semibold text-foreground">{resolved.label}</span>
      ) : null}
    </span>
  )

  if (!withTooltip || showLabel) {
    return (
      <span className="inline-flex" aria-label={showLabel ? undefined : resolved.label}>
        {mark}
      </span>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-default" tabIndex={0} aria-label={resolved.label}>
          {mark}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">{resolved.label}</TooltipContent>
    </Tooltip>
  )
}

type ResolvedTag = {
  label: string
  node: (iconClass: string) => ReactNode
  tone?: string
  mono?: boolean
  neutral?: boolean
  gauge?: boolean
  brandHover?: string
  /** Full name shown beside a non-official engine mark. */
  forceLabel?: boolean
}

function resolveTag(kind: TagKind, raw: string): ResolvedTag | null {
  const key = raw.toLowerCase()

  if (kind === "role") {
    const meta = ROLE_ICON[key]
    const Icon = meta?.icon ?? CodeXml
    return {
      label: roleLabel(key),
      tone: meta?.tone ?? "--role-developer",
      node: (iconClass) => <Icon className={iconClass} strokeWidth={1.75} aria-hidden />,
    }
  }

  if (kind === "style") {
    const Icon = STYLE_ICON[key] ?? Coffee
    return {
      label: styleLabel(key),
      tone: "--role-design",
      node: (iconClass) => <Icon className={iconClass} strokeWidth={1.75} aria-hidden />,
    }
  }

  if (kind === "level") {
    const rank = EXPERIENCE_RANK[key] ?? 0
    if (!rank && !EXPERIENCE_STYLES[key]) return null
    return {
      label: levelLabel(key),
      gauge: true,
      node: () => <ExperiencePips rank={rank || 1} />,
    }
  }

  if (kind === "language") {
    const canonical = languageKey(key)
    const iso = LANGUAGE_ISO[canonical]
    if (!iso && !languageOptionLabel(raw)) return null
    return {
      label: languageOptionLabel(raw) || raw,
      neutral: true,
      node: () => <span aria-hidden>{iso ?? canonical.slice(0, 2).toUpperCase()}</span>,
    }
  }

  const engine = ENGINE_MARK[key]
  const label = engineOptionLabel(raw) || raw
  if (engine?.verified && engine.path) {
    return {
      label,
      mono: true,
      brandHover: engine.hex ? `#${engine.hex}` : undefined,
      node: (iconClass) => (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
          <path d={engine.path} fill="currentColor" />
        </svg>
      ),
    }
  }

  return {
    label,
    mono: true,
    forceLabel: true,
    node: (iconClass) => <CircleDashed className={iconClass} strokeWidth={1.75} aria-hidden />,
  }
}

function ExperiencePips({ rank }: { rank: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 px-1" aria-hidden>
      {Array.from({ length: 6 }, (_, index) => (
        <span
          key={index}
          className={cn("size-1.5 rounded-full", index < rank ? "bg-teal" : "bg-muted-foreground/25")}
        />
      ))}
    </span>
  )
}

export type TagIconItem = {
  kind: TagKind
  value: string
  key?: string
}

/** Icon row with a +N overflow popover that lists the rest in text. */
export function TagIconRow({
  items,
  max = 5,
  size = "sm",
  className,
}: {
  items: TagIconItem[]
  max?: number
  size?: TagSize
  className?: string
}) {
  const visible = items.slice(0, max)
  const hidden = items.slice(max)
  if (items.length === 0) return null

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {visible.map((item, index) => (
        <TagIcon key={item.key ?? `${item.kind}-${item.value}-${index}`} kind={item.kind} value={item.value} size={size} />
      ))}
      {hidden.length > 0 ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex h-6 items-center rounded-full bg-muted px-2 text-[11px] font-semibold text-muted-foreground"
              aria-label={`${hidden.length} more`}
            >
              +{hidden.length}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 rounded-xl p-2">
            <ul className="flex flex-col gap-1">
              {hidden.map((item, index) => (
                <li key={item.key ?? `${item.value}-${index}`}>
                  <TagIcon kind={item.kind} value={item.value} size="xs" showLabel withTooltip={false} />
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  )
}

/** Filter menu row: icon plus the existing text label. */
export function TagFilterChoice({
  kind,
  value,
  label,
}: {
  kind: TagKind
  value: string
  label: string
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <TagIcon kind={kind} value={value} size="xs" withTooltip={false} />
      <span className="truncate">{label}</span>
    </span>
  )
}
