import { grantBadgesOnce } from "@/lib/gamification"
import {
  extractBuyMeACoffeeSupportEmail,
  findAuthUserIdByEmail,
  isBuyMeACoffeeRefundEvent,
  verifyBuyMeACoffeeSignature,
} from "@/lib/buymeacoffee-webhook"

export const runtime = "nodejs"

const SUPPORT_BADGES = ["supporter", "golden_heart"] as const

/**
 * Buy Me a Coffee → https://your-domain/api/webhooks/buymeacoffee
 * Set secret in dashboard; add env BUYMEACOFFEE_WEBHOOK_SECRET (same value).
 * Donors should use the same email as their GameJamCrew account so we can match auth.users.
 */
export async function POST(request: Request) {
  const secret = process.env.BUYMEACOFFEE_WEBHOOK_SECRET?.trim() ?? ""
  const isProd = process.env.NODE_ENV === "production"

  if (isProd && !secret) {
    console.error("[bmc-webhook] BUYMEACOFFEE_WEBHOOK_SECRET missing in production")
    return Response.json({ ok: false, error: "Webhook not configured" }, { status: 503 })
  }

  const rawBody = await request.text()

  if (secret) {
    const ok = verifyBuyMeACoffeeSignature(rawBody, request.headers, secret)
    if (!ok) {
      return Response.json({ ok: false, error: "Invalid signature" }, { status: 401 })
    }
  } else {
    console.warn("[bmc-webhook] No BUYMEACOFFEE_WEBHOOK_SECRET — signature not verified (dev only)")
  }

  let payload: unknown
  try {
    payload = JSON.parse(rawBody) as unknown
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
  }

  if (isBuyMeACoffeeRefundEvent(payload)) {
    return Response.json({ ok: true, skipped: "refund" })
  }

  const email = extractBuyMeACoffeeSupportEmail(payload)
  if (!email) {
    console.warn("[bmc-webhook] No supporter email in payload")
    return Response.json({ ok: true, skipped: "no_email" })
  }

  const userId = await findAuthUserIdByEmail(email)
  if (!userId) {
    console.warn("[bmc-webhook] No auth user for email:", email)
    return Response.json({ ok: true, skipped: "user_not_found" })
  }

  const { ok, granted, error } = await grantBadgesOnce(userId, [...SUPPORT_BADGES])
  if (!ok) {
    console.error("[bmc-webhook] grantBadgesOnce:", error)
    return Response.json({ ok: false, error: error ?? "grant_failed" }, { status: 500 })
  }

  return Response.json({ ok: true, userId, granted })
}
