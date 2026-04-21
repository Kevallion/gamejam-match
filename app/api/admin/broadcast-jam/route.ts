import { NextResponse } from "next/server"
import { createAdminClient, getUserEmail } from "@/lib/supabase/admin"
import { sendLaunchJamAnnouncement } from "@/lib/mail"

export const dynamic = "force-dynamic"
export const maxDuration = 300

const PAGE_SIZE = 500

/**
 * Admin-only: broadcast Launch Jam announcement to jammers who have an email.
 *
 * Auth (any one):
 * - Authorization: Bearer <CRON_SECRET>
 * - x-cron-secret: <CRON_SECRET>
 * - x-admin-broadcast-secret: <ADMIN_BROADCAST_SECRET>
 *
 * Fetches all profiles, resolves email from auth.users via getUserEmail,
 * skips users without email.
 *
 * GET and POST behave the same (Vercel Cron invokes scheduled routes with GET + Bearer CRON_SECRET).
 *
 * Sends within each page run in parallel (Promise.all) to fit tight serverless timeouts (e.g. Hobby 10s).
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
  let from = 0

  while (true) {
    const { data: rows, error } = await supabaseAdmin
      .from("profiles")
      .select("id, username")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const batch = rows ?? []
    if (batch.length === 0) break

    const outcomes = await Promise.all(
      batch.map(async (row) => {
        const userId = row.id as string
        const email = await getUserEmail(userId)
        if (!email) return false

        const displayName =
          typeof row.username === "string" && row.username.trim()
            ? row.username.trim()
            : "Jammer"

        return sendLaunchJamAnnouncement(email, displayName)
      }),
    )
    sent += outcomes.filter(Boolean).length

    if (batch.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return NextResponse.json({ sent })
}

export async function GET(request: Request) {
  return runBroadcastJam(request)
}

export async function POST(request: Request) {
  return runBroadcastJam(request)
}
