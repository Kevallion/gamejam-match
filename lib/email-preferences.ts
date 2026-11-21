import { isMissingColumnError } from "@/lib/optional-column"

/** S3 columns on public.profiles (Pixel's migration). true = subscribed. */
export const EMAIL_PREFERENCE_COLUMNS = ["email_team_activity", "email_matching_announcements"] as const
export const EMAIL_PREFERENCE_SELECT = EMAIL_PREFERENCE_COLUMNS.join(", ")
/** Error code returned by updateEmailPreferences while the migration is not applied. */
export const EMAIL_PREFERENCES_UNAVAILABLE = "EMAIL_PREFERENCES_UNAVAILABLE"

export type EmailPreferences = {
  teamActivity: boolean
  matchingAnnouncements: boolean
}

export function isMissingEmailPreferenceColumnError(
  error: { code?: string | null; message?: string | null } | null | undefined,
): boolean {
  return EMAIL_PREFERENCE_COLUMNS.some((column) => isMissingColumnError(error, column))
}

/** Missing or null values read as subscribed (the column default). */
export function readEmailPreferences(row: {
  email_team_activity?: boolean | null
  email_matching_announcements?: boolean | null
} | null | undefined): EmailPreferences {
  return {
    teamActivity: row?.email_team_activity !== false,
    matchingAnnouncements: row?.email_matching_announcements !== false,
  }
}