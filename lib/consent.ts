/**
 * Cookie and tracker consent (S1).
 *
 * The choice is stored in this browser only (localStorage), with a version and
 * a date. Nothing optional loads before a stored "analytics: true" choice.
 */

export const CONSENT_STORAGE_KEY = "gjc_cookie_consent"
/** Bump when categories or purposes change: everyone is asked again. */
export const CONSENT_VERSION = 1
/** The choice (accept or reject) is kept 6 months, then the banner asks again. */
export const CONSENT_MAX_AGE_DAYS = 182

export const GA_MEASUREMENT_ID = "G-06ZYF4G9Z6"
export const GTM_CONTAINER_ID = "GTM-M5P3GBBL"

export type ConsentCategories = {
  /** Google Analytics 4 (through gtag.js and Google Tag Manager) and Vercel Web Analytics. */
  analytics: boolean
}

export type ConsentRecord = {
  version: number
  /** ISO date of the choice. */
  decidedAt: string
  categories: ConsentCategories
}

const CHANGE_EVENT = "gjc:consent-change"
const OPEN_SETTINGS_EVENT = "gjc:open-cookie-settings"

/** Cookies set by Google Analytics 4 (`_ga`, `_ga_<id>`, legacy `_gid` / `_gat`). */
const ANALYTICS_COOKIE_RE = /^(_ga(_.+)?|_gid|_gat(_.+)?)$/

export function parseConsent(raw: string | null | undefined, now: Date = new Date()): ConsentRecord | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as Partial<ConsentRecord> | null
    if (!value || value.version !== CONSENT_VERSION) return null
    if (typeof value.decidedAt !== "string") return null
    const decidedAt = Date.parse(value.decidedAt)
    if (Number.isNaN(decidedAt)) return null
    if (now.getTime() - decidedAt > CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000) return null
    const analytics = value.categories?.analytics
    if (typeof analytics !== "boolean") return null
    return { version: CONSENT_VERSION, decidedAt: value.decidedAt, categories: { analytics } }
  } catch {
    return null
  }
}

/** Raw stored string: a stable snapshot for useSyncExternalStore. */
export function readConsentRaw(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY)
  } catch {
    return null
  }
}

export function writeConsent(categories: ConsentCategories): ConsentRecord {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    categories: { analytics: categories.analytics },
  }
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record))
  } catch {
    // Storage blocked: the choice applies to this page view only.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
  return record
}

export function subscribeConsent(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === CONSENT_STORAGE_KEY) callback()
  }
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener("storage", onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback)
    window.removeEventListener("storage", onStorage)
  }
}

/** Opens the cookie settings dialog from anywhere (footer, Settings, privacy page). */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))
}

export function subscribeOpenCookieSettings(callback: () => void): () => void {
  window.addEventListener(OPEN_SETTINGS_EVENT, callback)
  return () => window.removeEventListener(OPEN_SETTINGS_EVENT, callback)
}

/** Expires every Google Analytics cookie on this host and its parent domains. */
export function clearAnalyticsCookies() {
  if (typeof document === "undefined") return
  const names = document.cookie
    .split(";")
    .map((part) => part.split("=")[0]?.trim())
    .filter((name): name is string => Boolean(name) && ANALYTICS_COOKIE_RE.test(name))
  if (names.length === 0) return

  const host = window.location.hostname
  const labels = host.split(".")
  const domains = new Set<string>([""])
  for (let i = 0; i < labels.length - 1; i += 1) {
    const domain = labels.slice(i).join(".")
    domains.add(`; domain=${domain}`)
    domains.add(`; domain=.${domain}`)
  }
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/${domain}`
    }
  }
}