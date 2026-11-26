/** Shared magic-link OTP helpers. Keep this file free of "use server" so tests can import it. */

export type AuthOtpPurpose = "signin" | "signup"

export type AuthOtpErrorKind = "invalid_email" | "rate_limit" | "other"

export type AuthOtpResult =
  | { success: true }
  | { success: false; error: string; kind: AuthOtpErrorKind }

export const SIGN_IN_OTP_SUCCESS_MESSAGE =
  "If an account exists for this email, we've sent you a sign-in link. New here? Create an account."

export const SIGN_UP_OTP_SUCCESS_MESSAGE =
  "Check your email to finish creating your account."

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Trim, lowercase, and reject values that are not a plausible email. */
export function normalizeAuthEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed || trimmed.length > 254 || !EMAIL_RE.test(trimmed)) return null
  return trimmed
}

export function isRateLimitOtpError(error: {
  message?: string | null
  status?: number | null
  code?: string | null
}): boolean {
  const raw = `${error.message ?? ""} ${error.code ?? ""}`.toLowerCase()
  const status = error.status ?? 0
  return (
    status === 429 ||
    raw.includes("rate limit") ||
    raw.includes("too many") ||
    raw.includes("over_email_send_rate_limit")
  )
}

export function isInvalidEmailOtpError(error: {
  message?: string | null
  status?: number | null
  code?: string | null
}): boolean {
  const raw = `${error.message ?? ""} ${error.code ?? ""}`.toLowerCase()
  return (
    raw.includes("unable to validate email") ||
    raw.includes("email address is invalid") ||
    raw.includes("invalid email") ||
    raw.includes("invalid_email")
  )
}

/**
 * Errors that would reveal whether the address is already registered.
 * The action must treat these as a successful send.
 */
export function isEnumerationSafeOtpError(
  error: { message?: string | null; status?: number | null; code?: string | null },
  purpose: AuthOtpPurpose,
): boolean {
  const raw = `${error.message ?? ""} ${error.code ?? ""}`.toLowerCase()
  const status = error.status ?? 0
  if (isRateLimitOtpError(error) || isInvalidEmailOtpError(error)) return false
  if (purpose === "signin") {
    return (
      raw.includes("signups not allowed") ||
      raw.includes("signup is disabled") ||
      raw.includes("user not found") ||
      raw.includes("user_not_found") ||
      (status === 422 && raw.includes("otp"))
    )
  }
  return (
    raw.includes("already registered") ||
    raw.includes("already exists") ||
    raw.includes("user already") ||
    raw.includes("email exists") ||
    raw.includes("identity_already_exists") ||
    (status === 422 && (raw.includes("otp") || raw.includes("registered") || raw.includes("exists")))
  )
}

export function classifyVisibleOtpError(error: {
  message?: string | null
  status?: number | null
  code?: string | null
}): { kind: AuthOtpErrorKind; message: string } {
  if (isRateLimitOtpError(error)) {
    return {
      kind: "rate_limit",
      message: "Too many attempts. Please wait a moment and try again.",
    }
  }
  if (isInvalidEmailOtpError(error)) {
    return {
      kind: "invalid_email",
      message: "Please enter a valid email address.",
    }
  }
  return {
    kind: "other",
    message: "Something went wrong. Please try again.",
  }
}

/** Map a Supabase OTP error to the public result. Success has no extra fields. */
export function resolveAuthOtpError(
  error: { message?: string | null; status?: number | null; code?: string | null },
  purpose: AuthOtpPurpose,
): AuthOtpResult {
  if (isEnumerationSafeOtpError(error, purpose)) return { success: true }
  const visible = classifyVisibleOtpError(error)
  return { success: false, error: visible.message, kind: visible.kind }
}

export function successfulAuthOtpResult(): AuthOtpResult {
  return { success: true }
}