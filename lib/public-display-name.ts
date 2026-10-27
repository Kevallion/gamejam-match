/** True when a label looks like an email or an email local-part (plus-addressing). */
export function isEmailDerivedLabel(value: string | null | undefined): boolean {
  const trimmed = value?.trim() ?? ""
  if (!trimmed) return false
  return trimmed.includes("@") || trimmed.includes("+")
}

/** First candidate that is safe to show to other jammers. Never an email local-part. */
export function publicJammerName(
  candidates: Array<string | null | undefined>,
  fallback = "A Jammer",
): string {
  for (const candidate of candidates) {
    const trimmed = candidate?.trim()
    if (!trimmed || isEmailDerivedLabel(trimmed)) continue
    return trimmed
  }
  return fallback
}
