/**
 * Temporary API route to test fetch from itch.io/jams.json and insert into external_jams.
 * GET /api/test-fetch-jams
 * Returns { success, count?, error?, details? } with precise error info on failure.
 */

import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const ITCH_JAMS_JSON_URL = "https://itch.io/jams.json"

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json, text/html; q=0.9",
  "Accept-Language": "en-US,en;q=0.9",
}

type JamRow = {
  itch_id: number
  title: string | null
  url: string | null
  thumbnail_url: string | null
  ends_at: string | null
}

type ItchJamRaw = {
  id?: number
  title?: string
  name?: string
  url?: string
  thumbnail_url?: string
  cover_url?: string
  end_date?: string
  ends_at?: string
  updated_at?: string
}

function parseEndsAt(raw: ItchJamRaw): string | null {
  const dateStr = raw.ends_at ?? raw.end_date ?? raw.updated_at
  if (!dateStr) return null
  const date = new Date(dateStr)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function normalize(data: unknown): JamRow[] {
  const jams: ItchJamRaw[] = Array.isArray(data)
    ? data
    : Array.isArray((data as { jams?: ItchJamRaw[] })?.jams)
      ? (data as { jams: ItchJamRaw[] }).jams
      : []
  return jams
    .filter((j) => j != null && (j.id != null || (j as { itch_id?: number }).itch_id != null))
    .map((j) => {
      const itchId = typeof j.id === "number" ? j.id : (j as { itch_id?: number }).itch_id ?? 0
      return {
        itch_id: itchId,
        title: (j.title ?? j.name ?? "") || null,
        url: (j.url ?? "") || null,
        thumbnail_url: (j.thumbnail_url ?? j.cover_url ?? "") || null,
        ends_at: parseEndsAt(j),
      }
    })
    .filter((row) => row.itch_id > 0)
}

export async function GET() {
  const details: Record<string, unknown> = { url: ITCH_JAMS_JSON_URL }

  let res: Response
  try {
    res = await fetch(ITCH_JAMS_JSON_URL, { headers: BROWSER_HEADERS })
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Fetch failed",
        details: { ...details, stack: err instanceof Error ? err.stack : undefined },
      },
      { status: 500 }
    )
  }

  const bodyText = await res.text()
  details.status = res.status
  details.statusText = res.statusText
  details.bodyPreview = bodyText.slice(0, 400)

  const isChallengePage =
    res.status === 403 &&
    (bodyText.includes("Just a moment") || bodyText.includes("Cloudflare"))

  if (!res.ok) {
    return NextResponse.json(
      {
        success: false,
        error: `itch.io returned ${res.status} ${res.statusText}`,
        hint: isChallengePage
          ? "itch.io blocks script/server requests (bot protection). Use /sync-jams in the app to sync via HTML instead."
          : undefined,
        details,
      },
      { status: 502 }
    )
  }

  let data: unknown
  try {
    data = JSON.parse(bodyText)
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Invalid JSON",
        details: { ...details, parseError: String(err) },
      },
      { status: 502 }
    )
  }

  const rows = normalize(data)
  details.parsedCount = rows.length
  if (rows.length === 0) {
    details.rawKeys = data && typeof data === "object" ? Object.keys(data as object) : null
    return NextResponse.json({
      success: true,
      count: 0,
      message: "No jams parsed (format may differ); check details.rawKeys",
      details,
    })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
        details,
      },
      { status: 500 }
    )
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const { error } = await supabase.from("external_jams").upsert(rows, { onConflict: "itch_id" })

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: {
          ...details,
          supabaseCode: error.code,
          supabaseDetails: error.details,
        },
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, count: rows.length, details })
}
