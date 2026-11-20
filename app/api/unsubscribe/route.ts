import { NextResponse } from "next/server"
import { applyUnsubscribe } from "@/lib/email-unsubscribe"

export const dynamic = "force-dynamic"

/**
 * RFC 8058 one-click unsubscribe (List-Unsubscribe-Post: List-Unsubscribe=One-Click).
 * Mail providers POST here without cookies; the signed token in the query is the proof.
 */
export async function POST(request: Request) {
  const url = new URL(request.url)
  const result = await applyUnsubscribe(
    url.searchParams.get("u"),
    url.searchParams.get("c"),
    url.searchParams.get("t"),
  )
  if (result.ok) {
    return NextResponse.json({ ok: true, scope: result.scope })
  }
  const status =
    result.reason === "invalid" ? 400 : result.reason === "unavailable" ? 503 : 500
  return NextResponse.json({ ok: false, error: result.reason }, { status })
}

/** A plain GET never unsubscribes (link scanners): send people to the confirm page. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const target = new URL("/unsubscribe", url.origin)
  for (const key of ["u", "c", "t"]) {
    const value = url.searchParams.get(key)
    if (value) target.searchParams.set(key, value)
  }
  return NextResponse.redirect(target, 303)
}
