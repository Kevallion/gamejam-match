"use client"

import { openCookieSettings } from "@/lib/consent"
import { cn } from "@/lib/utils"

/** Persistent entry point to change the cookie choice (footer, privacy page). */
export function CookieSettingsButton({ className, children = "Cookie settings" }: { className?: string; children?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      aria-haspopup="dialog"
      className={cn(
        "cursor-pointer text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {children}
    </button>
  )
}