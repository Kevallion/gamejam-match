import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const AUTH_FAILED_REASON = "auth_failed"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"
  const safeNext = next.startsWith("/") ? next : "/"
  const origin = request.headers.get("origin") ?? request.url.split("/auth/callback")[0]
  const errorUrl = `${origin}/auth/auth-code-error`

  // Si Discord ou OAuth a renvoyé une erreur, ne pas tenter d'authentifier
  const oauthError = searchParams.get("error")
  const oauthDesc = searchParams.get("error_description")
  if (oauthError || oauthDesc) {
    const reason = encodeURIComponent(
      `${oauthError || "oauth_error"}: ${oauthDesc || "Unknown"}`
    )
    return NextResponse.redirect(`${errorUrl}?reason=${reason}`)
  }

  if (!code) {
    return NextResponse.redirect(`${errorUrl}?reason=${encodeURIComponent("no_code")}`)
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth callback error:", error)
      const reason = encodeURIComponent(error.message)
      return NextResponse.redirect(`${errorUrl}?reason=${reason}`)
    }

    const forwardedHost = request.headers.get("x-forwarded-host")
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? origin
        : forwardedHost
          ? `https://${forwardedHost}`
          : origin

    return NextResponse.redirect(`${baseUrl}${safeNext}`)
  } catch (err) {
    console.error("Auth callback exception:", err)
    return NextResponse.redirect(`${errorUrl}?reason=${encodeURIComponent(AUTH_FAILED_REASON)}`)
  }
}
