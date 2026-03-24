export type JamListingPhase = "upcoming" | "live" | "ended" | "dates_pending"

export interface JamListingStatus {
  phase: JamListingPhase
  label: string
  badgeClassName: string
}

const MS_DAY = 86400000

/** Treat jam_start as migration backfill when it matches `created_at` within this window (DB / serialization skew). */
export const JAM_START_CREATED_AT_EQUAL_TOLERANCE_MS = 3000

export type GetJamListingStatusOptions = {
  nowMs?: number
  /** When set, if jam_start matches created_at (backfill), we never show "Live Now". */
  createdAtIso?: string | null
}

/**
 * True when `jam_start_date` is still the default from the calendar migration
 * (`jam_start_date = created_at`), so the user has not set a real jam start.
 */
export function isJamStartBackfilledWithCreatedAt(
  jamStartIso: string | null | undefined,
  createdAtIso: string | null | undefined,
  toleranceMs: number = JAM_START_CREATED_AT_EQUAL_TOLERANCE_MS,
): boolean {
  if (!jamStartIso?.trim() || !createdAtIso?.trim()) return false
  const start = new Date(jamStartIso).getTime()
  const created = new Date(createdAtIso).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(created)) return false
  return Math.abs(start - created) <= toleranceMs
}

/**
 * UI copy for team cards: jam window relative to now.
 * Pass `createdAtIso` so legacy backfilled `jam_start_date === created_at` does not show "Live Now".
 */
export function getJamListingStatus(
  jamStartIso: string | null | undefined,
  jamEndIso: string | null | undefined,
  options?: GetJamListingStatusOptions,
): JamListingStatus | null {
  const nowMs = options?.nowMs ?? Date.now()
  const createdAtIso = options?.createdAtIso

  if (!jamStartIso || !jamEndIso) return null
  const start = new Date(jamStartIso).getTime()
  const end = new Date(jamEndIso).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null

  const backfilledStart = isJamStartBackfilledWithCreatedAt(jamStartIso, createdAtIso)

  if (nowMs > end) {
    return {
      phase: "ended",
      label: "Jam Ended",
      badgeClassName:
        "border-border/60 bg-muted/80 text-muted-foreground",
    }
  }

  if (nowMs < start) {
    const msUntil = start - nowMs
    let label: string
    if (msUntil < MS_DAY) {
      label = "Starts in less than a day"
    } else {
      const days = Math.ceil(msUntil / MS_DAY)
      label = days === 1 ? "Starts in 1 day" : `Starts in ${days} days`
    }
    return {
      phase: "upcoming",
      label,
      badgeClassName:
        "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    }
  }

  if (backfilledStart) {
    return {
      phase: "dates_pending",
      label: "Dates to be confirmed",
      badgeClassName:
        "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200 font-medium",
    }
  }

  return {
    phase: "live",
    label: "Live Now 🔴",
    badgeClassName:
      "animate-pulse border-destructive/40 bg-destructive/15 text-destructive font-semibold",
  }
}
