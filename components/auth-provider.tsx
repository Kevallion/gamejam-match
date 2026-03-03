"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type AuthContextValue = {
  /** true tant que Supabase n'a pas fini de vérifier la session au premier chargement */
  isInitializing: boolean
}

const AuthContext = createContext<AuthContextValue>({
  isInitializing: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

/**
 * Fournit l'état d'initialisation de l'auth.
 * Bloquer le rendu des erreurs d'authentification tant que isInitializing est true.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        await supabase.auth.getSession()
      } catch (err: unknown) {
        const isRefreshTokenError =
          err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "refresh_token_not_found"
        if (isRefreshTokenError) {
          await supabase.auth.signOut()
        }
      }
      if (!cancelled) {
        setIsInitializing(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "INITIAL_SESSION" && !cancelled) {
          setIsInitializing(false)
        }
      }
    )

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ isInitializing }}>
      {children}
    </AuthContext.Provider>
  )
}
