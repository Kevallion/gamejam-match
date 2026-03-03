"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const ITCH_JAMS_JSON_URL = "https://itch.io/jams.json"
const ITCH_JAMS_HTML_URL = "https://itch.io/jams"

/** Format attendu d’un jam dans la réponse itch.io (flexible selon les champs renvoyés) */
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

type JamRow = {
  itch_id: number
  title: string | null
  url: string | null
  thumbnail_url: string | null
  ends_at: string | null
}

function normalizeItchJamsFromJson(data: unknown): JamRow[] {
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

function hashSlug(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) {
    h = ((h << 5) - h + slug.charCodeAt(i)) | 0
  }
  const n = Math.abs(h)
  return n > 0 ? n : 1
}

function humanizeSlug(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function parseJamsFromHtml(html: string): JamRow[] {
  // Match href="/jam/slug" or href="https://itch.io/jam/slug" (and single-quote variants)
  const slugRegex = /href=["'](?:https:\/\/itch\.io)?\/jam\/([a-z0-9_-]+)["']/gi
  const seen = new Set<string>()
  const rows: JamRow[] = []
  let m: RegExpExecArray | null
  while ((m = slugRegex.exec(html)) !== null) {
    const slug = m[1].toLowerCase().replace(/_/g, "-")
    if (slug.length < 2 || seen.has(slug)) continue
    seen.add(slug)
    rows.push({
      itch_id: hashSlug(slug),
      title: humanizeSlug(slug),
      url: `https://itch.io/jam/${slug}`,
      thumbnail_url: null,
      ends_at: null,
    })
  }
  return rows
}

/**
 * Fetches jams from itch.io: tries jams.json first, then parses the HTML jams page.
 * Upserts into external_jams (admin client for RLS bypass).
 */
export async function syncItchJams(): Promise<{
  success: boolean
  error?: string
  count?: number
}> {
  try {
    const jsonRes = await fetch(ITCH_JAMS_JSON_URL, { next: { revalidate: 300 } })
    if (jsonRes.ok) {
      const data = await jsonRes.json().catch(() => null)
      if (data != null) {
        const rows = normalizeItchJamsFromJson(data)
        if (rows.length > 0) {
          const admin = createAdminClient()
          const { error } = await admin
            .from("external_jams")
            .upsert(rows, { onConflict: "itch_id" })
          if (error) return { success: false, error: error.message }
          return { success: true, count: rows.length }
        }
      }
    }

    const htmlRes = await fetch(ITCH_JAMS_HTML_URL, {
      next: { revalidate: 300 },
      headers: { "User-Agent": "GameJamCrew/1.0 (itch.io jams sync)" },
    })
    if (!htmlRes.ok) {
      return { success: false, error: `itch.io returned ${htmlRes.status}` }
    }
    const html = await htmlRes.text()
    const rows = parseJamsFromHtml(html)
    if (rows.length === 0) {
      return { success: true, count: 0 }
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from("external_jams")
      .upsert(rows, { onConflict: "itch_id" })

    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true, count: rows.length }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return { success: false, error: message }
  }
}

/** Type pour un jam externe renvoyé au client */
export type ExternalJam = {
  id: string
  itch_id: number
  title: string | null
  url: string | null
  thumbnail_url: string | null
  ends_at: string | null
}

/**
 * Liste les jams externes (optionnellement filtrées par date de fin).
 * Utilise le client serveur (lecture autorisée par RLS).
 */
export async function getExternalJams(options?: {
  activeOnly?: boolean
}): Promise<{ data: ExternalJam[]; error?: string }> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from("external_jams")
      .select("id, itch_id, title, url, thumbnail_url, ends_at")
      .order("ends_at", { ascending: false, nullsFirst: false })

    if (options?.activeOnly) {
      query = query.or("ends_at.is.null,ends_at.gte." + new Date().toISOString())
    }

    const { data, error } = await query
    if (error) {
      return { data: [], error: error.message }
    }
    return { data: (data ?? []) as ExternalJam[] }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return { data: [], error: message }
  }
}
