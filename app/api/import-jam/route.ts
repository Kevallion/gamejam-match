/**
 * Import a jam from an Itch.io URL: fetch HTML, extract OG + JSON-LD dates, upsert into external_jams.
 * POST /api/import-jam
 * Body: { url: string }
 * Security: only URLs from itch.io (or www.itch.io) are accepted.
 */

import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { extractItchJamMetadataFromHtml } from "@/lib/itch-jam-html-metadata"

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
}

const ALLOWED_HOSTS = ["itch.io", "www.itch.io"]

function isAllowedItchUrl(url: string): { ok: true; slug: string; canonical: string } | { ok: false; error: string } {
  let parsed: URL
  try {
    parsed = new URL(url.startsWith("http") ? url : `https://${url}`)
  } catch {
    return { ok: false, error: "Invalid URL" }
  }
  const host = parsed.hostname.toLowerCase()
  if (!ALLOWED_HOSTS.includes(host)) {
    return { ok: false, error: "Only Itch.io URLs are allowed (itch.io or www.itch.io)" }
  }
  const match = parsed.pathname.match(/^\/jam\/([a-z0-9_.-]+)\/?$/i)
  if (!match) {
    return { ok: false, error: "URL must be an Itch.io jam page, e.g. https://itch.io/jam/ludum-dare-55" }
  }
  const slug = match[1].toLowerCase().replace(/_/g, "-")
  return { ok: true, slug, canonical: `https://itch.io/jam/${slug}` }
}

function hashSlug(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) {
    h = ((h << 5) - h + slug.charCodeAt(i)) | 0
  }
  const n = Math.abs(h)
  return n > 0 ? n : 1
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

  const rawInput = typeof body?.url === "string" ? body.url.trim() : ""
  if (!rawInput) {
    return NextResponse.json(
      { success: false, error: "Missing or empty url." },
      { status: 400 }
    )
  }

  const allowed = isAllowedItchUrl(rawInput)
  if (!allowed.ok) {
    return NextResponse.json({ success: false, error: allowed.error }, { status: 400 })
  }

  const { slug, canonical } = allowed

  let html: string
  try {
    const res = await fetch(canonical, { headers: BROWSER_HEADERS })
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Itch.io returned ${res.status} ${res.statusText}` },
        { status: 502 }
      )
    }
    html = await res.text()
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to fetch page" },
      { status: 502 }
    )
  }

  const meta = extractItchJamMetadataFromHtml(html)
  const itchId = hashSlug(slug)
  const fallbackTitle = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  const row = {
    itch_id: itchId,
    title: meta.title || fallbackTitle,
    url: canonical,
    thumbnail_url: meta.image || null,
    starts_at: meta.startsAt,
    ends_at: meta.endsAt,
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
    .select("id, itch_id, title, url, thumbnail_url, starts_at, ends_at")
    .single()

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
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
      starts_at: string | null
      ends_at: string | null
    },
  })
}
