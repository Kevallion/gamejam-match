import { NextResponse } from "next/server"
import { createAdminClient, getUserEmail } from "@/lib/supabase/admin"
import { sendLaunchJamAnnouncement } from "@/lib/mail"

export const dynamic = "force-dynamic"
export const maxDuration = 300

const PAGE_SIZE = 40
const SEND_DELAY_MS = 200

/**
 * Admin-only: broadcast Launch Jam announcement to jammers who have an email.
 *
 * Auth (any one):
 * - Authorization: Bearer <CRON_SECRET>
 * - x-cron-secret: <CRON_SECRET>
 * - x-admin-broadcast-secret: <ADMIN_BROADCAST_SECRET>
 *
 * Fetches one fixed page of profiles (40 per page), resolves email from auth.users,
 * skips users without email and users already marked as sent.
 *
 * GET and POST behave the same (Vercel Cron invokes scheduled routes with GET + Bearer CRON_SECRET).
 *
 * Sends sequentially with 200ms delay to stay under Resend rate limits.
 */
function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim()
  const adminSecret = process.env.ADMIN_BROADCAST_SECRET?.trim()

  const rawAuth = request.headers.get("authorization")?.trim()
  if (cronSecret && rawAuth) {
    const m = rawAuth.match(/^Bearer\s+(.+)$/i)
    if (m?.[1]?.trim() === cronSecret) return true
  }

  const cronHeader = request.headers.get("x-cron-secret")?.trim()
  if (cronSecret && cronHeader === cronSecret) return true

  const headerVal = request.headers.get("x-admin-broadcast-secret")?.trim()
  if (adminSecret && headerVal === adminSecret) return true

  return false
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runBroadcastJam(request: Request): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET?.trim()
  const adminSecret = process.env.ADMIN_BROADCAST_SECRET?.trim()
  if (!cronSecret && !adminSecret) {
    return NextResponse.json(
      {
        error:
          "CRON_SECRET or ADMIN_BROADCAST_SECRET must be configured for admin routes.",
      },
      { status: 500 },
    )
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const rawPage = Number(url.searchParams.get("page") ?? "1")
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
  const start = (page - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE - 1

  const supabaseAdmin = createAdminClient()
  let sent = 0
  let attempted = 0
  let alreadySent = 0
  let missingEmail = 0

  const { data: rows, error } = await supabaseAdmin
    .from("profiles")
    .select("id, username, launch_jam_announcement_sent_at")
    .order("id", { ascending: true })
    .range(start, end)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const batch = rows ?? []
  for (let i = 0; i < batch.length; i += 1) {
    const row = batch[i] as {
      id: string
      username?: string | null
      launch_jam_announcement_sent_at?: string | null
    }

    if (row.launch_jam_announcement_sent_at) {
      alreadySent += 1
      continue
    }

    attempted += 1
    const userId = row.id
    const email = await getUserEmail(userId)
    if (!email) {
      missingEmail += 1
      continue
    }

    const displayName =
      typeof row.username === "string" && row.username.trim()
        ? row.username.trim()
        : "Jammer"

    const ok = await sendLaunchJamAnnouncement(email, displayName)
    if (ok) {
      sent += 1
      const { error: markError } = await supabaseAdmin
        .from("profiles")
        .update({
          launch_jam_announcement_sent_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .is("launch_jam_announcement_sent_at", null)

      if (markError) {
        console.error("[broadcast-jam] Failed to mark profile as sent:", {
          userId,
          error: markError.message,
        })
      }
    }

    if (i < batch.length - 1) {
      await sleep(SEND_DELAY_MS)
    }
  }

  return NextResponse.json({
    page,
    range: { start, end },
    pageSize: PAGE_SIZE,
    totalInPage: batch.length,
    attempted,
    sent,
    alreadySent,
    missingEmail,
  })
}

export async function GET(request: Request) {
  return runBroadcastJam(request)
}

export async function POST(request: Request) {
  return runBroadcastJam(request)
}
