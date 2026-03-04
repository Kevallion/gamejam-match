/**
 * Test script: fetch from https://itch.io/jams.json and insert into external_jams.
 * Run: npx tsx scripts/test-fetch.ts
 * Or with env from .env.local: node --env-file=.env.local --import tsx scripts/test-fetch.ts
 *
 * Loads .env.local from project root if present (plain key=value).
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync, existsSync } from "fs"
import { resolve } from "path"

const ITCH_JAMS_JSON_URL = "https://itch.io/jams.json"

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json, text/html; q=0.9",
  "Accept-Language": "en-US,en;q=0.9",
}

function loadEnvLocal(): void {
  const path = resolve(process.cwd(), ".env.local")
  if (!existsSync(path)) return
  const content = readFileSync(path, "utf-8")
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith("#")) {
      const eq = trimmed.indexOf("=")
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim()
        const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "")
        if (!process.env[key]) process.env[key] = value
      }
    }
  }
}

loadEnvLocal()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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

async function main() {
  console.log("Fetching", ITCH_JAMS_JSON_URL, "...")

  let res: Response
  try {
    res = await fetch(ITCH_JAMS_JSON_URL, { headers: BROWSER_HEADERS })
  } catch (err) {
    console.error("Network / fetch error:")
    console.error(err)
    process.exit(1)
  }

  const bodyText = await res.text()
  const isChallengePage =
    res.status === 403 && (bodyText.includes("Just a moment") || bodyText.includes("Cloudflare"))

  if (!res.ok) {
    console.error("API error (response not OK):")
    console.error("  Status:", res.status, res.statusText)
    console.error("  URL:", ITCH_JAMS_JSON_URL)
    console.error("  Body (first 500 chars):", bodyText.slice(0, 500))
    if (isChallengePage) {
      console.error("")
      console.error(">>> itch.io (or its CDN) is blocking script/server requests (bot protection).")
      console.error(">>> Use the app instead: open /sync-jams in the browser and click « Sync jams from itch.io »")
      console.error(">>> (the HTML-based sync runs from your Next server with browser headers).")
    }
    process.exit(1)
  }

  let data: unknown
  try {
    data = JSON.parse(bodyText)
  } catch (err) {
    console.error("Invalid JSON in response:")
    console.error("  Body (first 500 chars):", bodyText.slice(0, 500))
    console.error(err)
    process.exit(1)
  }

  const rows = normalize(data)
  console.log("Parsed", rows.length, "jams from JSON")

  if (rows.length === 0) {
    console.log("No jams to insert (format may differ). Sample of raw data keys:", data && typeof data === "object" ? Object.keys(data as object).slice(0, 10) : "n/a")
    process.exit(0)
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (check .env.local)")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const { error } = await supabase.from("external_jams").upsert(rows, { onConflict: "itch_id" })

  if (error) {
    console.error("Supabase upsert error:")
    console.error("  Code:", error.code)
    console.error("  Message:", error.message)
    console.error("  Details:", error.details)
    process.exit(1)
  }

  console.log("Inserted/updated", rows.length, "rows in external_jams.")
}

main()
