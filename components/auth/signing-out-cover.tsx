"use client"

import { useEffect, useState } from "react"
import { flushSync } from "react-dom"
import { usePathname } from "next/navigation"
import { AppIcon } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"
import { toast } from "sonner"
import { SIGN_OUT_END_EVENT, SIGN_OUT_NOTICE_KEY, SIGN_OUT_START_EVENT } from "@/lib/auth/sign-out"

export const GLOBAL_SIGN_OUT_FAILED_TOAST = {
  title: "Logged out on this device only.",
  description: "We couldn't reach the server to log out your other devices. Sign in and try again.",
}

/** Safety net: never leave the cover up if navigation stalls. */
const MAX_COVER_MS = 8000

/**
 * Opaque cover shown the moment a logout starts, so private data on the
 * current screen is hidden before the session call and the redirect finish.
 */
export function SigningOutCover() {
  const pathname = usePathname()
  const [startedOn, setStartedOn] = useState<string | null>(null)

  useEffect(() => {
    // flushSync: the cover is painted before the session call starts.
    const onStart = () => flushSync(() => setStartedOn(window.location.pathname))
    const onEnd = () => setStartedOn(null)
    window.addEventListener(SIGN_OUT_START_EVENT, onStart)
    window.addEventListener(SIGN_OUT_END_EVENT, onEnd)
    return () => {
      window.removeEventListener(SIGN_OUT_START_EVENT, onStart)
      window.removeEventListener(SIGN_OUT_END_EVENT, onEnd)
    }
  }, [])

  useEffect(() => {
    let notice: string | null = null
    try {
      notice = window.sessionStorage.getItem(SIGN_OUT_NOTICE_KEY)
      window.sessionStorage.removeItem(SIGN_OUT_NOTICE_KEY)
    } catch {
      notice = null
    }
    if (notice === "global-failed") {
      toast.error(GLOBAL_SIGN_OUT_FAILED_TOAST.title, { description: GLOBAL_SIGN_OUT_FAILED_TOAST.description })
    }
  }, [])

  useEffect(() => {
    if (startedOn === null) return
    const timer = window.setTimeout(() => setStartedOn(null), MAX_COVER_MS)
    return () => window.clearTimeout(timer)
  }, [startedOn])

  // Hide once the router reached another page (render-time sync, no effect).
  const [seenPath, setSeenPath] = useState(pathname)
  if (pathname !== seenPath) {
    setSeenPath(pathname)
    if (startedOn !== null) setStartedOn(null)
  }
  if (startedOn === null) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
    >
      <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <AppIcon icon={ICON.loading} className="animate-spin" />
        Logging out…
      </span>
    </div>
  )
}