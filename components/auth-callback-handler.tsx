"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { broadcastAuthComplete } from "@/lib/auth-utils"

function AuthCallbackHandlerInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const fromAuth = searchParams.get("from_auth") === "1"
    if (!fromAuth) return

    if (window.opener) {
      // Popup OAuth (mobile) : notifier la fenêtre parente et fermer
      broadcastAuthComplete()
      window.close()
    } else {
      // Redirection classique : retirer le param de l'URL
      const params = new URLSearchParams(searchParams.toString())
      params.delete("from_auth")
      const newSearch = params.toString()
      const newPath = `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`
      router.replace(newPath, { scroll: false })
    }
  }, [searchParams, router])

  return null
}

/**
 * Gère le retour du flux OAuth sur mobile (popup).
 * Si on est dans une popup (window.opener) après auth, on notifie la fenêtre parente
 * et on ferme la popup pour une expérience fluide.
 */
export function AuthCallbackHandler() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackHandlerInner />
    </Suspense>
  )
}
