import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"
  const safeNext = next.startsWith("/") ? next : "/"
  const origin = request.headers.get("origin") ?? request.url.split("/auth/callback")[0]

  if (!code) {
    const oauthError = searchParams.get("error")
    const oauthDesc = searchParams.get("error_description")
    const reason = oauthError || oauthDesc
      ? encodeURIComponent(`${oauthError || "oauth_error"}: ${oauthDesc || "Unknown"}`)
      : encodeURIComponent("no_code")
    return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=${reason}`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("Auth callback error:", error)
    const reason = encodeURIComponent(error.message)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=${reason}`)
  }

  const forwardedHost = request.headers.get("x-forwarded-host")
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? origin
      : forwardedHost
        ? `https://${forwardedHost}`
        : origin

  return NextResponse.redirect(`${baseUrl}${safeNext}`)
}
