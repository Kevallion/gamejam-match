"use server"

import { createClient } from "@/lib/supabase/server"
import { isMissingColumnError } from "@/lib/optional-column"

type ServerSupabase = Awaited<ReturnType<typeof createClient>>
type DbError = { code?: string | null; message?: string | null } | null

export type EmailPreferences = {
  emailTeamActivity: boolean
  emailMatchingAnnouncements: boolean
}

export type EmailPreferencesResult =
  | { success: true; prefs: EmailPreferences }
  | { success: false; error: string }

const SELECT_COLUMNS = "email_team_activity, email_matching_announcements"

function isPreferenceColumnMissing(error: DbError): boolean {
  return (
    isMissingColumnError(error, "email_team_activity") ||
    isMissingColumnError(error, "email_matching_announcements")
  )
}

function isMissingFunction(error: DbError): boolean {
  if (!error) return false
  return (
    error.code === "42883" ||
    error.code === "PGRST202" ||
    /get_my_email_preferences|could not find the function/i.test(error.message ?? "")
  )
}

/**
 * Own preferences only. After S7 the columns are not selectable through the
 * user session; they are read with the owner-only RPC get_my_email_preferences.
 * Before S7 the RPC does not exist, so the columns are read directly.
 */
async function readOwnPreferences(
  supabase: ServerSupabase,
  userId: string,
): Promise<EmailPreferencesResult> {
  const rpc = await supabase.rpc("get_my_email_preferences")
  if (!rpc.error) {
    const row = Array.isArray(rpc.data) ? (rpc.data[0] as Record<string, unknown> | undefined) : undefined
    if (!row) return { success: false, error: "PROFILE_NOT_FOUND" }
    return { success: true, prefs: toPrefs(row) }
  }
  // 42703: the RPC exists (S7) but the S3 columns do not.
  if (rpc.error.code === "42703" || isPreferenceColumnMissing(rpc.error)) {
    return { success: false, error: "EMAIL_PREFERENCES_UNAVAILABLE" }
  }
  if (!isMissingFunction(rpc.error)) {
    console.error("[email-preferences] read failed:", rpc.error.code ?? "", rpc.error.message ?? "")
    return { success: false, error: "UPDATE_FAILED" }
  }
  const { data, error } = await supabase.from("profiles").select(SELECT_COLUMNS).eq("id", userId).maybeSingle()
  if (error) {
    if (isPreferenceColumnMissing(error)) return { success: false, error: "EMAIL_PREFERENCES_UNAVAILABLE" }
    return { success: false, error: "UPDATE_FAILED" }
  }
  if (!data) return { success: false, error: "PROFILE_NOT_FOUND" }
  return { success: true, prefs: toPrefs(data as Record<string, unknown>) }
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
 * The update does not ask for the row back (UPDATE ... RETURNING would need
 * SELECT on the columns, revoked by S7); the result is read back with the
 * owner-only path.
 */
export async function updateEmailPreferences(input: {
  emailTeamActivity?: boolean
  emailMatchingAnnouncements?: boolean
}): Promise<EmailPreferencesResult> {
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

  if (Object.keys(patch).length > 0) {
    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id)
    if (error) {
      if (isPreferenceColumnMissing(error)) return { success: false, error: "EMAIL_PREFERENCES_UNAVAILABLE" }
      console.error("[email-preferences] update failed:", error.code ?? "", error.message ?? "")
      return { success: false, error: "UPDATE_FAILED" }
    }
  }

  return readOwnPreferences(supabase, user.id)
}

/**
 * Reads the signed-in user's email preferences (both default to true).
 * Returns EMAIL_PREFERENCES_UNAVAILABLE while the S3 migration is not applied.
 */
export async function getEmailPreferences(): Promise<EmailPreferencesResult> {
  return updateEmailPreferences({})
}
