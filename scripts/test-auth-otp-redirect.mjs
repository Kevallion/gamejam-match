import { readFileSync, readdirSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { navigateAfterServerAction } from "../lib/navigate-after-server-action.ts"
import { hrefAfterSuccessfulTeamCreate } from "../lib/create-team-success-navigation.ts"
import { formatDateSafe, toValidDate } from "../lib/safe-date-format.ts"
import {
  SIGN_IN_OTP_SUCCESS_MESSAGE,
  normalizeAuthEmail,
  resolveAuthOtpError,
  successfulAuthOtpResult,
} from "../lib/auth-otp.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const authModal = readFileSync(join(root, "components/auth-modal.tsx"), "utf8")
const authForm = readFileSync(join(root, "components/auth-form.tsx"), "utf8")
const authOtpAction = readFileSync(join(root, "app/actions/auth-otp-actions.ts"), "utf8")
const signupPage = readFileSync(join(root, "app/signup/page.tsx"), "utf8")
const form = readFileSync(join(root, "components/create-team-form.tsx"), "utf8")
const helper = readFileSync(join(root, "lib/navigate-after-server-action.ts"), "utf8")
const nav = readFileSync(join(root, "lib/create-team-success-navigation.ts"), "utf8")
const authUtils = readFileSync(join(root, "lib/auth-utils.ts"), "utf8")
const authUrl = readFileSync(join(root, "app/api/auth-url/route.ts"), "utf8")
const isDs2 = existsSync(join(root, "lib/listing-dates.ts")) && existsSync(join(root, "lib/jam-listing-dates.ts"))

const TEAM_ID = "57b5a178-63b5-4cb0-a74f-169152049d3d"
const DASHBOARD_HREF = `/dashboard?flow=new-team&id=${TEAM_ID}`

function listSourceFiles(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git" || entry.name === "scripts") continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) listSourceFiles(path, acc)
    else if (/\.(ts|tsx|mjs|js)$/.test(entry.name)) acc.push(path)
  }
  return acc
}

const otpCallSites = []
for (const file of listSourceFiles(root)) {
  const text = readFileSync(file, "utf8")
  if (text.includes("signInWithOtp")) otpCallSites.push(file.slice(root.length + 1).replaceAll("\\", "/"))
}

function withAssignMock(fn) {
  const hrefs = []
  const original = globalThis.window
  globalThis.window = { location: { assign: (h) => hrefs.push(h) } }
  try {
    fn()
    return hrefs
  } finally {
    globalThis.window = original
  }
}

const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b)

const cases = [
  {
    name: "signInWithOtp lives only in the auth OTP server action",
    fn: () =>
      otpCallSites.length === 1 &&
      otpCallSites[0].replaceAll("\\", "/") === "app/actions/auth-otp-actions.ts" &&
      !authModal.includes("signInWithOtp") &&
      !authForm.includes("signInWithOtp"),
  },
  {
    name: "sign-in magic link sets shouldCreateUser false",
    fn: () =>
      authOtpAction.includes('requestMagicLink(email, "signin", next)') &&
      authOtpAction.includes("shouldCreateUser: purpose === \"signup\"") &&
      authForm.includes("requestSignInMagicLink") &&
      !authForm.includes("shouldCreateUser: true"),
  },
  {
    name: "sign-up magic link sets shouldCreateUser true only on the signup path",
    fn: () =>
      authOtpAction.includes('requestMagicLink(email, "signup", next)') &&
      authOtpAction.includes("shouldCreateUser: purpose === \"signup\"") &&
      authForm.includes("requestSignUpMagicLink") &&
      signupPage.includes('initialMode="signup"') &&
      authForm.includes("Sign up") &&
      authForm.includes('href="/signup"'),
  },
  {
    name: "sign-in returns the same success for an existing or unknown email",
    fn: () => {
      const existing = successfulAuthOtpResult()
      const unknown = resolveAuthOtpError(
        { message: "Signups not allowed for otp", status: 422 },
        "signin",
      )
      const notFound = resolveAuthOtpError({ message: "User not found", status: 400 }, "signin")
      return (
        sameJson(existing, { success: true }) &&
        sameJson(unknown, existing) &&
        sameJson(notFound, existing) &&
        !("kind" in unknown) &&
        !authForm.includes("No account found") &&
        !authModal.includes("No account found") &&
        authForm.includes(SIGN_IN_OTP_SUCCESS_MESSAGE) === false &&
        authForm.includes("If an account exists for this email") &&
        authForm.includes("Create an account")
      )
    },
  },
  {
    name: "sign-up returns the same success if the email is already registered",
    fn: () => {
      const created = successfulAuthOtpResult()
      const already = resolveAuthOtpError(
        { message: "User already registered", status: 422 },
        "signup",
      )
      return (
        sameJson(already, created) &&
        sameJson(already, { success: true }) &&
        authForm.includes("SIGN_UP_OTP_SUCCESS_MESSAGE")
      )
    },
  },
  {
    name: "rate-limit and invalid email stay visible errors",
    fn: () => {
      const rate = resolveAuthOtpError({ message: "rate limit exceeded", status: 429 }, "signin")
      const invalid = resolveAuthOtpError({ message: "Unable to validate email address", status: 400 }, "signin")
      const badInput = normalizeAuthEmail("not-an-email")
      const goodInput = normalizeAuthEmail("  qa@example.com ")
      return (
        rate.success === false &&
        rate.kind === "rate_limit" &&
        invalid.success === false &&
        invalid.kind === "invalid_email" &&
        badInput === null &&
        goodInput === "qa@example.com"
      )
    },
  },
  {
    name: "Discord and Google OAuth remain available to create an account",
    fn: () =>
      authUtils.includes('provider: "discord"') &&
      authUtils.includes('provider: "google"') &&
      authUtils.includes("signInWithOAuth") &&
      authUrl.includes('provider: "discord"') &&
      !authUtils.includes("shouldCreateUser: false") &&
      authForm.includes("Continue with Discord") &&
      authForm.includes("Continue with Google"),
  },
  {
    name: "there is no auth.signUp() email path",
    fn: () => !/auth\.signUp\s*\(/.test(authModal + authForm + authUtils + authUrl + authOtpAction),
  },
  {
    name: "createTeam success navigates with assign, not router.push",
    fn: () =>
      form.includes("navigateAfterServerAction(hrefAfterSuccessfulTeamCreate(result.teamId))") &&
      nav.includes("hrefAfterSuccessfulTeamCreate") &&
      nav.includes("/dashboard?flow=new-team&id=") &&
      !/onCompleted\)[\s\S]{0,400}router\.push\(/.test(form) &&
      helper.includes("window.location.assign"),
  },
  {
    name: "dated squad publish navigates to dashboard new-team flow",
    fn: () => {
      const href = hrefAfterSuccessfulTeamCreate(TEAM_ID)
      const hrefs = withAssignMock(() =>
        navigateAfterServerAction(hrefAfterSuccessfulTeamCreate(TEAM_ID)),
      )
      const navCall = "navigateAfterServerAction(hrefAfterSuccessfulTeamCreate(result.teamId))"
      const afterToast = form.split("Squad created successfully!")[1] ?? ""
      const elseBlock = afterToast.match(/else \{\s*navigateAfterServerAction\(hrefAfterSuccessfulTeamCreate\(result\.teamId\)\)\s*\}/)
      const hrefFn = nav.split("export function hrefAfterSuccessfulTeamCreate")[1] ?? nav
      return (
        href === DASHBOARD_HREF &&
        hrefs[0] === DASHBOARD_HREF &&
        afterToast.includes(navCall) &&
        !!elseBlock &&
        !/jam(DateRange|Ymd|StartDate|EndDate)/.test(elseBlock[0]) &&
        !/jamStartDate|jamEndDate|jamDateRange/.test(hrefFn)
      )
    },
  },
  {
    name: "flex squad publish (no dates) uses the same dashboard redirect",
    fn: () => {
      const href = hrefAfterSuccessfulTeamCreate(TEAM_ID)
      const hrefs = withAssignMock(() =>
        navigateAfterServerAction(hrefAfterSuccessfulTeamCreate(TEAM_ID)),
      )
      const navCall = "navigateAfterServerAction(hrefAfterSuccessfulTeamCreate(result.teamId))"
      const afterToast = form.split("Squad created successfully!")[1] ?? ""
      const elseBlock = afterToast.match(/else \{\s*navigateAfterServerAction\(hrefAfterSuccessfulTeamCreate\(result\.teamId\)\)\s*\}/)
      const hrefFn = nav.split("export function hrefAfterSuccessfulTeamCreate")[1] ?? nav
      return (
        href === DASHBOARD_HREF &&
        hrefs[0] === DASHBOARD_HREF &&
        afterToast.includes(navCall) &&
        !!elseBlock &&
        !/jam(DateRange|Ymd|StartDate|EndDate)/.test(elseBlock[0]) &&
        !/jamStartDate|jamEndDate|jamDateRange/.test(hrefFn)
      )
    },
  },
  {
    name: "navigateAfterServerAction rejects unsafe hrefs",
    fn: () => {
      const hrefs = withAssignMock(() => {
        navigateAfterServerAction("/dashboard?flow=new-team&id=abc")
        navigateAfterServerAction("//evil.example")
        navigateAfterServerAction("https://evil.example")
        navigateAfterServerAction("javascript:alert(1)")
      })
      return hrefs.length === 1 && hrefs[0] === "/dashboard?flow=new-team&id=abc"
    },
  },
  {
    name: "review date formatting does not throw for dated or flex values",
    fn: () => {
      const valid = new Date(2026, 11, 1)
      const invalid = new Date("not-a-date")
      const dated = formatDateSafe(valid, "MMM d, yyyy", "—")
      const missing = formatDateSafe(undefined, "MMM d, yyyy", "—")
      const bad = formatDateSafe(invalid, "MMM d, yyyy", "—")
      const fromIso = formatDateSafe("2026-12-01T23:59:59.999Z", "yyyy-MM-dd", "")
      if (!dated || missing !== "—" || bad !== "—" || !fromIso || toValidDate(invalid) !== null) {
        return false
      }
      if (isDs2) {
        return true
      }
      return form.includes("formatDateSafe(jamDateRange?.to") && !form.includes("format(jamDateRange")
    },
  },
]

if (isDs2) {
  const { registerHooks } = await import("node:module")
  registerHooks({
    resolve(specifier, context, nextResolve) {
      if (specifier.startsWith("./") && !/\.[a-zA-Z0-9]+$/.test(specifier)) {
        return nextResolve(specifier + ".ts", context)
      }
      return nextResolve(specifier, context)
    },
  })
  const { formatJamDateRangeReview } = await import("../lib/format-jam-date-range-review.ts")
  const listingDates = readFileSync(join(root, "lib/listing-dates.ts"), "utf8")
  const FLEXIBLE_DATES_LABEL = (listingDates.match(/export const FLEXIBLE_DATES_LABEL = "([^"]+)"/) ?? [])[1]
  if (!FLEXIBLE_DATES_LABEL) throw new Error("FLEXIBLE_DATES_LABEL missing")
  cases.push({
    name: "formatJamDateRangeReview covers dated and flex without throwing",
    fn: () => {
      const dated = formatJamDateRangeReview({
        from: new Date(2026, 11, 1),
        to: new Date(2026, 11, 8),
      })
      const flex = formatJamDateRangeReview(undefined, FLEXIBLE_DATES_LABEL)
      const corrupted = formatJamDateRangeReview({
        from: new Date("not-a-date"),
        to: new Date("not-a-date"),
      }, FLEXIBLE_DATES_LABEL)
      const isoLike = formatJamDateRangeReview({
        from: "2026-12-01T12:00:00.000Z",
        to: "2026-12-08T12:00:00.000Z",
      }, FLEXIBLE_DATES_LABEL)
      return (
        dated.hasEnd &&
        dated.text.includes("Dec") &&
        flex.text === FLEXIBLE_DATES_LABEL &&
        flex.hasEnd === false &&
        corrupted.text === FLEXIBLE_DATES_LABEL &&
        isoLike.hasEnd &&
        form.includes("formatJamDateRangeReview") &&
        !form.includes("dateInputToUtcStart(format(")
      )
    },
  })
}

let failed = 0
for (const c of cases) {
  if (!c.fn()) {
    console.error(`FAIL ${c.name}`)
    if (c.name.includes("signInWithOtp lives")) console.error(" sites:", otpCallSites)
    failed += 1
  } else {
    console.log(`PASS ${c.name}`)
  }
}

if (failed > 0) {
  console.error(`${failed} test(s) failed`)
  process.exit(1)
}
console.log(`${cases.length} tests passed`)