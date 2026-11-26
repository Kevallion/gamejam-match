import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { toPublicContract, type ParsedUpcomingJam } from "@/lib/upcoming-jams"

export const dynamic = "force-dynamic"

const CACHE_CONTROL = "public, s-maxage=300, stale-while-revalidate=86400"

type UpcomingJamTableRow = {
  itch_id: number
  title: string
  url: string
  image_url: string | null
  host: string | null
  start_at: string
  end_at: string
  joined_count: number
}

/**
 * Public top 10 of jams that have not ended, sorted by joined_count desc.
 * Reads public.upcoming_jams only; does not fetch the listing.
 */
export async function GET() {
  const headers = { "Cache-Control": CACHE_CONTROL }

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("upcoming_jams")
      .select("itch_id, title, url, image_url, host, start_at, end_at, joined_count")
      .gt("end_at", new Date().toISOString())
      .order("joined_count", { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers })
    }

    const jams: ParsedUpcomingJam[] = (data as UpcomingJamTableRow[] | null ?? []).map((row) => ({
      itchId: row.itch_id,
      title: row.title,
      url: row.url,
      imageUrl: row.image_url,
      host: row.host,
      startAt: row.start_at,
      endAt: row.end_at,
      joinedCount: row.joined_count,
    }))

    return NextResponse.json(toPublicContract(jams), { headers })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to read upcoming jams" },
      { status: 500, headers },
    )
  }
}
