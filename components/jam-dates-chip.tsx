import { AppIcon } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"
import { formatJamCalendarDate } from "@/lib/jam-date-utc"
import {
  FLEXIBLE_DATES_LABEL,
  formatListingDatesLabel,
  listingHasRealJamDates,
} from "@/lib/listing-dates"
import { cn } from "@/lib/utils"

type JamDatesChipProps = {
  jamStartDate?: string | null
  jamEndDate?: string | null
  createdAt?: string | null
  /** `flexible` (default): no real range shows « Dates flexibles ». `end`: still show a lone end date. */
  empty?: "flexible" | "end"
  className?: string
}

/** Neo date chip: UTC calendar days via formatJamCalendarDate, or « Dates flexibles ». */
export function JamDatesChip({
  jamStartDate,
  jamEndDate,
  createdAt,
  empty = "flexible",
  className,
}: JamDatesChipProps) {
  const label = listingHasRealJamDates(jamStartDate, jamEndDate, createdAt)
    ? formatListingDatesLabel(jamStartDate, jamEndDate, createdAt)
    : empty === "end"
      ? (formatJamCalendarDate(jamEndDate) ??
        formatJamCalendarDate(jamStartDate) ??
        FLEXIBLE_DATES_LABEL)
      : FLEXIBLE_DATES_LABEL

  return (
    <span
      className={cn(
        "inline-flex max-w-full min-w-0 items-center gap-2 rounded-xl border border-border bg-card px-3 py-1 text-base font-semibold text-foreground shadow-[3px_3px_0_0_var(--neo-shadow)]",
        className,
      )}
    >
      <AppIcon icon={ICON.dates} size="md" tone="teal" />
      <span className="min-w-0 truncate">{label}</span>
    </span>
  )
}
