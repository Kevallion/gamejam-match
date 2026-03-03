/**
 * Types for Supabase tables (profiles, teams).
 * Aligned with schema and migrations.
 */

export type ExperienceLevel =
  | "beginner"
  | "junior"
  | "regular"
  | "advanced"
  | "senior"
  | "veteran"

export type JamStyle = "chill" | "learning" | "dedicated" | "competitive"

export interface ProfileRow {
  id: string
  username: string
  role: string
  experience?: string
  experience_level?: ExperienceLevel | null
  jam_style?: JamStyle | null
  engine: string
  language: string
  bio: string
  availability?: string | null
  portfolio_link?: string | null
  avatar_url?: string | null
  has_completed_onboarding?: boolean | null
}

export interface TeamRow {
  id: string
  user_id: string
  team_name: string
  game_name: string
  description: string
  engine: string
  language: string
  looking_for: { role: string; level: string }[]
  discord_link?: string | null
  team_vibe?: JamStyle | null
  experience_required?: ExperienceLevel | string | null
  created_at?: string
  expires_at?: string
}
