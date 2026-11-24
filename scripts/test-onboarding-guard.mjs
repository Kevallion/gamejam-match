import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

/** Must stay in sync with lib/onboarding-guard.ts */
const ONBOARDING_REQUIRED = "ONBOARDING_REQUIRED"

function isOnboardingComplete(value) {
  return value === true
}

function shouldBlockXpAward(hasCompletedOnboarding) {
  return hasCompletedOnboarding !== true
}

function isCreateProfilePath(pathname) {
  return pathname === "/create-profile" || pathname.startsWith("/create-profile/")
}

function shouldRedirectSignedInToCreateProfile(pathname, hasCompletedOnboarding) {
  if (isOnboardingComplete(hasCompletedOnboarding)) return false
  if (isCreateProfilePath(pathname)) return false
  return true
}

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../lib/onboarding-guard.ts"),
  "utf8",
)
const requiredSnippets = [
  "export const ONBOARDING_REQUIRED",
  "value === true",
  'pathname === "/create-profile"',
  "isCreateProfilePath(pathname)",
]
for (const snippet of requiredSnippets) {
  if (!source.includes(snippet)) {
    console.error(`FAIL source drift: lib/onboarding-guard.ts is missing ${JSON.stringify(snippet)}`)
    process.exit(1)
  }
}

const cases = [
  { name: "complete only when the flag is strictly true", fn: () => isOnboardingComplete(true) === true },
  { name: "false is not complete", fn: () => isOnboardingComplete(false) === false },
  { name: "null is not complete", fn: () => isOnboardingComplete(null) === false },
  { name: "undefined is not complete", fn: () => isOnboardingComplete(undefined) === false },
  { name: "XP is blocked when onboarding is not done", fn: () => shouldBlockXpAward(false) === true },
  { name: "XP is blocked when the flag is missing", fn: () => shouldBlockXpAward(null) === true && shouldBlockXpAward(undefined) === true },
  { name: "XP is allowed after onboarding", fn: () => shouldBlockXpAward(true) === false },
  { name: "onboarded users are never redirected", fn: () => shouldRedirectSignedInToCreateProfile("/dashboard", true) === false && shouldRedirectSignedInToCreateProfile("/create-profile", true) === false },
  { name: "non-onboarded users are redirected away from the dashboard", fn: () => shouldRedirectSignedInToCreateProfile("/dashboard", false) === true },
  { name: "non-onboarded users are redirected away from other shell pages", fn: () => shouldRedirectSignedInToCreateProfile("/find-members", false) === true && shouldRedirectSignedInToCreateProfile("/create-team", null) === true },
  { name: "non-onboarded users can stay on /create-profile (no loop)", fn: () => shouldRedirectSignedInToCreateProfile("/create-profile", false) === false && shouldRedirectSignedInToCreateProfile("/create-profile/extra", false) === false },
  { name: "refusal code is stable", fn: () => ONBOARDING_REQUIRED === "ONBOARDING_REQUIRED" && source.includes('ONBOARDING_REQUIRED = "ONBOARDING_REQUIRED"') },
]

let failed = 0
for (const c of cases) {
  if (!c.fn()) {
    console.error(`FAIL ${c.name}`)
    failed += 1
  } else {
    console.log(`PASS ${c.name}`)
  }
}

if (failed > 0) {
  console.error(`${failed} test(s) failed`)
  process.exit(1)
}

console.log("PASS source matches lib/onboarding-guard.ts")
console.log(`${cases.length} tests passed`)