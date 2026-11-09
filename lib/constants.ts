/**
 * Shared constants for consistency between teams and members:
 * - Roles (team ads, member profile, filters)
 * - Experience level (same everywhere)
 * - Game engines
 */

export const ROLE_OPTIONS = [
  { value: "developer", label: "Developer" },
  { value: "2d-artist", label: "2D Artist" },
  { value: "3d-artist", label: "3D Artist" },
  { value: "audio", label: "Audio / Music" },
  { value: "voice_actor", label: "Voice Actor" },
  { value: "writer", label: "Writer / Narrative" },
  { value: "game-design", label: "Game Designer" },
  { value: "ui-ux", label: "UI / UX" },
  { value: "qa", label: "QA / Playtester" },
] as const

/** Tint + text pair from a CSS custom property token. */
function tone(token: string): string {
  return `bg-[color-mix(in_oklab,var(${token})_18%,transparent)] text-[var(${token})]`
}

function toneBadge(token: string): string {
  return `bg-[color-mix(in_oklab,var(${token})_25%,transparent)] text-[var(${token})] border-[color-mix(in_oklab,var(${token})_50%,transparent)]`
}

/** 6 experience tiers (ascending order) — color for visual aid in selects */
export const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Beginner / Learner", color: tone("--mint") },
  { value: "junior", label: "Junior / Student", color: tone("--teal") },
  { value: "regular", label: "Regular Jammer", color: tone("--lavender") },
  { value: "advanced", label: "Advanced / Versatile", color: tone("--pink") },
  { value: "senior", label: "Senior / Specialist", color: tone("--peach") },
  { value: "veteran", label: "Industry Veteran", color: "bg-[color-mix(in_oklab,var(--peach)_28%,transparent)] text-[var(--peach)]" },
] as const

/**
 * Canonical keys persisted in DB (`profiles.default_language`, `profiles.language`,
 * `availability_posts.language`, `teams.language`). Same vocabulary as onboarding / team forms:
 * lowercase full names (e.g. `french`), not ISO 639-1 codes (`fr`).
 */
export const LANGUAGE_OPTIONS = [
  { value: "english", label: "English" },
  { value: "french", label: "French" },
  { value: "spanish", label: "Spanish" },
  { value: "portuguese", label: "Portuguese" },
  { value: "german", label: "German" },
  { value: "japanese", label: "Japanese" },
  { value: "korean", label: "Korean" },
  { value: "chinese", label: "Chinese" },
] as const

/**
 * Programming languages stored in `profiles.programming_languages` (text[]).
 * `javascript` covers JavaScript and TypeScript as one jammer choice.
 */
export const PROGRAMMING_LANGUAGE_OPTIONS = [
  { value: "csharp", label: "C#", short: "C#" },
  { value: "cpp", label: "C++", short: "C++" },
  { value: "gdscript", label: "GDScript", short: "GD" },
  { value: "lua", label: "Lua", short: "Lua" },
  { value: "javascript", label: "JavaScript / TypeScript", short: "JS" },
  { value: "python", label: "Python", short: "Py" },
  { value: "haxe", label: "Haxe", short: "Hx" },
  { value: "rust", label: "Rust", short: "Rs" },
  { value: "java", label: "Java", short: "Ja" },
  { value: "other", label: "Other", short: "…" },
] as const

export type ProgrammingLanguageValue = (typeof PROGRAMMING_LANGUAGE_OPTIONS)[number]["value"]

const PROGRAMMING_LANGUAGE_KEYS = new Set<string>(
  PROGRAMMING_LANGUAGE_OPTIONS.map((option) => option.value),
)

export function programmingLanguageOption(value: string | null | undefined) {
  const key = (value ?? "").trim().toLowerCase()
  return PROGRAMMING_LANGUAGE_OPTIONS.find((option) => option.value === key) ?? null
}

/** Keeps only known keys, in catalog order, dropping nulls and duplicates. */
export function parseProgrammingLanguages(value: unknown): ProgrammingLanguageValue[] {
  if (!Array.isArray(value)) return []
  const present = new Set<string>()
  for (const item of value) {
    if (typeof item !== "string") continue
    const key = item.trim().toLowerCase()
    if (PROGRAMMING_LANGUAGE_KEYS.has(key)) present.add(key)
  }
  return PROGRAMMING_LANGUAGE_OPTIONS.map((option) => option.value).filter((key) => present.has(key))
}

/** ISO-style shortcuts → same keys as `LANGUAGE_OPTIONS` `value` (DB stores canonical keys, not `fr`). */
export const LANGUAGE_OPTION_VALUE_ALIASES: Readonly<Record<string, string>> = {
  en: "english",
  fr: "french",
  es: "spanish",
  pt: "portuguese",
  de: "german",
  ja: "japanese",
  ko: "korean",
  zh: "chinese",
}

export const ENGINE_OPTIONS = [
  { value: "godot", label: "Godot" },
  { value: "unity", label: "Unity" },
  { value: "unreal", label: "Unreal Engine" },
  { value: "gamemaker", label: "GameMaker" },
  { value: "pico8", label: "PICO-8" },
  { value: "defold", label: "Defold" },
  { value: "construct", label: "Construct" },
  { value: "gdevelop", label: "GDevelop" },
  { value: "custom", label: "Custom / Other" },
] as const

/** For member (profile) forms: includes "Any / No Preference" */
export const ENGINE_OPTIONS_WITH_ANY = [
  { value: "any", label: "Any / No Preference" },
  ...ENGINE_OPTIONS,
] as const

/** Tint + text pair. Each role has its own hue (`--role-*` in globals.css). */
function roleTone(token: string): string {
  return tone(token)
}

export const ROLE_STYLES: Record<string, { label: string; color: string }> = {
  developer: { label: "Developer", color: roleTone("--role-developer") },
  "2d-artist": { label: "2D Artist", color: roleTone("--role-artist-2d") },
  "3d-artist": { label: "3D Artist", color: roleTone("--role-artist-3d") },
  audio: { label: "Audio", color: roleTone("--role-audio") },
  voice_actor: { label: "Voice Actor", color: roleTone("--role-voice") },
  writer: { label: "Writer", color: roleTone("--role-writer") },
  "game-design": { label: "Game Designer", color: roleTone("--role-design") },
  "ui-ux": { label: "UI / UX", color: roleTone("--role-ux") },
  qa: { label: "QA / Playtester", color: roleTone("--role-qa") },
  other: { label: "Other", color: "bg-muted text-muted-foreground" },
}

/** Spoken-language key → short ISO pill. A language is not a country, so pills stay codes. */
export const LANGUAGE_ISO: Record<string, string> = {
  english: "EN",
  french: "FR",
  spanish: "ES",
  portuguese: "PT",
  german: "DE",
  japanese: "JA",
  korean: "KO",
  chinese: "ZH",
}

/** 1–6 filled pips on the experience gauge, including legacy keys. */
export const EXPERIENCE_RANK: Record<string, number> = {
  beginner: 1,
  junior: 2,
  hobbyist: 2,
  regular: 3,
  confirmed: 3,
  advanced: 4,
  senior: 5,
  expert: 5,
  veteran: 6,
}

export const EXPERIENCE_STYLES: Record<string, { label: string; color: string }> = {
  beginner: { label: "Beginner / Learner", color: tone("--mint") },
  junior: { label: "Junior / Student", color: tone("--teal") },
  regular: { label: "Regular Jammer", color: tone("--lavender") },
  advanced: { label: "Advanced / Versatile", color: tone("--pink") },
  senior: { label: "Senior / Specialist", color: tone("--peach") },
  veteran: {
    label: "Industry Veteran",
    color: "bg-[color-mix(in_oklab,var(--peach)_28%,transparent)] text-[var(--peach)]",
  },
  // Fallbacks for legacy data
  hobbyist: { label: "Junior / Student", color: tone("--teal") },
  confirmed: { label: "Regular Jammer", color: tone("--lavender") },
  expert: { label: "Senior / Specialist", color: tone("--peach") },
}

/** Returns the CSS color class for an experience level (UI badges) */
export function getExperienceColor(level: string): string {
  const normalized = level?.toLowerCase() || "beginner"
  return EXPERIENCE_STYLES[normalized]?.color ?? tone("--mint")
}

/** 4 Jam Style vibes — to match personalities (Chill → Competitive) */
export const JAM_STYLE_OPTIONS = [
  {
    value: "chill",
    label: "Chill & Relaxed",
    color: tone("--role-design"),
    description: "Take it easy, relaxed vibe, fun comes first.",
  },
  {
    value: "learning",
    label: "Learning & Practice",
    color: tone("--role-design"),
    description: "Learning together, experimentation welcome.",
  },
  {
    value: "dedicated",
    label: "Dedicated / To the limit",
    color: tone("--role-design"),
    description: "Serious commitment, aiming for a polished game within the time limit.",
  },
  {
    value: "competitive",
    label: "Competitive / Win-focused",
    color: tone("--role-design"),
    description: "Aiming for the top, competitive spirit and excellence.",
  },
] as const

/** Display label for a stored engine key (`godot` → `Godot`). Unknown values stay as stored. */
export function engineOptionLabel(value: string | null | undefined): string {
  const raw = (value ?? "").trim()
  if (!raw) return ""
  const key = raw.toLowerCase()
  return ENGINE_OPTIONS_WITH_ANY.find((option) => option.value === key)?.label ?? raw
}

/** Display label for a stored spoken-language key (`english` → `English`). */
export function languageOptionLabel(value: string | null | undefined): string {
  const raw = (value ?? "").trim()
  if (!raw) return ""
  const key = raw.toLowerCase()
  const canonical = LANGUAGE_OPTION_VALUE_ALIASES[key] ?? key
  return LANGUAGE_OPTIONS.find((option) => option.value === canonical)?.label ?? raw
}

export const JAM_STYLE_STYLES: Record<string, { label: string; color: string; badgeColor: string }> = {
  chill: {
    label: "Chill & Relaxed",
    color: tone("--role-design"),
    badgeColor: toneBadge("--role-design"),
  },
  learning: {
    label: "Learning & Practice",
    color: tone("--role-design"),
    badgeColor: toneBadge("--role-design"),
  },
  dedicated: {
    label: "Dedicated / To the limit",
    color: tone("--role-design"),
    badgeColor: toneBadge("--role-design"),
  },
  competitive: {
    label: "Competitive / Win-focused",
    color: tone("--role-design"),
    badgeColor: toneBadge("--role-design"),
  },
}
