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
  { value: "writer", label: "Writer / Narrative" },
  { value: "game-design", label: "Game Designer" },
  { value: "ui-ux", label: "UI / UX" },
  { value: "qa", label: "QA / Playtester" },
] as const

/** 6 experience tiers (ascending order) — color for visual aid in selects */
export const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Beginner / Learner", emoji: "🌱", color: "bg-sky-400/15 text-sky-400" },
  { value: "junior", label: "Junior / Student", emoji: "📚", color: "bg-emerald-500/15 text-emerald-400" },
  { value: "regular", label: "Regular Jammer", emoji: "🎮", color: "bg-blue-500/15 text-blue-400" },
  { value: "advanced", label: "Advanced / Versatile", emoji: "⚡", color: "bg-violet-500/15 text-violet-400" },
  { value: "senior", label: "Senior / Specialist", emoji: "🎯", color: "bg-orange-500/15 text-orange-400" },
  { value: "veteran", label: "Industry Veteran", emoji: "👑", color: "bg-amber-500/15 text-amber-400" },
] as const

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

export const ROLE_STYLES: Record<string, { label: string; emoji: string; color: string }> = {
  developer: { label: "Developer", emoji: "💻", color: "bg-teal/15 text-teal" },
  "2d-artist": { label: "2D Artist", emoji: "🎨", color: "bg-pink/15 text-pink" },
  "3d-artist": { label: "3D Artist", emoji: "🗿", color: "bg-peach/15 text-peach" },
  audio: { label: "Audio", emoji: "🎵", color: "bg-lavender/15 text-lavender" },
  writer: { label: "Writer", emoji: "✍️", color: "bg-pink/15 text-pink" },
  "game-design": { label: "Game Designer", emoji: "🎯", color: "bg-peach/15 text-peach" },
  "ui-ux": { label: "UI / UX", emoji: "✨", color: "bg-mint/15 text-mint" },
  qa: { label: "QA / Playtester", emoji: "🐛", color: "bg-peach/15 text-peach" },
}

export const EXPERIENCE_STYLES: Record<string, { label: string; emoji: string; color: string }> = {
  beginner: { label: "Beginner / Learner", emoji: "🌱", color: "bg-sky-400/15 text-sky-400" },
  junior: { label: "Junior / Student", emoji: "📚", color: "bg-emerald-500/15 text-emerald-400" },
  regular: { label: "Regular Jammer", emoji: "🎮", color: "bg-blue-500/15 text-blue-400" },
  advanced: { label: "Advanced / Versatile", emoji: "⚡", color: "bg-violet-500/15 text-violet-400" },
  senior: { label: "Senior / Specialist", emoji: "🎯", color: "bg-orange-500/15 text-orange-400" },
  veteran: { label: "Industry Veteran", emoji: "👑", color: "bg-amber-500/15 text-amber-400" },
  // Fallbacks for legacy data
  hobbyist: { label: "Junior / Student", emoji: "📚", color: "bg-emerald-500/15 text-emerald-400" },
  confirmed: { label: "Regular Jammer", emoji: "🎮", color: "bg-blue-500/15 text-blue-400" },
  expert: { label: "Senior / Specialist", emoji: "🎯", color: "bg-orange-500/15 text-orange-400" },
}

/** Returns the CSS color class for an experience level (UI badges) */
export function getExperienceColor(level: string): string {
  const normalized = level?.toLowerCase() || "beginner"
  return EXPERIENCE_STYLES[normalized]?.color ?? "bg-sky-400/15 text-sky-400"
}

/** 4 Jam Style vibes — to match personalities (Chill → Competitive) */
export const JAM_STYLE_OPTIONS = [
  { value: "chill", label: "Chill & Relaxed", emoji: "☕", color: "bg-emerald-500/15 text-emerald-500", description: "Take it easy, relaxed vibe, fun comes first." },
  { value: "learning", label: "Learning & Practice", emoji: "📖", color: "bg-blue-500/15 text-blue-500", description: "Learning together, experimentation welcome." },
  { value: "dedicated", label: "Dedicated / To the limit", emoji: "🔥", color: "bg-orange-500/15 text-orange-500", description: "Serious commitment, aiming for a polished game within the time limit." },
  { value: "competitive", label: "Competitive / Win-focused", emoji: "🏆", color: "bg-red-500/15 text-red-500", description: "Aiming for the top, competitive spirit and excellence." },
] as const

export const JAM_STYLE_STYLES: Record<string, { label: string; emoji: string; color: string; badgeColor: string }> = {
  chill: { label: "Chill & Relaxed", emoji: "☕", color: "bg-emerald-500/15 text-emerald-500", badgeColor: "bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border-emerald-500/50" },
  learning: { label: "Learning & Practice", emoji: "📖", color: "bg-blue-500/15 text-blue-500", badgeColor: "bg-blue-500/25 text-blue-600 dark:text-blue-400 border-blue-500/50" },
  dedicated: { label: "Dedicated / To the limit", emoji: "🔥", color: "bg-orange-500/15 text-orange-500", badgeColor: "bg-orange-500/25 text-orange-600 dark:text-orange-400 border-orange-500/50" },
  competitive: { label: "Competitive / Win-focused", emoji: "🏆", color: "bg-red-500/15 text-red-500", badgeColor: "bg-red-500/25 text-red-600 dark:text-red-400 border-red-500/50" },
}
