/**
 * Shared client logout (S4). Every "Log out" button goes through here.
 *
 * - "local": this browser only (Log out).
 * - "global": every session of the account (Log out of all devices).
 *
 * Order matters: the private screen is covered first, then the session is
 * ended, client state is cleared, and the router moves to a public page.
 */
import { supabase } from "@/lib/supabase"

export type SignOutScope = "local" | "global"

export const SIGN_OUT_START_EVENT = "gjc:sign-out-start"
export const SIGN_OUT_END_EVENT = "gjc:sign-out-end"
/** sessionStorage flag read after the full reload of an offline "all devices" logout. */
export const SIGN_OUT_NOTICE_KEY = "gjc_sign_out_notice"

/** Routes that only make sense signed in: leaving them after logout, and guarded on back/forward cache. */
export const PRIVATE_PATH_PREFIXES = ["/dashboard", "/invitation", "/sync-jams"] as const
const PRIVATE_PATH_RE = /^\/teams\/[^/]+\/manage(\/|$)/

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ||
    PRIVATE_PATH_RE.test(pathname)
}

type RouterLike = {
  replace: (href: string, options?: { scroll?: boolean }) => void
  refresh: () => void
}

export type SignOutResult = { ok: true } | { ok: false; error: string }

type AuthClientLike = {
  auth: { signOut: (options: { scope: SignOutScope }) => Promise<{ error: { message: string } | null }> }
}

async function trySignOut(client: AuthClientLike, scope: SignOutScope): Promise<string | null> {
  try {
    const result = await client.auth.signOut({ scope })
    return result.error ? result.error.message : null
  } catch (err) {
    return err instanceof Error ? err.message : "Sign out failed"
  }
}

/** Supabase session storage: `sb-<project>-auth-token` cookie (possibly chunked `.0`, `.1`...). */
const SUPABASE_SESSION_KEY_RE = /^sb-.+-auth-token(\.\d+)?$/

/**
 * Last resort when supabase.auth.signOut failed (offline): remove the stored
 * session on this device. The refresh token is not revoked server-side.
 */
export function forceClearLocalSession() {
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0]?.trim()
    if (name && SUPABASE_SESSION_KEY_RE.test(name)) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/`
    }
  }
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (SUPABASE_SESSION_KEY_RE.test(key)) window.localStorage.removeItem(key)
    }
  } catch {
    // Storage unavailable.
  }
}

/** Drops session-scoped client data the app keeps outside React state. */
export function clearPrivateClientState() {
  try {
    window.sessionStorage.clear()
  } catch {
    // Storage unavailable: nothing to clear.
  }
}

export async function signOutAndLeave({
  scope,
  router,
  redirectTo = "/",
  client = supabase as unknown as AuthClientLike,
}: {
  scope: SignOutScope
  router: RouterLike
  redirectTo?: string
  client?: AuthClientLike
}): Promise<SignOutResult> {
  const samePage = window.location.pathname === redirectTo
  window.dispatchEvent(new CustomEvent(SIGN_OUT_START_EVENT))

  const error = await trySignOut(client, scope)

  if (error) {
    // The server could not be reached (or refused): never leave this device
    // signed in. Retry locally, then drop the stored session ourselves.
    const localError = scope === "global" ? await trySignOut(client, "local") : error
    if (localError) {
      forceClearLocalSession()
      clearPrivateClientState()
      if (scope === "global") {
        try {
          window.sessionStorage.setItem(SIGN_OUT_NOTICE_KEY, "global-failed")
        } catch {
          // Storage unavailable: no notice after reload.
        }
      }
      // No auth event fires in this case: a full page load resets every
      // in-memory copy of the user (navbar, providers, router cache).
      window.location.replace(redirectTo)
      return { ok: false, error }
    }
  }

  clearPrivateClientState()
  router.replace(redirectTo, { scroll: true })
  router.refresh()
  if (samePage) window.dispatchEvent(new CustomEvent(SIGN_OUT_END_EVENT))

  return error ? { ok: false, error } : { ok: true }
}