/** Convert `<input type="date">` value (YYYY-MM-DD) to UTC day start ISO. */
export function dateInputToUtcStart(ymd: string): string {
  return new Date(`${ymd}T00:00:00.000Z`).toISOString()
}

/** Convert `<input type="date">` value (YYYY-MM-DD) to UTC day end ISO. */
export function dateInputToUtcEnd(ymd: string): string {
  return new Date(`${ymd}T23:59:59.999Z`).toISOString()
}

export function isoTimestampToDateInput(iso: string | null | undefined): string {
  if (!iso) return ""
  return iso.slice(0, 10)
}

export function defaultJamStartYmd(): string {
  return new Date().toISOString().slice(0, 10)
}

export function defaultJamEndYmd(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + 30)
  return d.toISOString().slice(0, 10)
}
