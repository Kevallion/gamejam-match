import * as cheerio from "cheerio"

export type ItchJamPageMetadata = {
  title: string | null
  image: string | null
  startsAt: string | null
  endsAt: string | null
}

/**
 * Parse an itch.io jam HTML page: OG title/image + JSON-LD / data-* for event dates.
 */
export function extractItchJamMetadataFromHtml(html: string): ItchJamPageMetadata {
  const $ = cheerio.load(html)
  let title: string | null = null
  let image: string | null = null
  let startsAt: string | null = null
  let endsAt: string | null = null

  $('meta[property="og:title"]').each((_, el) => {
    const c = $(el).attr("content")
    if (c && !title) title = c.trim()
  })
  $('meta[property="og:image"]').each((_, el) => {
    const c = $(el).attr("content")
    if (c && !image) image = c.trim()
  })

  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).html()
    if (!text) return
    try {
      const data = JSON.parse(text) as unknown
      const arr = Array.isArray(data) ? data : [data]
      for (const item of arr) {
        if (item && typeof item === "object") {
          const obj = item as Record<string, unknown>
          const tryStart = (v: unknown) => {
            if (startsAt || typeof v !== "string") return
            const d = new Date(v)
            if (!Number.isNaN(d.getTime())) startsAt = d.toISOString()
          }
          const tryEnd = (v: unknown) => {
            if (endsAt || typeof v !== "string") return
            const d = new Date(v)
            if (!Number.isNaN(d.getTime())) endsAt = d.toISOString()
          }
          tryStart(obj.startDate)
          tryEnd(obj.endDate)
          if (obj["@type"] === "Event") {
            tryStart(obj.startDate)
            tryEnd(obj.endDate)
          }
        }
      }
    } catch {
      // ignore
    }
  })

  $("[data-start_time]").each((_, el) => {
    const v = $(el).attr("data-start_time")
    if (v && !startsAt) {
      const d = new Date(v)
      if (!Number.isNaN(d.getTime())) startsAt = d.toISOString()
    }
  })
  $("[data-end_time]").each((_, el) => {
    const v = $(el).attr("data-end_time")
    if (v && !endsAt) {
      const d = new Date(v)
      if (!Number.isNaN(d.getTime())) endsAt = d.toISOString()
    }
  })

  return { title, image, startsAt, endsAt }
}
