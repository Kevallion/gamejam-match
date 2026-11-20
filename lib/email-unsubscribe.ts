import { getPublicSiteUrl } from "@/lib/site-url"
import { createAdminClient } from "@/lib/supabase/admin"
import { isMissingColumnError } from "@/lib/optional-column"
import {
  columnsForScope,
  scopeForCategory,
  signUnsubscribeToken,
  verifyUnsubscribeToken,
  type EmailCategory,
  type UnsubscribeScope,
} from "@/lib/email-unsubscribe-token"

/** Settings tab, used when signed links are unavailable. */
export function getEmailSettingsUrl(): string {
  return `${getPublicSiteUrl()}/dashboard?tab=settings`
}

/**
 * Signed links for one recipient and category, or null when
 * EMAIL_UNSUBSCRIBE_SECRET is not configured.
 */
export function buildUnsubscribeUrls(
  userId: string,
  category: EmailCategory,
): { pageUrl: string; oneClickUrl: string } | null {
  const scope = scopeForCategory(category)
  const token = signUnsubscribeToken(userId, scope)
  if (!token) return null
  const query = new URLSearchParams({ u: userId, c: scope, t: token }).toString()
  const base = getPublicSiteUrl()
  return {
    pageUrl: `${base}/unsubscribe?${query}`,
    oneClickUrl: `${base}/api/unsubscribe?${query}`,
  }
}

export type ApplyUnsubscribeResult =
  | { ok: true; scope: UnsubscribeScope }
  | { ok: false; reason: "unavailable" | "invalid" | "not_migrated" | "error" }

/**
 * Verifies the signature, then turns off the matching preference column(s)
 * with the service role. Never reads or returns the user's email.
 * Unknown user ids are treated as success (nothing to update, no account probing).
 */
export async function applyUnsubscribe(
  rawUserId: unknown,
  rawScope: unknown,
  rawToken: unknown,
): Promise<ApplyUnsubscribeResult> {
  const verification = verifyUnsubscribeToken(rawUserId, rawScope, rawToken)
  if (!verification.ok) return verification

  const patch: Record<string, boolean> = {}
  for (const column of columnsForScope(verification.scope)) patch[column] = false

  try {
    const admin = createAdminClient()
    const { error } = await admin.from("profiles").update(patch).eq("id", verification.userId)
    if (error) {
      if (
        isMissingColumnError(error, "email_team_activity") ||
        isMissingColumnError(error, "email_matching_announcements")
      ) {
        console.error("[unsubscribe] email preference columns are missing (migration not applied).")
        return { ok: false, reason: "not_migrated" }
      }
      console.error("[unsubscribe] update failed:", error.code ?? "", error.message ?? "")
      return { ok: false, reason: "error" }
    }
    return { ok: true, scope: verification.scope }
  } catch (err) {
    console.error("[unsubscribe] update threw:", err instanceof Error ? err.message : err)
    return { ok: false, reason: "error" }
  }
}
