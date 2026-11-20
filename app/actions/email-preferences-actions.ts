"use server"

/**
 * TEMPORARY STUB (Sentinelle, branch fix/s1-s4-s6-front).
 * Replaced by Pixel's implementation at merge (branch fix/s2-s3-rgpd-email,
 * same path, same signature): expect an add/add conflict, keep Pixel's file.
 *
 * Until then the front treats email preferences as unavailable.
 */

export type UpdateEmailPreferencesInput = {
  emailTeamActivity?: boolean
  emailMatchingAnnouncements?: boolean
}

export type UpdateEmailPreferencesResult =
  | { success: true; prefs: { emailTeamActivity: boolean; emailMatchingAnnouncements: boolean } }
  | { success: false; error: string }

export async function updateEmailPreferences(
  input: UpdateEmailPreferencesInput,
): Promise<UpdateEmailPreferencesResult> {
  void input
  return { success: false, error: "EMAIL_PREFERENCES_UNAVAILABLE" }
}