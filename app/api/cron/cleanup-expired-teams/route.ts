import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { notifyOwnerJamListingArchived } from "@/app/actions/team-actions"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Daily job: delete teams past `jam_end_date`, e-mail owner first.
 * Configure Vercel Cron (or similar) to GET this route with header:
 *   Authorization: Bearer <CRON_SECRET>
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

  const admin = createAdminClient()
  const now = new Date().toISOString()

  const { data: rows, error } = await admin
    .from("teams")
    .select("id, user_id, team_name")
    .lt("jam_end_date", now)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let deleted = 0
  for (const row of rows ?? []) {
    const id = row.id as string
    const ownerId = row.user_id as string
    const name = String((row as { team_name?: string | null }).team_name ?? "Your team")

    await notifyOwnerJamListingArchived(ownerId, name)

    const { error: delErr } = await admin.from("teams").delete().eq("id", id)
    if (!delErr) deleted += 1
  }

  return NextResponse.json({
    ok: true,
    candidates: (rows ?? []).length,
    deleted,
  })
}
