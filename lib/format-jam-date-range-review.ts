import type { DateRange } from "react-day-picker"
import { dateInputToUtcEnd, dateInputToUtcStart, formatJamCalendarDate } from "./jam-date-utc"
import { formatDateSafe } from "./safe-date-format"

/** Review-step label. Never throws, including Invalid Date after a Server Action. */
export function formatJamDateRangeReview(
  range: DateRange | undefined,
  flexLabel: string = "Dates flexibles",
): { text: string; hasEnd: boolean } {
  const startYmd = formatDateSafe(range?.from, "yyyy-MM-dd")
  if (!startYmd) return { text: flexLabel, hasEnd: false }
  const endYmd = formatDateSafe(range?.to, "yyyy-MM-dd")
  try {
    const startLabel = formatJamCalendarDate(dateInputToUtcStart(startYmd))
    const endLabel = endYmd ? formatJamCalendarDate(dateInputToUtcEnd(endYmd)) : null
    if (startLabel && endLabel) return { text: `${startLabel} – ${endLabel}`, hasEnd: true }
    return { text: startLabel ?? flexLabel, hasEnd: false }
  } catch {
    return { text: flexLabel, hasEnd: false }
  }
}