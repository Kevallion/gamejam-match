"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { isPrivatePath } from "@/lib/auth/sign-out"

/**
 * Back/forward cache guard: if a private page is restored from the browser
 * cache after logout (e.g. Back after leaving the site), leave it at once.
 */
export function BfcacheAuthGuard() {
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted || !isPrivatePath(window.location.pathname)) return
      document.documentElement.style.visibility = "hidden"
      void supabase.auth.getSession().then(({ data }) => {
        if (!data.session) {
          window.location.replace("/")
          return
        }
        document.documentElement.style.visibility = ""
      })
    }
    window.addEventListener("pageshow", onPageShow)
    return () => window.removeEventListener("pageshow", onPageShow)
  }, [])

  return null
}