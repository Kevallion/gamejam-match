"use client"

import type { CSSProperties, ReactNode } from "react"
import { CircleDashed, Coffee } from "lucide-react"
import { siConstruct3, siGamemaker, siGodotengine, siUnity, siUnrealengine } from "simple-icons"
import { DEFOLD_MARK_PATH, GDEVELOP_MARK_PATH } from "@/lib/official-engine-marks"
import {
  ENGINE_TONE_TOKEN,
  EXPERIENCE_RANK,
  EXPERIENCE_STYLES,
  JAM_STYLE_STYLES,
  LANGUAGE_ISO,
  LANGUAGE_OPTION_VALUE_ALIASES,
  ROLE_OPTIONS,
  ROLE_STYLES,
  programmingLanguageOption,
  engineOptionKey,
  engineOptionLabel,
  languageOptionLabel,
} from "@/lib/constants"
import { ROLE_ICON, STYLE_ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type TagKind = "role" | "engine" | "language" | "level" | "style" | "code"

type TagSize = "xs" | "sm" | "md"

const PILL: Record<TagSize, string> = {
  xs: "size-8 text-base",
  sm: "size-8 text-base",
  md: "size-10 text-base",
}

const ICON: Record<TagSize, string> = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-5",
}

/**
 * Official engine marks.
 * simple-icons (CC0), slugs checked against 16.36:
 * godot → godotengine, unity → unity, unreal → unrealengine,
 * gamemaker → gamemaker, construct → construct3 ("Construct 3").
 * defold and gdevelop are single-path traces of the logos the site owner
 * supplied (navy / white gaps are cut out). pico8 and custom have no mark.
 */
type EngineMark = {
  path?: string
  /** Brand hex without #. Omitted when that hex would disappear (white/black). */
  hex?: string
  /** simple-icons slug when the path comes from that package. */
  slug?: string
  /** Owner-supplied logo traced as one evenodd path. */
  evenOdd?: boolean
  verified: boolean
}

const ENGINE_MARK: Record<string, EngineMark> = {
  godot: { path: siGodotengine.path, hex: siGodotengine.hex, slug: siGodotengine.slug, verified: true },
  unity: { path: siUnity.path, slug: siUnity.slug, verified: true },
  unreal: { path: siUnrealengine.path, slug: siUnrealengine.slug, verified: true },
  gamemaker: { path: siGamemaker.path, slug: siGamemaker.slug, verified: true },
  construct: { path: siConstruct3.path, hex: siConstruct3.hex, slug: siConstruct3.slug, verified: true },
  defold: { path: DEFOLD_MARK_PATH, hex: "F86020", evenOdd: true, verified: true },
  gdevelop: { path: GDEVELOP_MARK_PATH, hex: "4A90D9", evenOdd: true, verified: true },
  pico8: { verified: false },
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
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full font-bold tabular-nums tracking-wide",
          resolved.wide ? "h-8 min-w-8 px-2 text-base leading-none" : resolved.gauge ? "h-8 px-2" : PILL[size],
          resolved.neutral && "bg-secondary text-foreground",
          resolved.mono && "bg-secondary text-muted-foreground",
        )}
        style={{
          ...(resolved.tone ? toneStyle(resolved.tone) : {}),
        }}
        aria-hidden={showLabel ? true : undefined}
      >
        {resolved.node(ICON[size])}
      </span>
      {resolved.forceLabel || showLabel ? (
        <span className="truncate text-xs font-semibold tabular-nums text-foreground">{resolved.label}</span>
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
  /** Short text pill (programming languages) instead of a fixed square. */
  wide?: boolean
  /** Full name shown beside a non-official engine mark. */
  forceLabel?: boolean
}

function resolveTag(kind: TagKind, raw: string): ResolvedTag | null {
  const key = raw.toLowerCase()

  if (kind === "role") {
    const meta = ROLE_ICON[key] ?? ROLE_ICON.other
    const Icon = meta.icon
    return {
      label: roleLabel(key),
      tone: meta.tone,
      node: (iconClass) => <Icon className={iconClass} strokeWidth={2} aria-hidden />,
    }
  }

  if (kind === "style") {
    const Icon = STYLE_ICON[key] ?? Coffee
    return {
      label: styleLabel(key),
      tone: "--role-design",
      node: (iconClass) => <Icon className={iconClass} strokeWidth={2} aria-hidden />,
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

  if (kind === "code") {
    const option = programmingLanguageOption(key)
    if (!option) return null
    return {
      label: option.label,
      wide: true,
      tone: "--lavender",
      node: () => <span aria-hidden>{option.short}</span>,
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

  const engineKey = engineOptionKey(raw)
  const engine = ENGINE_MARK[engineKey]
  const label = engineOptionLabel(raw) || raw
  const toneToken = ENGINE_TONE_TOKEN[engineKey] ?? (engineKey ? "--engine-custom" : undefined)
  if (engine?.verified && engine.path) {
    return {
      label,
      tone: toneToken,
      node: (iconClass) => (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
          <path d={engine.path} fill="currentColor" fillRule={engine.evenOdd ? "evenodd" : "nonzero"} />
        </svg>
      ),
    }
  }

  return {
    label,
    tone: toneToken ?? "--engine-custom",
    forceLabel: true,
    node: (iconClass) => <CircleDashed className={iconClass} strokeWidth={2} aria-hidden />,
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
  max = 3,
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
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {visible.map((item, index) => (
        <TagIcon key={item.key ?? `${item.kind}-${item.value}-${index}`} kind={item.kind} value={item.value} size={size} />
      ))}
      {hidden.length > 0 ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex h-8 items-center rounded-full bg-muted px-2 text-base font-semibold text-muted-foreground"
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
