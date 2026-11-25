import { format, isValid } from "date-fns"

/** Coerce a Date, ISO string, or epoch ms to a valid Date. Never throws. */
export function toValidDate(value: unknown): Date | null {
  if (value instanceof Date) return isValid(value) ? value : null
  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(value)
    return Number.isFinite(date.getTime()) ? date : null
  }
  if (typeof value === "string" && value.trim() !== "") {
    const date = new Date(value)
    return Number.isFinite(date.getTime()) ? date : null
  }
  return null
}

/** date-fns format() that never throws (Invalid Date after a Server Action refresh). */
export function formatDateSafe(value: unknown, pattern: string, fallback = ""): string {
  const date = toValidDate(value)
  if (!date) return fallback
  try {
    return format(date, pattern)
  } catch {
    return fallback
  }
}
