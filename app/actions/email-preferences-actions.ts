"use server"

import { createClient } from "@/lib/supabase/server"
import { isMissingColumnError } from "@/lib/optional-column"

export type EmailPreferences = {
  emailTeamActivity: boolean
  emailMatchingAnnouncements: boolean
}

export type EmailPreferencesResult =
  | { success: true; prefs: EmailPreferences }
  | { success: false; error: string }

const SELECT_COLUMNS = "email_team_activity, email_matching_announcements"

function isPreferenceColumnMissing(error: { code?: string | null; message?: string | null } | null): boolean {
  return (
    isMissingColumnError(error, "email_team_activity") ||
    isMissingColumnError(error, "email_matching_announcements")
  )
}

function toPrefs(row: Record<string, unknown> | null | undefined): EmailPreferences {
  return {
    emailTeamActivity: row?.email_team_activity !== false,
    emailMatchingAnnouncements: row?.email_matching_announcements !== false,
  }
}

/**
 * Updates the signed-in user's email preferences. The user always comes from
 * the server session, never from the input. Omitted fields are left unchanged.
 */
export async function updateEmailPreferences(input: {
  emailTeamActivity?: boolean
  emailMatchingAnnouncements?: boolean
}): Promise<
  | { success: true; prefs: { emailTeamActivity: boolean; emailMatchingAnnouncements: boolean } }
  | { success: false; error: string }
> {
  if (!input || typeof input !== "object") {
    return { success: false, error: "INVALID_INPUT" }
  }
  const patch: Record<string, boolean> = {}
  if (input.emailTeamActivity !== undefined) {
    if (typeof input.emailTeamActivity !== "boolean") return { success: false, error: "INVALID_INPUT" }
    patch.email_team_activity = input.emailTeamActivity
  }
  if (input.emailMatchingAnnouncements !== undefined) {
    if (typeof input.emailMatchingAnnouncements !== "boolean") {
      return { success: false, error: "INVALID_INPUT" }
    }
    patch.email_matching_announcements = input.emailMatchingAnnouncements
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "NOT_AUTHENTICATED" }

  if (Object.keys(patch).length === 0) {
    const { data, error } = await supabase
      .from("profiles")
      .select(SELECT_COLUMNS)
      .eq("id", user.id)
      .maybeSingle()
    if (error) {
      if (isPreferenceColumnMissing(error)) return { success: false, error: "EMAIL_PREFERENCES_UNAVAILABLE" }
      return { success: false, error: "UPDATE_FAILED" }
    }
    return { success: true, prefs: toPrefs(data as Record<string, unknown> | null) }
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", user.id)
    .select(SELECT_COLUMNS)
    .maybeSingle()

  if (error) {
    if (isPreferenceColumnMissing(error)) return { success: false, error: "EMAIL_PREFERENCES_UNAVAILABLE" }
    console.error("[email-preferences] update failed:", error.code ?? "", error.message ?? "")
    return { success: false, error: "UPDATE_FAILED" }
  }
  if (!data) return { success: false, error: "PROFILE_NOT_FOUND" }

  return { success: true, prefs: toPrefs(data as Record<string, unknown>) }
}

/**
 * Reads the signed-in user's email preferences (both default to true).
 * Returns EMAIL_PREFERENCES_UNAVAILABLE while the migration is not applied.
 */
export async function getEmailPreferences(): Promise<EmailPreferencesResult> {
  return updateEmailPreferences({})
}
