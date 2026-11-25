/** Convert a YYYY-MM-DD calendar date to a timestamptz that keeps that date
 * in local clocks from UTC-11 through UTC+11 (12:00 UTC). */
const YMD = /^(\d{4})-(\d{2})-(\d{2})$/

export function isValidYmd(ymd: string): boolean {
  if (!YMD.test(ymd)) return false
  const date = new Date(`${ymd}T12:00:00.000Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === ymd
}

export function dateInputToUtcNoon(ymd: string): string {
  if (!isValidYmd(ymd)) {
    throw new RangeError(`Invalid calendar date: ${ymd}`)
  }
  return new Date(`${ymd}T12:00:00.000Z`).toISOString()
}

export function dateInputToUtcStart(ymd: string): string {
  return dateInputToUtcNoon(ymd)
}

/** Convert `<input type="date">` value (YYYY-MM-DD) to the stored jam instant (UTC noon). */
export function dateInputToUtcEnd(ymd: string): string {
  return dateInputToUtcNoon(ymd)
}

export function utcYmdFromIso(iso: string | null | undefined): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (!Number.isFinite(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

export function isoTimestampToDateInput(iso: string | null | undefined): string {
  return utcYmdFromIso(iso)
}

export function utcCalendarDayStartMs(iso: string): number {
  const ymd = utcYmdFromIso(iso)
  return ymd ? Date.parse(`${ymd}T00:00:00.000Z`) : Number.NaN
}

export function utcCalendarDayEndMs(iso: string): number {
  const ymd = utcYmdFromIso(iso)
  return ymd ? Date.parse(`${ymd}T23:59:59.999Z`) : Number.NaN
}

export function endOfUtcCalendarDayIso(iso: string): string | null {
  const endMs = utcCalendarDayEndMs(iso)
  return Number.isFinite(endMs) ? new Date(endMs).toISOString() : null
}

/** Format a stored jam instant as a calendar date. Default timeZone is UTC so
 * Dec 8 12:00Z and legacy Dec 8 23:59:59.999Z both show as Dec 8 everywhere. */
export function formatJamCalendarDate(
  iso: string | null | undefined,
  options?: { locale?: string; timeZone?: string },
): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (!Number.isFinite(date.getTime())) return null
  return new Intl.DateTimeFormat(options?.locale ?? "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: options?.timeZone ?? "UTC",
  }).format(date)
}

export function defaultJamStartYmd(): string {
  return new Date().toISOString().slice(0, 10)
}

export function defaultJamEndYmd(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + 30)
  return d.toISOString().slice(0, 10)
}