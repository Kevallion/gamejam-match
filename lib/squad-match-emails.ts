/** Env snapshot so the guard can be unit-tested without mutating process.env. */
export type SquadMatchEmailEnv = {
  VERCEL_ENV?: string
  SQUAD_MATCH_EMAILS_ENABLED?: string
}

/**
 * The "A new squad needs your skills!" email is sent in Vercel production only.
 * On preview, staging and local it is skipped, unless SQUAD_MATCH_EMAILS_ENABLED=true
 * is set to force sending (reversible override; not configured on Vercel by default).
 */
export function areSquadMatchEmailsEnabled(
  env: NodeJS.ProcessEnv | SquadMatchEmailEnv = process.env,
): boolean {
  if (env.SQUAD_MATCH_EMAILS_ENABLED === "true") return true
  return env.VERCEL_ENV === "production"
}