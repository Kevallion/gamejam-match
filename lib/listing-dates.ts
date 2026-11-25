import { format, isValid, parseISO } from "date-fns"
import type { DateRange } from "react-day-picker"
import { dateInputToUtcEnd, dateInputToUtcStart } from "@/lib/jam-date-utc"
import { isJamStartBackfilledWithCreatedAt } from "@/lib/jam-calendar-status"

/** English UI label when a listing has no dates. Capitaine wrote « Dates flexibles »; Wisllor can decide. */
export const FLEXIBLE_DATES_LABEL = "Flexible dates"

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
  const start = parseISO(jamStartIso as string)
  const end = parseISO(jamEndIso as string)
  if (!isValid(start) || !isValid(end)) return FLEXIBLE_DATES_LABEL
  if (start.getTime() === end.getTime()) return format(start, "MMM d, yyyy")
  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`
  }
  return `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`
}

export const JAM_DATES_INCOMPLETE_MESSAGE =
  "Add both a start and end date, or leave both empty."
export const JAM_DATES_ORDER_MESSAGE = "The jam start date must be before the end date."

export type JamDateYmd = { start: string; end: string }
export type JamDatesValidation =
  | { ok: true; ymd: JamDateYmd | null }
  | { ok: false; message: string }

/** Optional jam window: both empty, or a complete start-before-end range. */
export function validateOptionalJamYmd(
  start: string | null | undefined,
  end: string | null | undefined,
): JamDatesValidation {
  const startYmd = start?.trim() ?? ""
  const endYmd = end?.trim() ?? ""
  if (!startYmd && !endYmd) return { ok: true, ymd: null }
  if (!startYmd || !endYmd) return { ok: false, message: JAM_DATES_INCOMPLETE_MESSAGE }
  const startMs = new Date(dateInputToUtcStart(startYmd)).getTime()
  const endMs = new Date(dateInputToUtcEnd(endYmd)).getTime()
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs >= endMs) {
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
    from ? format(from, "yyyy-MM-dd") : "",
    to ? format(to, "yyyy-MM-dd") : "",
  )
}
