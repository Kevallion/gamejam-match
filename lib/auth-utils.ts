/**
 * Utilitaires d'authentification avec support mobile.
 *
 * Sur mobile, on ouvre le flux OAuth dans un nouvel onglet du navigateur système
 * plutôt que dans la page actuelle. Cela améliore l'expérience car :
 * - Le navigateur système (Chrome/Safari) peut avoir une session Discord existante
 * - Évite les WebViews sans cookies (liens ouverts depuis Discord, Twitter, etc.)
 */

import { supabase } from "@/lib/supabase"

const AUTH_BROADCAST_CHANNEL = "gamejamcrew-auth-complete"

function isMobile(): boolean {
  if (typeof window === "undefined") return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export async function signInWithDiscord(options?: { next?: string }): Promise<void> {
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`

  const next = options?.next ?? "/"
  const redirectWithNext = next.startsWith("/") ? `${redirectTo}?next=${encodeURIComponent(next)}` : redirectTo

  if (isMobile()) {
    // Sur mobile : ouvrir dans un nouvel onglet pour utiliser le navigateur système
    // (qui peut avoir une session Discord) plutôt qu'une WebView isolée
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: redirectWithNext, skipBrowserRedirect: true },
    })

    if (error) throw error

    if (data?.url) {
      const popup = window.open(data.url, "_blank", "noopener,noreferrer")
      if (!popup) {
        // Popup bloquée : fallback sur la redirection classique
        await supabase.auth.signInWithOAuth({
          provider: "discord",
          options: { redirectTo: redirectWithNext },
        })
      }
    }
  } else {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: redirectWithNext },
    })
    if (error) throw error
  }
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
