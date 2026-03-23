import { createHmac, timingSafeEqual } from "node:crypto"

import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Buy Me a Coffee sends a SHA-256 HMAC of the raw body (hex).
 * Headers vary by docs: x-signature-sha256 vs X-BMC-Signature.
 */
export function verifyBuyMeACoffeeSignature(
  rawBody: string,
  requestHeaders: Headers,
  secret: string,
): boolean {
  const sig =
    requestHeaders.get("x-signature-sha256") ??
    requestHeaders.get("X-BMC-Signature") ??
    requestHeaders.get("X-Signature-Sha256")
  if (!sig?.trim() || !secret) return false

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex")
  const a = Buffer.from(expected, "utf8")
  const b = Buffer.from(sig.trim().toLowerCase(), "utf8")
  return a.length === b.length && timingSafeEqual(a, b)
}

function pickEmailField(obj: unknown, keys: string[]): string | null {
  if (!obj || typeof obj !== "object") return null
  const o = obj as Record<string, unknown>
  for (const k of keys) {
    const v = o[k]
    if (typeof v === "string") {
      const t = v.trim()
      if (t.includes("@")) return t
    }
  }
  return null
}

/** Pull supporter / payer email from known BMC webhook shapes. */
export function extractBuyMeACoffeeSupportEmail(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null
  const root = payload as Record<string, unknown>
  const direct = pickEmailField(root, [
    "supporter_email",
    "payer_email",
    "email",
    "Supporter Email",
    "supporterEmail",
    "payerEmail",
  ])
  if (direct) return direct

  for (const nest of ["data", "response", "object", "payload"]) {
    const inner = root[nest]
    const nested = pickEmailField(inner, [
      "supporter_email",
      "payer_email",
      "email",
      "supporterEmail",
      "payerEmail",
    ])
    if (nested) return nested
  }
  return null
}

export function isBuyMeACoffeeRefundEvent(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false
  const o = payload as Record<string, unknown>
  const parts = [o.type, o.event, o.action, o.status]
    .filter((x): x is string => typeof x === "string")
    .join(" ")
    .toLowerCase()
  return parts.includes("refund")
}

/**
 * Resolves Supabase auth user id by email (admin API, paginated).
 */
export async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return null

  const admin = createAdminClient()
  let page = 1
  const perPage = 1000

  for (let i = 0; i < 100; i++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error || !data?.users?.length) return null
    const hit = data.users.find((u) => u.email?.toLowerCase() === normalized)
    if (hit?.id) return hit.id
    if (data.users.length < perPage) return null
    page += 1
  }

  return null
}
