import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  fetchItchJamsListingHtml,
  parseItchJamsListing,
  persistUpcomingJams,
  type UpcomingJamRow,
  type UpcomingJamsWriter,
} from "@/lib/upcoming-jams"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Hourly job: refresh public.upcoming_jams from a single itch.io/jams request.
 * Auth header required: Authorization: Bearer <CRON_SECRET>
 *
 * Vercel Cron runs on production only. On Preview, call this route once
 * manually with the same header after CRON_SECRET is set.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 500 })
  }

  const auth = request.headers.get("authorization")
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const fetched = await fetchItchJamsListingHtml()
  if (!fetched.ok) {
    return NextResponse.json(
      { ok: false, wrote: false, reason: "fetch_failed", error: fetched.error },
      { status: 502 },
    )
  }

  const parsed = parseItchJamsListing(fetched.html)
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, wrote: false, reason: "parse_failed", error: parsed.error },
      { status: 502 },
    )
  }
  if (parsed.jams.length === 0) {
    return NextResponse.json({
      ok: true,
      wrote: false,
      reason: "empty",
      message: "No jams parsed; existing rows left unchanged.",
    })
  }

  const admin = createAdminClient()
  const writer: UpcomingJamsWriter = {
    async upsert(rows: UpcomingJamRow[]) {
      const { error } = await admin
        .from("upcoming_jams")
        .upsert(rows, { onConflict: "itch_id" })
      if (error) throw new Error(error.message)
    },
    async deleteEnded(nowIso: string) {
      const { data, error } = await admin
        .from("upcoming_jams")
        .delete()
        .lte("end_at", nowIso)
        .select("itch_id")
      if (error) throw new Error(error.message)
      return (data ?? []).length
    },
  }

  try {
    const result = await persistUpcomingJams(writer, parsed)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        wrote: false,
        reason: "persist_failed",
        error: err instanceof Error ? err.message : "Persist failed",
      },
      { status: 500 },
    )
  }
}
