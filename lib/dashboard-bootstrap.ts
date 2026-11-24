import { createClient } from "@/lib/supabase/server"
import { loadGamificationSnapshot, type GamificationSnapshot } from "@/lib/gamification-snapshot"
import { isMissingColumnError } from "@/lib/optional-column"
import { parseProgrammingLanguages } from "@/lib/constants"
import type { ProfileSettingsProfile } from "@/components/profile-settings"
import type { SmartMatchRoleInput } from "@/lib/queries"
import type { KudosCounts } from "@/lib/kudos"

const PROFILE_SELECT =
  "id, has_completed_onboarding, onboarding_version, jam_id, username, avatar_url, default_role, default_engine, engine, default_language, portfolio_url, jam_style, xp, current_title, directory_visible, role, experience, experience_level, language, bio, portfolio_link, profile_roles(role, experience_level, is_primary)"

type ProfileRow = {
  id: string
  has_completed_onboarding?: boolean | null
  jam_id?: string | null
  username?: string | null
  avatar_url?: string | null
  default_role?: string | null
  default_engine?: string | null
  engine?: string | null
  default_language?: string | null
  programming_languages?: unknown
  portfolio_url?: string | null
  jam_style?: string | null
  xp?: number | null
  current_title?: string | null
  directory_visible?: boolean | null
  profile_roles?: SmartMatchRoleInput[] | null
}

function mapProfile(row: ProfileRow): ProfileSettingsProfile {
  return {
    id: row.id,
    username: row.username,
    avatar_url: row.avatar_url,
    default_role: row.default_role,
    jam_style: row.jam_style ?? null,
    profile_roles: (row.profile_roles ?? [])
      .filter((role) => role?.role?.trim())
      .map((role) => ({
        role: (role.role ?? "").trim(),
        experience_level: (role.experience_level ?? "regular").trim() || "regular",
        is_primary: role.is_primary === true,
      }))
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary)),
    default_engine: row.default_engine,
    default_language: row.default_language,
    programming_languages: parseProgrammingLanguages(row.programming_languages),
    portfolio_url: row.portfolio_url,
    xp: typeof row.xp === "number" ? row.xp : 0,
    current_title: row.current_title ?? null,
    directory_visible: row.directory_visible !== false,
    email_preferences_available: false,
  }
}

/** First-paint payload for /dashboard: profile, XP/snapshot, kudos by category. No daily-login claim. */
export type DashboardBootstrap = {
  snapshot: GamificationSnapshot
  profile: ProfileSettingsProfile
  kudosByCategory: KudosCounts
  jamId: string | null
  onboardingComplete: boolean
  /** Raw profiles.engine, used by smart-match. */
  profileEngine: string | null
}

export async function loadDashboardBootstrap(userId: string): Promise<DashboardBootstrap | null> {
  if (!userId) return null
  try {
    const supabase = await createClient()
    const snapshotPromise = loadGamificationSnapshot(supabase, userId)
    const withLanguages = await supabase
      .from("profiles")
      .select(`${PROFILE_SELECT}, programming_languages`)
      .eq("id", userId)
      .maybeSingle()
    const profileRes =
      withLanguages.error && isMissingColumnError(withLanguages.error, "programming_languages")
        ? await supabase.from("profiles").select(PROFILE_SELECT).eq("id", userId).maybeSingle()
        : withLanguages

    let row = (profileRes.data ?? null) as ProfileRow | null
    if (profileRes.error || !row) {
      const fallback = await supabase
        .from("profiles")
        .select(
          "id, has_completed_onboarding, jam_id, username, avatar_url, default_role, default_engine, engine, default_language, portfolio_url, jam_style, xp, current_title, directory_visible, role, experience, experience_level, language, bio, portfolio_link",
        )
        .eq("id", userId)
        .maybeSingle()
      if (fallback.error || !fallback.data) return null
      row = { ...(fallback.data as ProfileRow), profile_roles: [] }
    }

    const snapshot = await snapshotPromise
    return {
      snapshot,
      profile: mapProfile(row),
      kudosByCategory: snapshot.kudosByCategory,
      jamId: row.jam_id ?? null,
      onboardingComplete: row.has_completed_onboarding === true,
      profileEngine: row.engine ?? null,
    }
  } catch (err) {
    console.error("[dashboard-bootstrap] failed:", err instanceof Error ? err.message : "unknown")
    return null
  }
}