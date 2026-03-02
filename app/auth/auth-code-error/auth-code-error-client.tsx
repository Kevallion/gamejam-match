"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

const RETRY_DELAY_MS = 300
const RETRY_COUNT = 5

const Loader = () => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4">
    <Loader2 className="size-10 animate-spin text-primary" />
    <p className="text-muted-foreground">Vérification...</p>
  </div>
)

/**
 * Bloque le rendu des erreurs tant que Supabase n'a pas fini d'initialiser la session.
 * Vérifie si une session existe avant d'afficher l'erreur (évite le flash en race condition).
 */
export function AuthCodeErrorClient({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isInitializing } = useAuth()
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  useEffect(() => {
    if (isInitializing) return

    function redirectIfSession() {
      router.replace("/")
    }

    async function checkSessionWithRetries() {
      for (let i = 0; i <= RETRY_COUNT; i++) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          redirectIfSession()
          return
        }
        if (i < RETRY_COUNT) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
        }
      }
      setHasSession(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) redirectIfSession()
      }
    )

    checkSessionWithRetries()

    return () => subscription.unsubscribe()
  }, [router, isInitializing])

  // Pendant l'init Supabase : spinner (pas d'erreur)
  if (isInitializing) {
    return <Loader />
  }

  // En attente du résultat de la vérification session
  if (hasSession === null) {
    return <Loader />
  }

  return <>{children}</>
}
