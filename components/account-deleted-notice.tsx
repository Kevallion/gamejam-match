"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AppIcon } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"

export const ACCOUNT_DELETED_PARAM = "account_deleted"

/**
 * S6: confirmation after deleteUserAccount redirects to `/?account_deleted=1`.
 * The param is unsigned and display-only: static text, nothing read from it
 * beyond "is it 1". It is removed from the URL once shown.
 */
export function AccountDeletedNotice() {
  const router = useRouter()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get(ACCOUNT_DELETED_PARAM) !== "1") return
    params.delete(ACCOUNT_DELETED_PARAM)
    const rest = params.toString()
    router.replace(rest ? `${pathname}?${rest}` : pathname, { scroll: false })
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot read of the URL after mount
    setVisible(true)
  }, [pathname, router])

  useEffect(() => {
    if (visible) titleRef.current?.focus({ preventScroll: true })
  }, [visible])

  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[70] flex justify-center px-3">
      <section
        role="status"
        aria-live="polite"
        aria-labelledby="account-deleted-title"
        className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-mint/40 bg-card/95 p-4 shadow-lg shadow-black/20 backdrop-blur-md"
      >
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--mint)_14%,transparent)]">
          <AppIcon icon={ICON.done} tone="mint" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h2
            id="account-deleted-title"
            ref={titleRef}
            tabIndex={-1}
            className="text-sm font-semibold text-foreground outline-none"
          >
            Your account has been deleted.
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Your profile and personal data have been deleted or anonymised. A confirmation email may follow.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="-mr-1 -mt-1 rounded-lg"
          aria-label="Dismiss"
          onClick={() => setVisible(false)}
        >
          <AppIcon icon={ICON.close} />
        </Button>
      </section>
    </div>
  )
}