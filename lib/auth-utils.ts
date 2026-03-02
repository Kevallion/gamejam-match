/**
 * Utilitaires d'authentification.
 *
 * Utilise la méthode standard de Supabase pour l'authentification OAuth.
 * Le navigateur gère nativement l'ouverture de l'application Discord sur mobile (Universal Links)
 * grâce à la redirection classique, au lieu de bloquer sur une popup.
 */

import { supabase } from "@/lib/supabase"

const AUTH_BROADCAST_CHANNEL = "gamejamcrew-auth-complete"

export async function signInWithDiscord(options?: { next?: string }): Promise<void> {
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`

  const next = options?.next ?? "/"
  const redirectWithNext = next.startsWith("/") ? `${redirectTo}?next=${encodeURIComponent(next)}` : redirectTo

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
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
