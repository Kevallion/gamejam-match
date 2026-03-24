/**
 * Types for Supabase tables (profiles, teams).
 * Keep in sync with `supabase/migrations` (e.g. `main_role` text nullable → `20260329120000_profiles_main_role.sql`).
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
  onboarding_version?: number | null
  discord_username?: string | null
  default_role?: string | null
  /** `public.profiles.main_role` — text, nullable (smart match / display ; sinon `default_role` / `role`). */
  main_role?: string | null
  default_engine?: string | null
  default_language?: string | null
  portfolio_url?: string | null
  xp?: number | null
  level?: number | null
  last_daily_xp_at?: string | null
  unlocked_titles?: unknown
  current_title?: string | null
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
  /** Fenêtre du jam affichée sur les cartes ; `expires_at` est aligné sur `jam_end_date`. */
  jam_start_date?: string
  jam_end_date?: string
  jam_completion_xp_claimed?: boolean | null
}
