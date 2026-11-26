/**
 * Shared upcoming-jams contract for the home carousel (CAR-2) and the
 * itch.io listing backend (CAR-1). The public JSON is an array of:
 * {id, title, url, imageUrl, host, startAt, endAt, joinedCount}
 *
 * id is the itch.io jam id as a string. imageUrl and host are null when
 * the single listing page does not include them (most non-featured jams).
 */

export const UPCOMING_JAMS_API_PATH = "/api/jams/upcoming"

export type UpcomingJam = {
  id: string
  title: string
  url: string
  imageUrl: string | null
  host: string | null
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

function isIsoDate(value: string): boolean {
  return Number.isFinite(Date.parse(value))
}

function asOptionalText(value: unknown): string | null {
  if (value == null) return null
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function parseUpcomingJam(value: unknown): UpcomingJam | null {
  if (!value || typeof value !== "object") return null
  const row = value as Record<string, unknown>
  const id =
    typeof row.id === "string"
      ? row.id.trim()
      : typeof row.id === "number" && Number.isInteger(row.id) && row.id > 0
        ? String(row.id)
        : ""
  const title = typeof row.title === "string" ? row.title.trim() : ""
  const url = typeof row.url === "string" ? row.url.trim() : ""
  const imageUrl = asOptionalText(row.imageUrl)
  const host = asOptionalText(row.host)
  const startAt = typeof row.startAt === "string" ? row.startAt.trim() : ""
  const endAt = typeof row.endAt === "string" ? row.endAt.trim() : ""
  const joinedCount =
    typeof row.joinedCount === "number" && Number.isFinite(row.joinedCount)
      ? Math.max(0, Math.floor(row.joinedCount))
      : null
  if (!id || !title || !isHttpUrl(url) || !isIsoDate(startAt) || !isIsoDate(endAt) || joinedCount === null) {
    return null
  }
  return { id, title, url, imageUrl, host, startAt, endAt, joinedCount }
}

/**
 * Accepts the documented array contract, or `{ jams: UpcomingJam[] }` if the
 * API wraps it. Returns null when the payload is not a recognised list
 * (so the hook can fall back).
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

export const ITCH_JAMS_LISTING_URL = "https://itch.io/jams"
export const ITCH_JAMS_USER_AGENT = "GameJamCrew/1.0 (+https://gamejamcrew.com)"

const CALENDAR_MARKER = "R.Jam.FilteredJamCalendar("
const CALENDAR_END = "), document.getElementById"
const ITCH_ORIGIN = "https://itch.io"

export type ParsedUpcomingJam = {
  itchId: number
  title: string
  url: string
  imageUrl: string | null
  host: string | null
  startAt: string
  endAt: string
  joinedCount: number
}

export type UpcomingJamPublic = UpcomingJam

export type ParseListingResult =
  | { ok: true; jams: ParsedUpcomingJam[] }
  | { ok: false; error: string }

export type UpcomingJamRow = {
  itch_id: number
  title: string
  url: string
  image_url: string | null
  host: string | null
  start_at: string
  end_at: string
  joined_count: number
  fetched_at: string
}

export type UpcomingJamsWriter = {
  upsert: (rows: UpcomingJamRow[]) => Promise<void>
  deleteEnded: (nowIso: string) => Promise<number>
}

export type PersistResult =
  | { wrote: false; reason: "empty" | "failed" }
  | { wrote: true; upserted: number; purged: number }

/** Treat naive "YYYY-MM-DD HH:MM:SS" values from the listing as UTC. */
export function parseItchListingDate(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/,
  )
  if (!match) {
    const fallback = new Date(trimmed)
    return Number.isNaN(fallback.getTime()) ? null : fallback.toISOString()
  }
  const tz = match[7] ?? "Z"
  const iso = `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}${tz}`
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export function canonicalizeItchUrl(url: unknown): string | null {
  if (typeof url !== "string") return null
  const trimmed = url.trim()
  if (!trimmed) return null
  try {
    const parsed = trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? new URL(trimmed)
      : new URL(trimmed, ITCH_ORIGIN)
    if (parsed.hostname !== "itch.io" && parsed.hostname !== "www.itch.io") {
      return null
    }
    parsed.hash = ""
    parsed.search = ""
    parsed.hostname = "itch.io"
    parsed.protocol = "https:"
    const href = parsed.toString()
    return href.endsWith("/") ? href.slice(0, -1) : href
  } catch {
    return null
  }
}

function toItchId(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isInteger(n) || n <= 0) return null
  return n
}

function toJoinedCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(String(value ?? "").replace(/,/g, ""))
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.floor(n)
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
}

function stripTags(value: string): string {
  return decodeEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
}

function extractFeaturedExtras(html: string): Map<string, { imageUrl: string | null; host: string | null }> {
  const extras = new Map<string, { imageUrl: string | null; host: string | null }>()
  const featuredEnd = (() => {
    const browse = html.indexOf("Browse Jams")
    const calendar = html.indexOf("Jam Calendar")
    const script = html.indexOf(CALENDAR_MARKER)
    const cuts = [browse, calendar, script].filter((i) => i >= 0)
    return cuts.length > 0 ? Math.min(...cuts) : html.length
  })()
  const featuredHtml = html.slice(0, featuredEnd)
  const blocks = featuredHtml.split(/<div class="jam">/i).slice(1)
  for (const block of blocks) {
    const href = block.match(/href="(\/jam\/[^"]+)"/i)?.[1]
    const url = canonicalizeItchUrl(href)
    if (!url) continue
    const image = block.match(/<img\b[^>]*\bsrc="([^"]+)"/i)?.[1] ?? null
    const hosted = block.match(/Hosted by([\s\S]*?)<\/div>/i)?.[1] ?? ""
    const hostNames = [...hosted.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)]
      .map((match) => stripTags(match[1]))
      .filter(Boolean)
    const host = hostNames.length > 0 ? hostNames.join(", ") : stripTags(hosted).replace(/\s*,\s*/g, ", ") || null
    extras.set(url, { imageUrl: image, host })
  }
  return extras
}

function extractCalendarPayload(html: string): { ok: true; data: unknown } | { ok: false; error: string } {
  const start = html.indexOf(CALENDAR_MARKER)
  if (start === -1) {
    return { ok: false, error: "FilteredJamCalendar payload not found" }
  }
  const jsonStart = start + CALENDAR_MARKER.length
  const end = html.indexOf(CALENDAR_END, jsonStart)
  if (end === -1) {
    return { ok: false, error: "FilteredJamCalendar payload is truncated" }
  }
  const raw = html.slice(jsonStart, end)
  try {
    return { ok: true, data: JSON.parse(raw) }
  } catch {
    return { ok: false, error: "FilteredJamCalendar JSON could not be parsed" }
  }
}

/**
 * Parse the public https://itch.io/jams HTML page.
 * Calendar JSON supplies id, title, url, dates and joined counts.
 * Featured cards on the same page supply image and host when present.
 */
export function parseItchJamsListing(html: string): ParseListingResult {
  if (typeof html !== "string" || html.trim().length === 0) {
    return { ok: false, error: "Empty listing HTML" }
  }
  const payload = extractCalendarPayload(html)
  if (!payload.ok) return payload
  const rawJams = (payload.data as { jams?: unknown })?.jams
  if (!Array.isArray(rawJams)) {
    return { ok: false, error: "FilteredJamCalendar is missing a jams array" }
  }

  const extras = extractFeaturedExtras(html)
  const jams: ParsedUpcomingJam[] = []
  const seen = new Set<number>()

  for (const item of rawJams) {
    if (!item || typeof item !== "object") continue
    const raw = item as Record<string, unknown>
    const itchId = toItchId(raw.id)
    const title = typeof raw.title === "string" ? decodeEntities(raw.title).trim() : ""
    const url = canonicalizeItchUrl(raw.url)
    const startAt = parseItchListingDate(raw.start_date)
    const endAt = parseItchListingDate(raw.end_date)
    if (!itchId || !title || !url || !startAt || !endAt) continue
    if (seen.has(itchId)) continue
    seen.add(itchId)
    const extra = extras.get(url)
    jams.push({
      itchId,
      title,
      url,
      imageUrl: extra?.imageUrl ?? null,
      host: extra?.host ?? null,
      startAt,
      endAt,
      joinedCount: toJoinedCount(raw.joined),
    })
  }

  return { ok: true, jams }
}

export function filterAndSortUpcoming(
  jams: ParsedUpcomingJam[],
  now: Date = new Date(),
  limit = 10,
): ParsedUpcomingJam[] {
  const nowMs = now.getTime()
  return jams
    .filter((jam) => {
      const endMs = Date.parse(jam.endAt)
      return Number.isFinite(endMs) && endMs > nowMs
    })
    .sort((a, b) => {
      if (b.joinedCount !== a.joinedCount) return b.joinedCount - a.joinedCount
      return a.startAt.localeCompare(b.startAt)
    })
    .slice(0, Math.max(0, limit))
}

export function toPublicContract(jams: ParsedUpcomingJam[]): UpcomingJamPublic[] {
  return jams.map((jam) => ({
    id: String(jam.itchId),
    title: jam.title,
    url: jam.url,
    imageUrl: jam.imageUrl,
    host: jam.host,
    startAt: jam.startAt,
    endAt: jam.endAt,
    joinedCount: jam.joinedCount,
  }))
}

export function toUpcomingJamRows(
  jams: ParsedUpcomingJam[],
  fetchedAt: Date = new Date(),
): UpcomingJamRow[] {
  const fetched_at = fetchedAt.toISOString()
  return jams.map((jam) => ({
    itch_id: jam.itchId,
    title: jam.title,
    url: jam.url,
    image_url: jam.imageUrl,
    host: jam.host,
    start_at: jam.startAt,
    end_at: jam.endAt,
    joined_count: jam.joinedCount,
    fetched_at,
  }))
}

/**
 * Upsert parsed jams and purge those already ended.
 * On empty or failed input, writes nothing and deletes nothing.
 */
export async function persistUpcomingJams(
  writer: UpcomingJamsWriter,
  parsed: ParseListingResult | { ok: true; jams: ParsedUpcomingJam[] },
  now: Date = new Date(),
): Promise<PersistResult> {
  if (!parsed.ok) return { wrote: false, reason: "failed" }
  if (parsed.jams.length === 0) return { wrote: false, reason: "empty" }

  const rows = toUpcomingJamRows(parsed.jams, now)
  await writer.upsert(rows)
  const purged = await writer.deleteEnded(now.toISOString())
  return { wrote: true, upserted: rows.length, purged }
}

export async function fetchItchJamsListingHtml(
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: true; html: string } | { ok: false; error: string; status?: number }> {
  let res: Response
  try {
    res = await fetchImpl(ITCH_JAMS_LISTING_URL, {
      headers: {
        "User-Agent": ITCH_JAMS_USER_AGENT,
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
      cache: "no-store",
    })
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Fetch failed" }
  }
  if (!res.ok) {
    return { ok: false, error: `itch.io returned ${res.status}`, status: res.status }
  }
  const html = await res.text()
  if (!html.trim()) {
    return { ok: false, error: "itch.io returned an empty body" }
  }
  return { ok: true, html }
}
