/**
 * Hostnames autorisés dans next.config `images.remotePatterns` pour l’optimisation next/image.
 * Les autres URLs (ex. og:image exotiques) passent en `unoptimized` pour éviter les erreurs runtime.
 */
const OPTIMIZABLE_IMAGE_HOSTNAMES = new Set([
  "cdn.discordapp.com",
  "api.dicebear.com",
  "lh3.googleusercontent.com",
  "img.itch.zone",
  "cdn.itch.io",
])

export function externalImageNeedsUnoptimized(src: string): boolean {
  try {
    const { protocol, hostname } = new URL(src)
    if (protocol !== "https:" && protocol !== "http:") return true
    return !OPTIMIZABLE_IMAGE_HOSTNAMES.has(hostname)
  } catch {
    return true
  }
}
