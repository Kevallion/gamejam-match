import { endOfDay, parseISO, startOfDay } from "date-fns"
import type { DateRange } from "react-day-picker"

export type ExternalJamLike = {
  starts_at?: string | null
  ends_at?: string | null
}

/**
 * Build a calendar date range for the create-team form from external_jams timestamps.
 * Uses local startOfDay/endOfDay so the picker matches user-facing dates.
 */
export function dateRangeFromExternalJam(jam: ExternalJamLike): DateRange | undefined {
  const s = jam.starts_at
  const e = jam.ends_at
  if (s && e) {
    const from = parseISO(s)
    const to = parseISO(e)
    if (!Number.isNaN(+from) && !Number.isNaN(+to) && from.getTime() <= to.getTime()) {
      return { from: startOfDay(from), to: endOfDay(to) }
    }
  }
  if (e) {
    const end = parseISO(e)
    if (!Number.isNaN(+end)) {
      return { from: startOfDay(end), to: endOfDay(end) }
    }
  }
  if (s) {
    const start = parseISO(s)
    if (!Number.isNaN(+start)) {
      return { from: startOfDay(start), to: endOfDay(start) }
    }
  }
  return undefined
}
