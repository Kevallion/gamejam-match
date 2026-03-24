/**
 * Base URL absolue pour liens dans les e-mails, Open Graph, etc.
 * - `NEXT_PUBLIC_SITE_URL` en priorité (dev : http://localhost:3000, prod : domaine réel)
 * - Sur Vercel sans env : `VERCEL_URL` (preview / prod)
 * - Sinon : localhost en développement, domaine prod par défaut
 */
export function getPublicSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "")
  if (fromEnv) return fromEnv

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "")
    return `https://${host}`
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000"
  }

  return "https://gamejamcrew.com"
}

export function getPublicDashboardUrl(): string {
  return `${getPublicSiteUrl()}/dashboard`
}
