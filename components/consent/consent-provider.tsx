"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react"
import {
  GA_MEASUREMENT_ID,
  clearAnalyticsCookies,
  parseConsent,
  readConsentRaw,
  subscribeConsent,
  subscribeOpenCookieSettings,
  writeConsent,
  type ConsentCategories,
  type ConsentRecord,
} from "@/lib/consent"
import { AnalyticsScripts } from "@/components/consent/analytics-scripts"
import { CookieBanner } from "@/components/consent/cookie-banner"
import { CookiePreferencesDialog } from "@/components/consent/cookie-preferences-dialog"

type ConsentContextValue = {
  /** null until the visitor decides (or after the stored choice expired). */
  consent: ConsentRecord | null
  saveConsent: (categories: ConsentCategories) => void
  openSettings: () => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

export function useConsent() {
  const value = useContext(ConsentContext)
  if (!value) throw new Error("useConsent must be used inside <ConsentProvider>")
  return value
}

/** Server and hydration snapshot: renders neither the banner nor analytics. */
const SERVER_SNAPSHOT = "__server__"

function focusMainContent() {
  const main = document.querySelector("main")
  if (!(main instanceof HTMLElement)) return
  if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1")
  main.focus({ preventScroll: true })
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(subscribeConsent, readConsentRaw, () => SERVER_SNAPSHOT)
  const hydrated = raw !== SERVER_SNAPSHOT
  const consent = useMemo(() => (hydrated ? parseConsent(raw) : null), [hydrated, raw])
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => subscribeOpenCookieSettings(() => setSettingsOpen(true)), [])

  const saveConsent = useCallback(
    (categories: ConsentCategories) => {
      const hadAnalytics = consent?.categories.analytics === true
      writeConsent(categories)
      if (hadAnalytics && !categories.analytics) {
        // Withdrawal: stop GA right away, drop its cookies, then reload so no
        // already-loaded analytics script keeps running on this page.
        const w = window as unknown as Record<string, unknown> & { gtag?: (...args: unknown[]) => void }
        w[`ga-disable-${GA_MEASUREMENT_ID}`] = true
        w.gtag?.("consent", "update", { analytics_storage: "denied" })
        clearAnalyticsCookies()
        window.location.reload()
      }
    },
    [consent],
  )

  const value = useMemo<ConsentContextValue>(
    () => ({ consent, saveConsent, openSettings: () => setSettingsOpen(true) }),
    [consent, saveConsent],
  )

  const showBanner = hydrated && consent === null

  return (
    <ConsentContext.Provider value={value}>
      {showBanner ? (
        <CookieBanner
          onAcceptAll={() => {
            saveConsent({ analytics: true })
            focusMainContent()
          }}
          onRejectAll={() => {
            saveConsent({ analytics: false })
            focusMainContent()
          }}
          onCustomize={() => setSettingsOpen(true)}
        />
      ) : null}
      {children}
      {hydrated ? (
        <CookiePreferencesDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          initial={consent?.categories ?? { analytics: false }}
          decided={consent !== null}
          onSave={(categories) => {
            saveConsent(categories)
            setSettingsOpen(false)
          }}
        />
      ) : null}
      {consent?.categories.analytics ? <AnalyticsScripts /> : null}
    </ConsentContext.Provider>
  )
}