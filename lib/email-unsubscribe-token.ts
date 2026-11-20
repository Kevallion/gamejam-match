import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * Signed e-mail unsubscribe tokens (server only).
 *
 * token = base64url(HMAC-SHA256(EMAIL_UNSUBSCRIBE_SECRET, `${userId}:${scope}`))
 *
 * No other secret is ever used as a fallback: when EMAIL_UNSUBSCRIBE_SECRET is
 * missing, links are simply not generated and verification reports "unavailable".
 * Keep this file free of app imports so it can be unit-checked with plain Node.
 */

export type EmailCategory = "team_activity" | "matching_announcements"
export type UnsubscribeScope = "team" | "matching" | "all"

export const EMAIL_PREFERENCE_COLUMN: Record<EmailCategory, "email_team_activity" | "email_matching_announcements"> = {
  team_activity: "email_team_activity",
  matching_announcements: "email_matching_announcements",
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/

let warnedMissingSecret = false

function getUnsubscribeSecret(): string | null {
  const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET?.trim()
  if (!secret) {
    if (!warnedMissingSecret) {
      warnedMissingSecret = true
      console.warn(
        "[unsubscribe] EMAIL_UNSUBSCRIBE_SECRET is not set: signed unsubscribe links are disabled and emails link to dashboard settings instead.",
      )
    }
    return null
  }
  return secret
}

export function isUnsubscribeAvailable(): boolean {
  return getUnsubscribeSecret() !== null
}

export function scopeForCategory(category: EmailCategory): UnsubscribeScope {
  return category === "team_activity" ? "team" : "matching"
}

export function parseUnsubscribeScope(value: unknown): UnsubscribeScope | null {
  return value === "team" || value === "matching" || value === "all" ? value : null
}

/** Preference columns turned off by an unsubscribe of the given scope. */
export function columnsForScope(scope: UnsubscribeScope): Array<"email_team_activity" | "email_matching_announcements"> {
  if (scope === "team") return ["email_team_activity"]
  if (scope === "matching") return ["email_matching_announcements"]
  return ["email_team_activity", "email_matching_announcements"]
}

function computeSignature(secret: string, userId: string, scope: UnsubscribeScope): Buffer {
  return createHmac("sha256", secret).update(`${userId.toLowerCase()}:${scope}`, "utf8").digest()
}

/** Returns the base64url token, or null when the secret is not configured. */
export function signUnsubscribeToken(userId: string, scope: UnsubscribeScope): string | null {
  const secret = getUnsubscribeSecret()
  if (!secret || !UUID_RE.test(userId)) return null
  return computeSignature(secret, userId, scope).toString("base64url")
}

export type UnsubscribeVerification =
  | { ok: true; userId: string; scope: UnsubscribeScope }
  | { ok: false; reason: "unavailable" | "invalid" }

export function verifyUnsubscribeToken(
  rawUserId: unknown,
  rawScope: unknown,
  rawToken: unknown,
): UnsubscribeVerification {
  const secret = getUnsubscribeSecret()
  if (!secret) return { ok: false, reason: "unavailable" }

  const userId = typeof rawUserId === "string" ? rawUserId.trim() : ""
  const scope = parseUnsubscribeScope(typeof rawScope === "string" ? rawScope.trim() : rawScope)
  const token = typeof rawToken === "string" ? rawToken.trim() : ""
  if (!UUID_RE.test(userId) || !scope || !TOKEN_RE.test(token)) {
    return { ok: false, reason: "invalid" }
  }

  const expected = computeSignature(secret, userId, scope)
  const given = Buffer.from(token, "base64url")
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { ok: false, reason: "invalid" }
  }
  return { ok: true, userId: userId.toLowerCase(), scope }
}
