/**
 * Copy + share URLs for the navbar Support popover.
 */

export const BUY_ME_A_COFFEE_URL = "https://buymeacoffee.com/gamejamcrew" as const

export const SUPPORT_POPOVER_TITLE = "Support GameJamCrew 💖"

export const SUPPORT_POPOVER_HEADING = "Help me keep the project alive ☕"

export const SUPPORT_POPOVER_BODY =
  "I'm building this platform to help every Game Jammer find their dream team. Your support helps me cover hosting costs and keeps the project ad-free and independent."

const FALLBACK_SITE = "https://gamejamcrew.com"

/**
 * URL used in social share intents: prefers `NEXT_PUBLIC_SITE_URL` when set (production),
 * otherwise the current origin in the browser.
 */
export function getShareableSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
  if (typeof window !== "undefined") {
    if (fromEnv) return fromEnv
    return window.location.origin.replace(/\/$/, "")
  }
  return fromEnv || FALLBACK_SITE
}

const REDDIT_SUBMIT_TITLE = "Found a great tool for Game Jammers: JamSquad"

export function buildJamSquadTwitterIntentUrl(shareUrl: string): string {
  const link = shareUrl.replace(/\/$/, "")
  const text = `I'm finding my next Game Jam team on JamSquad! Join 18+ creators here: ${link} 🚀`
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
}

export function buildRedditSubmitUrl(shareUrl: string): string {
  const link = shareUrl.replace(/\/$/, "")
  return `https://www.reddit.com/submit?url=${encodeURIComponent(link)}&title=${encodeURIComponent(REDDIT_SUBMIT_TITLE)}`
}

export function buildFacebookShareUrl(shareUrl: string): string {
  const link = shareUrl.replace(/\/$/, "")
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`
}

export function buildLinkedInShareUrl(shareUrl: string): string {
  const link = shareUrl.replace(/\/$/, "")
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`
}
