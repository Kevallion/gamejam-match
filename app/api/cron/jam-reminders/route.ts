import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"
export const maxDuration = 60

function toIsoDate(value: string): string {
  const d = new Date(value)
  if (!Number.isFinite(d.getTime())) return value
  return d.toISOString().slice(0, 10)
}

/**
 * Daily cron: create in-app notifications for jams starting in ~7 days.
 * Auth header required: Authorization: Bearer <CRON_SECRET>
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
  const now = new Date()
  const windowStart = new Date(now.getTime() + 7 * 86400000).toISOString()
  const windowEnd = new Date(now.getTime() + 8 * 86400000).toISOString()

  const { data: jams, error: jamsError } = await admin
    .from("external_jams")
    .select("id, title, starts_at")
    .not("starts_at", "is", null)
    .gte("starts_at", windowStart)
    .lt("starts_at", windowEnd)
    .order("starts_at", { ascending: true })

  if (jamsError) {
    return NextResponse.json({ error: jamsError.message }, { status: 500 })
  }
  if (!jams || jams.length === 0) {
    return NextResponse.json({ ok: true, jams: 0, inserted: 0 })
  }

  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id")
    .eq("has_completed_onboarding", true)

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 })
  }

  const users = (profiles ?? []).map((profile) => profile.id).filter(Boolean)
  if (users.length === 0) {
    return NextResponse.json({ ok: true, jams: jams.length, inserted: 0 })
  }

  const notifications = []
  for (const jam of jams) {
    const jamTitle = (jam.title ?? "a new jam").trim() || "a new jam"
    const startsAt = jam.starts_at as string
    const message = `${jamTitle} starts in 7 days (${toIsoDate(startsAt)}).`
    for (const userId of users) {
      notifications.push({
        user_id: userId,
        type: "jam_reminder",
        message,
        link: "/teams",
      })
    }
  }

  const { error: insertError } = await admin.from("notifications").insert(notifications)
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    jams: jams.length,
    users: users.length,
    inserted: notifications.length,
  })
}
