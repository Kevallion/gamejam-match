"use client"

import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { useIsInAppShell } from "@/components/app-shell/app-shell-context"
import { cn } from "@/lib/utils"

/**
 * Landmark for skip-to-content on standalone pages.
 * Inside SignedInAppShell the shell already provides <main id="main-content">,
 * so this renders a <div> to avoid a nested landmark and a duplicate id.
 */
export function MainRegion({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"main"> & { children?: ReactNode }) {
  const inAppShell = useIsInAppShell()
  if (inAppShell) {
    return (
      <div className={cn(className)} {...props}>
        {children}
      </div>
    )
  }
  return (
    <main id="main-content" tabIndex={-1} className={cn(className)} {...props}>
      {children}
    </main>
  )
}
