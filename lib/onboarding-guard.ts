/** Shared onboarding gates for XP awards and signed-in app routes. */

export const ONBOARDING_REQUIRED = "ONBOARDING_REQUIRED"

export function isOnboardingComplete(value: boolean | null | undefined): boolean {
  return value === true
}

/** True when awardXP must refuse the claim without throwing. */
export function shouldBlockXpAward(hasCompletedOnboarding: boolean | null | undefined): boolean {
  return hasCompletedOnboarding !== true
}

export function isCreateProfilePath(pathname: string): boolean {
  return pathname === "/create-profile" || pathname.startsWith("/create-profile/")
}

/**
 * Signed-in visitors who have not finished onboarding must leave app-shell
 * routes for /create-profile. Onboarded accounts, and /create-profile itself,
 * are never redirected (avoids a loop).
 */
export function shouldRedirectSignedInToCreateProfile(
  pathname: string,
  hasCompletedOnboarding: boolean | null | undefined,
): boolean {
  if (isOnboardingComplete(hasCompletedOnboarding)) return false
  if (isCreateProfilePath(pathname)) return false
  return true
}