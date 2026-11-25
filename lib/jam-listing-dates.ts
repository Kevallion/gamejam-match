import { dateInputToUtcEnd, dateInputToUtcStart, utcYmdFromIso } from "@/lib/jam-date-utc"

export const JAM_DATES_PAIR_REQUIRED_MSG =
  "Provide both a jam start and a jam end, or leave both empty."

export const JAM_START_BEFORE_END_MSG = "Jam start must be on or before jam end."

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export type JamListingDatesInput = {
  jamStartDate?: string | null
  jamEndDate?: string | null
}

export type JamListingDatesResult =
  | { ok: true; start: string | null; end: string | null }
  | { ok: false; error: string; path: "jamStartDate" | "jamEndDate" }

function isBlank(value: string | null | undefined): boolean {
  return value == null || value.trim() === ""
}

/**
 * Shared create/update rule: both dates absent (stored as NULL), or both
 * present with start on or before end (calendar dates, stored at 12:00 UTC).
 * A single date is refused. Incoming timestamps are normalized to UTC noon
 * of their UTC calendar day so a same-day start/end stays valid.
 */
export function normalizeJamListingDates(input: JamListingDatesInput): JamListingDatesResult {
  const hasStart = !isBlank(input.jamStartDate)
  const hasEnd = !isBlank(input.jamEndDate)

  if (!hasStart && !hasEnd) {
    return { ok: true, start: null, end: null }
  }

  if (!hasStart) {
    return { ok: false, error: JAM_DATES_PAIR_REQUIRED_MSG, path: "jamStartDate" }
  }
  if (!hasEnd) {
    return { ok: false, error: JAM_DATES_PAIR_REQUIRED_MSG, path: "jamEndDate" }
  }

  const startMs = Date.parse(input.jamStartDate!.trim())
  const endMs = Date.parse(input.jamEndDate!.trim())
  if (Number.isNaN(startMs)) {
    return { ok: false, error: "Invalid date.", path: "jamStartDate" }
  }
  if (Number.isNaN(endMs)) {
    return { ok: false, error: "Invalid date.", path: "jamEndDate" }
  }

  const startYmd = utcYmdFromIso(new Date(startMs).toISOString())
  const endYmd = utcYmdFromIso(new Date(endMs).toISOString())
  if (!startYmd) {
    return { ok: false, error: "Invalid date.", path: "jamStartDate" }
  }
  if (!endYmd) {
    return { ok: false, error: "Invalid date.", path: "jamEndDate" }
  }
  if (startYmd > endYmd) {
    return { ok: false, error: JAM_START_BEFORE_END_MSG, path: "jamEndDate" }
  }

  return { ok: true, start: dateInputToUtcStart(startYmd), end: dateInputToUtcEnd(endYmd) }
}

/** When there is no jam end, listings keep the existing 30-day default window. */
export function defaultTeamExpiresAtIso(jamEndIso: string | null, now = new Date()): string {
  if (jamEndIso) return jamEndIso
  return new Date(now.getTime() + THIRTY_DAYS_MS).toISOString()
}