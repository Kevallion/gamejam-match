/**
 * Import a single jam by itch.io URL: fetch HTML, extract Open Graph title/image, upsert into external_jams.
 * POST /api/jams/import-by-url
 * Body: { url: string } e.g. { "url": "https://itch.io/jam/ludum-dare-55" }
 */

import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
}

const ITCH_JAM_URL_REGEX = /^https?:\/\/(?:www\.)?itch\.io\/jam\/([a-z0-9_-]+)\/?/i

function hashSlug(slug: string): number {
  const normalized = slug.toLowerCase().replace(/_/g, "-")
  let h = 0
  for (let i = 0; i < normalized.length; i++) {
    h = ((h << 5) - h + normalized.charCodeAt(i)) | 0
  }
  const n = Math.abs(h)
  return n > 0 ? n : 1
}

function extractOgFromHtml(html: string): { title: string | null; image: string | null } {
  let title: string | null = null
  let image: string | null = null
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
  if (ogTitleMatch) title = ogTitleMatch[1].trim()
  const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
  if (ogImageMatch) image = ogImageMatch[1].trim()
  if (!title) {
    const contentFirst = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)
    if (contentFirst) title = contentFirst[1].trim()
  }
  if (!image) {
    const contentFirst = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    if (contentFirst) image = contentFirst[1].trim()
  }
  return { title, image }
}

export async function POST(request: Request) {
  let body: { url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body. Send { \"url\": \"https://itch.io/jam/...\" }" },
      { status: 400 }
    )
  }

  const rawUrl = typeof body?.url === "string" ? body.url.trim() : ""
  if (!rawUrl) {
    return NextResponse.json(
      { success: false, error: "Missing or empty url. Send { \"url\": \"https://itch.io/jam/...\" }" },
      { status: 400 }
    )
  }

  const match = rawUrl.match(ITCH_JAM_URL_REGEX)
  if (!match) {
    return NextResponse.json(
      { success: false, error: "URL must be an itch.io jam page, e.g. https://itch.io/jam/ludum-dare-55" },
      { status: 400 }
    )
  }

  const slug = match[1].toLowerCase().replace(/_/g, "-")
  const canonicalUrl = `https://itch.io/jam/${slug}`

  let html: string
  try {
    const res = await fetch(canonicalUrl, { headers: BROWSER_HEADERS })
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `itch.io returned ${res.status} ${res.statusText}`,
          details: { url: canonicalUrl },
        },
        { status: 502 }
      )
    }
    html = await res.text()
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch URL",
      },
      { status: 502 }
    )
  }

  const { title, image } = extractOgFromHtml(html)
  const itchId = hashSlug(slug)
  const row = {
    itch_id: itchId,
    title: title || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    url: canonicalUrl,
    thumbnail_url: image || null,
    ends_at: null as string | null,
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { success: false, error: "Server misconfiguration: missing Supabase env" },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const { data: inserted, error } = await supabase
    .from("external_jams")
    .upsert(row, { onConflict: "itch_id" })
    .select("id, itch_id, title, url, thumbnail_url, ends_at")
    .single()

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message, details: { code: error.code } },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    jam: inserted as {
      id: string
      itch_id: number
      title: string | null
      url: string | null
      thumbnail_url: string | null
      ends_at: string | null
    },
  })
}
