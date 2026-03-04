/**
 * Utilitaires d'authentification.
 *
 * Sur mobile, on tente de récupérer l'URL d'autorisation Discord exacte pour
 * utiliser le schéma "discord://" et forcer l'ouverture de l'application.
 */

import { supabase } from "@/lib/supabase"

const AUTH_BROADCAST_CHANNEL = "gamejamcrew-auth-complete"

function isMobile(): boolean {
  if (typeof window === "undefined") return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export async function signInWithDiscord(options?: { next?: string }): Promise<void> {
  const next = options?.next ?? "/dashboard"

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`

  const redirectWithNext = next.startsWith("/") ? `${redirectTo}?next=${encodeURIComponent(next)}` : redirectTo

  if (isMobile()) {
    try {
      // 1. Appeler notre route API pour obtenir l'URL finale (discord.com/oauth2/...)
      const res = await fetch(`/api/auth-url?next=${encodeURIComponent(next)}`)
      const data = await res.json()

      if (data?.url) {
        let appUrl = data.url

        // Si c'est bien l'URL d'autorisation Discord, on remplace par le deep link
        if (appUrl.includes("discord.com/oauth2/authorize")) {
          appUrl = appUrl.replace("https://discord.com/oauth2/authorize", "discord://-/oauth2/authorize")
        } else if (appUrl.includes("discord.com/login?redirect_to=%2Foauth2%2Fauthorize")) {
          // Si Discord redirige vers /login, on nettoie pour pointer sur /oauth2/authorize dans l'app
          const urlObj = new URL(appUrl)
          const redirectParam = urlObj.searchParams.get("redirect_to")
          if (redirectParam) {
            appUrl = `discord://-${redirectParam}`
          }
        }

        // Tenter d'ouvrir l'app Discord
        window.location.assign(appUrl)

        // Si l'app n'est pas installée, le deep link risque d'échouer silencieusement.
        // On met en place un fallback vers l'URL web classique après un court délai
        setTimeout(() => {
          // On redirige vers la version web si l'app ne s'est pas ouverte
          window.location.assign(data.url)
        }, 2500)

        return
      }
    } catch (err) {
      console.error("Could not retrieve Discord URL, falling back to standard Supabase API", err)
    }
  }

  // Comportement standard (Desktop ou erreur sur mobile)
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: { redirectTo: redirectWithNext },
  })

  if (error) throw error
}

export async function signInWithGoogle(options?: { next?: string }): Promise<void> {
  const next = options?.next ?? "/dashboard"

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`

  const redirectWithNext = next.startsWith("/") ? `${redirectTo}?next=${encodeURIComponent(next)}` : redirectTo

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectWithNext },
  })

  if (error) throw error
}

export function subscribeToAuthComplete(callback: () => void): () => void {
  const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL)
  channel.onmessage = callback
  return () => channel.close()
}

export function broadcastAuthComplete(): void {
  const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL)
  channel.postMessage("complete")
  channel.close()
}
