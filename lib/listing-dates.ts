import type { DateRange } from "react-day-picker"
import { dateInputToUtcEnd, dateInputToUtcStart, formatJamCalendarDate } from "@/lib/jam-date-utc"
import { isJamStartBackfilledWithCreatedAt } from "@/lib/jam-calendar-status"
import { formatDateSafe } from "./safe-date-format"

export { formatJamDateRangeReview } from "./format-jam-date-range-review"

/** Exception FR decided by Wisllor on 25 Nov 2026: this label is French, unlike the rest of the UI. */
export const FLEXIBLE_DATES_LABEL = "Dates flexibles"

const UNSPECIFIED_AVAILABILITY = new Set([
  "",
  "not specified",
  "dates flexibles",
  "flexible dates",
])

export function isUnspecifiedAvailability(value: string | null | undefined): boolean {
  if (value == null) return true
  return UNSPECIFIED_AVAILABILITY.has(value.trim().toLowerCase())
}

const AVAILABILITY_DATE = /^\d{4}-\d{2}-\d{2}(?:\s+to\s+\d{4}-\d{2}-\d{2})?$/i

/** Display helper. Stored empty / "Not specified" / non-date values stay unchanged in the database. */
export function formatAvailabilityLabel(value: string | null | undefined): string {
  if (isUnspecifiedAvailability(value)) return FLEXIBLE_DATES_LABEL
  const trimmed = value!.trim()
  if (!AVAILABILITY_DATE.test(trimmed)) return FLEXIBLE_DATES_LABEL
  return trimmed
}

export function listingHasRealJamDates(
  jamStartIso?: string | null,
  jamEndIso?: string | null,
  createdAtIso?: string | null,
): boolean {
  if (!jamStartIso?.trim() || !jamEndIso?.trim()) return false
  if (isJamStartBackfilledWithCreatedAt(jamStartIso, createdAtIso)) return false
  const start = new Date(jamStartIso).getTime()
  const end = new Date(jamEndIso).getTime()
  return Number.isFinite(start) && Number.isFinite(end)
}

export function formatListingDatesLabel(
  jamStartIso?: string | null,
  jamEndIso?: string | null,
  createdAtIso?: string | null,
): string {
  if (!listingHasRealJamDates(jamStartIso, jamEndIso, createdAtIso)) {
    return FLEXIBLE_DATES_LABEL
  }
  const startLabel = formatJamCalendarDate(jamStartIso)
  const endLabel = formatJamCalendarDate(jamEndIso)
  if (!startLabel || !endLabel) return FLEXIBLE_DATES_LABEL
  if (startLabel === endLabel) return startLabel
  const startYmd = (jamStartIso as string).slice(0, 10)
  const endYmd = (jamEndIso as string).slice(0, 10)
  const sameYear = startYmd.slice(0, 4) === endYmd.slice(0, 4)
  if (sameYear) {
    const startNoYear = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(jamStartIso as string))
    return `${startNoYear} – ${endLabel}`
  }
  return `${startLabel} – ${endLabel}`
}

export const JAM_DATES_INCOMPLETE_MESSAGE =
  "Add both a start and end date, or leave both empty."
export const JAM_DATES_ORDER_MESSAGE = "The jam start date must be on or before the end date."

export type JamDateYmd = { start: string; end: string }
export type JamDatesValidation =
  | { ok: true; ymd: JamDateYmd | null }
  | { ok: false; message: string }

/** Optional jam window: both empty, or a complete start-on-or-before-end range. */
export function validateOptionalJamYmd(
  start: string | null | undefined,
  end: string | null | undefined,
): JamDatesValidation {
  const startYmd = start?.trim() ?? ""
  const endYmd = end?.trim() ?? ""
  if (!startYmd && !endYmd) return { ok: true, ymd: null }
  if (!startYmd || !endYmd) return { ok: false, message: JAM_DATES_INCOMPLETE_MESSAGE }
  let startMs: number
  let endMs: number
  try {
    startMs = new Date(dateInputToUtcStart(startYmd)).getTime()
    endMs = new Date(dateInputToUtcEnd(endYmd)).getTime()
  } catch {
    return { ok: false, message: JAM_DATES_ORDER_MESSAGE }
  }
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startYmd > endYmd) {
    return { ok: false, message: JAM_DATES_ORDER_MESSAGE }
  }
  return { ok: true, ymd: { start: startYmd, end: endYmd } }
}

export function validateOptionalJamRange(
  range: DateRange | undefined,
): JamDatesValidation {
  const from = range?.from
  const to = range?.to
  return validateOptionalJamYmd(
    from ? formatDateSafe(from, "yyyy-MM-dd") : "",
    to ? formatDateSafe(to, "yyyy-MM-dd") : "",
  )
}
