import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const AUTH_FAILED_REASON = "auth_failed"

/** Extrait l'URL d'avatar des métadonnées (Discord: avatar_url, Google: picture ou avatar_url) */
function extractAvatarUrl(metadata: User["user_metadata"]): string | null {
  if (!metadata || typeof metadata !== "object") return null
  const avatar = (metadata.avatar_url ?? metadata.picture) as unknown
  if (typeof avatar !== "string" || !avatar.trim()) return null
  const trimmed = avatar.trim()
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return null
  return trimmed
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"
  const safeNext = next.startsWith("/") ? next : "/dashboard"
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

    // Sync avatar from provider (Discord/Google) to profiles — try/catch pour ne jamais bloquer la redirection
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const avatarUrl = extractAvatarUrl(user.user_metadata)
        if (avatarUrl) {
          const { error } = await supabase
            .from("profiles")
            .update({ avatar_url: avatarUrl })
            .eq("id", user.id)
          if (error) console.error("[auth/callback] Avatar sync failed:", error.message)
        }
      }
    } catch (err) {
      console.error("[auth/callback] Avatar sync error:", err)
    }

    const forwardedHost = request.headers.get("x-forwarded-host")
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? origin
        : forwardedHost
          ? `https://${forwardedHost}`
          : origin

    // Paramètre pour que le client puisse fermer la popup OAuth sur mobile
    const separator = safeNext.includes("?") ? "&" : "?"
    const redirectUrl = `${baseUrl}${safeNext}${separator}from_auth=1`
    return NextResponse.redirect(redirectUrl)
  } catch (err) {
    console.error("Auth callback exception:", err)
    return NextResponse.redirect(`${errorUrl}?reason=${encodeURIComponent(AUTH_FAILED_REASON)}`)
  }
}
