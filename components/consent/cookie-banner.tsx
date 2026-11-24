"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AppIcon } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"

type CookieBannerProps = {
  onAcceptAll: () => void
  onRejectAll: () => void
  onCustomize: () => void
}

/** Same look for the three choices: no option is pushed over another. */
const CHOICE_CLASS = "h-9 w-full rounded-xl px-3 text-sm font-semibold sm:w-auto sm:min-w-28"

/**
 * First-visit consent banner. Non-modal, the page stays usable; nothing
 * optional is loaded until a choice is made. z-[45]: above page chrome,
 * below dialogs (z-50) so Customize covers it.
 */
export function CookieBanner({ onAcceptAll, onRejectAll, onCustomize }: CookieBannerProps) {
  return (
    <section
      role="region"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[45] p-3 sm:p-4"
    >
      <div className="pointer-events-auto mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-lg shadow-black/20 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--peach)_14%,transparent)]">
            <AppIcon icon={ICON.cookies} tone="peach" />
          </span>
          <div className="min-w-0 space-y-1">
            <h2 id="cookie-banner-title" className="text-sm font-semibold text-foreground">
              Cookies and analytics
            </h2>
            <p id="cookie-banner-desc" className="text-xs leading-relaxed text-muted-foreground">
              We&apos;d like to use Google Analytics and Vercel Analytics to see how the site is used.
              They only load if you accept. You can change your choice anytime from{" "}
              <span className="font-medium text-foreground">Cookie settings</span> in the footer.{" "}
              <Link href="/privacy#cookies" className="font-medium text-primary underline-offset-4 hover:underline">
                Privacy policy
              </Link>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:shrink-0">
          <Button type="button" variant="outline" className={CHOICE_CLASS} onClick={onRejectAll}>
            Reject all
          </Button>
          <Button type="button" variant="outline" className={CHOICE_CLASS} onClick={onCustomize}>
            Customize
          </Button>
          <Button type="button" variant="outline" className={CHOICE_CLASS} onClick={onAcceptAll}>
            Accept all
          </Button>
        </div>
      </div>
    </section>
  )
}