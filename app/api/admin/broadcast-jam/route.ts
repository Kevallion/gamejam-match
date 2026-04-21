import { NextResponse } from "next/server"
import { createAdminClient, getUserEmail } from "@/lib/supabase/admin"
import { sendLaunchJamAnnouncement } from "@/lib/mail"

export const dynamic = "force-dynamic"
export const maxDuration = 300

const PAGE_SIZE = 500
const RESEND_MAX_PER_SECOND = 5
const SEND_WINDOW_MS = 1000
const DEFAULT_MAX_SENDS_PER_RUN = 45

/**
 * Admin-only: broadcast Launch Jam announcement to jammers who have an email.
 *
 * Auth (any one):
 * - Authorization: Bearer <CRON_SECRET>
 * - x-cron-secret: <CRON_SECRET>
 * - x-admin-broadcast-secret: <ADMIN_BROADCAST_SECRET>
 *
 * Fetches all profiles not already marked as sent, resolves email from auth.users
 * via getUserEmail, skips users without email.
 *
 * GET and POST behave the same (Vercel Cron invokes scheduled routes with GET + Bearer CRON_SECRET).
 *
 * Sends in controlled chunks to respect Resend rate limits and avoid duplicate sends.
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

  const supabaseAdmin = createAdminClient()
  let sent = 0
  let attempted = 0
  const maxSendsPerRun = Math.max(
    1,
    Number(process.env.BROADCAST_MAX_SENDS_PER_RUN ?? DEFAULT_MAX_SENDS_PER_RUN),
  )

  while (sent < maxSendsPerRun) {
    const { data: rows, error } = await supabaseAdmin
      .from("profiles")
      .select("id, username")
      .is("launch_jam_announcement_sent_at", null)
      .order("id", { ascending: true })
      .range(0, PAGE_SIZE - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const batch = rows ?? []
    if (batch.length === 0) break

    const recipients = await Promise.all(
      batch.map(async (row) => {
        const userId = row.id as string
        const email = await getUserEmail(userId)
        if (!email) return null

        const displayName =
          typeof row.username === "string" && row.username.trim()
            ? row.username.trim()
            : "Jammer"

        return { userId, email, displayName }
      }),
    )

    const filteredRecipients = recipients.filter(
      (recipient): recipient is { userId: string; email: string; displayName: string } =>
        recipient !== null,
    )

    if (filteredRecipients.length === 0) break

    for (
      let i = 0;
      i < filteredRecipients.length && sent < maxSendsPerRun;
      i += RESEND_MAX_PER_SECOND
    ) {
      const room = maxSendsPerRun - sent
      const chunk = filteredRecipients.slice(i, i + Math.min(RESEND_MAX_PER_SECOND, room))
      attempted += chunk.length

      const outcomes = await Promise.all(
        chunk.map(async ({ userId, email, displayName }) => {
        const ok = await sendLaunchJamAnnouncement(email, displayName)
        if (!ok) return false

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

        return true
        }),
      )

      sent += outcomes.filter(Boolean).length

      if (i + RESEND_MAX_PER_SECOND < filteredRecipients.length && sent < maxSendsPerRun) {
        await sleep(SEND_WINDOW_MS)
      }
    }

    if (batch.length < PAGE_SIZE) break
  }

  const { count: remaining, error: remainingError } = await supabaseAdmin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .is("launch_jam_announcement_sent_at", null)

  if (remainingError) {
    return NextResponse.json({ sent, attempted, maxSendsPerRun })
  }

  return NextResponse.json({
    sent,
    attempted,
    maxSendsPerRun,
    remaining: remaining ?? 0,
  })
}

export async function GET(request: Request) {
  return runBroadcastJam(request)
}

export async function POST(request: Request) {
  return runBroadcastJam(request)
}
