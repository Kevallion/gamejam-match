/**
 * Constantes partagées pour cohérence entre équipes et membres :
 * - Rôles (annonces team, profil membre, filtres)
 * - Niveau d'expérience (identique partout)
 * - Moteurs de jeu (engines)
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

export const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Beginner", emoji: "🌱" },
  { value: "hobbyist", label: "Hobbyist", emoji: "🛠️" },
  { value: "confirmed", label: "Confirmed", emoji: "🚀" },
  { value: "expert", label: "Expert", emoji: "👑" },
] as const

export const ENGINE_OPTIONS = [
  { value: "godot", label: "Godot" },
  { value: "unity", label: "Unity" },
  { value: "unreal", label: "Unreal Engine" },
  { value: "gamemaker", label: "GameMaker" },
  { value: "pico8", label: "PICO-8" },
  { value: "custom", label: "Custom / Other" },
] as const

/** Pour les formulaires membre (profil) : inclut "Any / No Preference" */
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
  beginner: { label: "Beginner", emoji: "🌱", color: "bg-mint/15 text-mint" },
  hobbyist: { label: "Hobbyist", emoji: "🛠️", color: "bg-peach/15 text-peach" },
  confirmed: { label: "Confirmed", emoji: "🚀", color: "bg-teal/15 text-teal" },
  expert: { label: "Expert", emoji: "👑", color: "bg-lavender/15 text-lavender" },
  veteran: { label: "Expert", emoji: "👑", color: "bg-lavender/15 text-lavender" },
}
