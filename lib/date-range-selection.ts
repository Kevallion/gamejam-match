import { isSameDay } from "date-fns"
import type { DateRange } from "react-day-picker"

/**
 * Two-click range that ignores react-day-picker's own range math.
 * The library completes the first click as `{ from: day, to: day }` (min = 0)
 * and a second event on the end day then collapses the whole range onto that day.
 */
export function selectDateRangeDay(current: DateRange | undefined, day: Date): DateRange {
  const pendingStart = current?.from && !current.to ? current.from : undefined
  if (!pendingStart) {
    return { from: day, to: undefined }
  }
  if (isSameDay(pendingStart, day)) {
    return { from: pendingStart, to: day }
  }
  return pendingStart.getTime() <= day.getTime()
    ? { from: pendingStart, to: day }
    : { from: day, to: pendingStart }
}
