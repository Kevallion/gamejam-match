/**
 * Whether QA-only fixtures may be exposed: the `/ds19-card-fixtures` page
 * and the `?car2=fallback` mock upcoming-jams carousel.
 *
 * Allowed:
 * - local `next dev` (`NODE_ENV !== "production"`)
 * - Vercel preview deployments (`VERCEL_ENV === "preview"`)
 *
 * Hidden:
 * - Vercel production (`VERCEL_ENV === "production"`)
 * - a local `next build` / `next start` (`NODE_ENV === "production"`
 *   and `VERCEL_ENV` unset or not `"preview"`)
 *
 * The `dev/*-preview` routes 404 whenever `NODE_ENV === "production"`.
 * That would also hide these fixtures on Vercel preview, where Forge
 * still needs them, so this helper uses an explicit preview whitelist
 * instead of copying that local-only gate.
 */
export function allowQaFixtures(
  env: { NODE_ENV?: string; VERCEL_ENV?: string } = process.env,
): boolean {
  return env.NODE_ENV !== "production" || env.VERCEL_ENV === "preview"
}
