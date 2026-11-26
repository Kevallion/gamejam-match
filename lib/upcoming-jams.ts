export const UPCOMING_JAMS_API_PATH = "/api/jams/upcoming"

export type UpcomingJam = {
  id: string
  title: string
  url: string
  imageUrl: string
  host: string
  startAt: string
  endAt: string
  joinedCount: number
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

function isImageSrc(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//")) return value.length > 1
  return isHttpUrl(value)
}

function isIsoDate(value: string): boolean {
  return Number.isFinite(Date.parse(value))
}

export function parseUpcomingJam(value: unknown): UpcomingJam | null {
  if (!value || typeof value !== "object") return null
  const row = value as Record<string, unknown>
  const id = typeof row.id === "string" ? row.id.trim() : ""
  const title = typeof row.title === "string" ? row.title.trim() : ""
  const url = typeof row.url === "string" ? row.url.trim() : ""
  const imageUrl = typeof row.imageUrl === "string" ? row.imageUrl.trim() : ""
  const host = typeof row.host === "string" ? row.host.trim() : ""
  const startAt = typeof row.startAt === "string" ? row.startAt.trim() : ""
  const endAt = typeof row.endAt === "string" ? row.endAt.trim() : ""
  const joinedCount =
    typeof row.joinedCount === "number" && Number.isFinite(row.joinedCount)
      ? Math.max(0, Math.floor(row.joinedCount))
      : null
  if (
    !id ||
    !title ||
    !isHttpUrl(url) ||
    !isImageSrc(imageUrl) ||
    !host ||
    !isIsoDate(startAt) ||
    !isIsoDate(endAt) ||
    joinedCount === null
  ) {
    return null
  }
  return { id, title, url, imageUrl, host, startAt, endAt, joinedCount }
}

/**
 * Accepts the documented array contract, or `{ jams: UpcomingJam[] }` if Pixel wraps it.
 * Returns null when the payload is not a recognised list (so the hook can fall back).
 */
export function parseUpcomingJamsPayload(payload: unknown): UpcomingJam[] | null {
  const list = Array.isArray(payload)
    ? payload
    : payload &&
        typeof payload === "object" &&
        Array.isArray((payload as { jams?: unknown }).jams)
      ? (payload as { jams: unknown[] }).jams
      : null
  if (!list) return null
  return list.map(parseUpcomingJam).filter((jam): jam is UpcomingJam => jam !== null)
}
