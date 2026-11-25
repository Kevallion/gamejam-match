import { readFileSync, readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { navigateAfterServerAction } from "../lib/navigate-after-server-action.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const authModal = readFileSync(join(root, "components/auth-modal.tsx"), "utf8")
const form = readFileSync(join(root, "components/create-team-form.tsx"), "utf8")
const helper = readFileSync(join(root, "lib/navigate-after-server-action.ts"), "utf8")
const authUtils = readFileSync(join(root, "lib/auth-utils.ts"), "utf8")
const authUrl = readFileSync(join(root, "app/api/auth-url/route.ts"), "utf8")

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

const cases = [
  {
    name: "magic-link sign-in is the only signInWithOtp call site",
    fn: () =>
      otpCallSites.length === 1 &&
      otpCallSites[0].replaceAll("\\", "/") === "components/auth-modal.tsx",
  },
  {
    name: "signInWithOtp sets shouldCreateUser false",
    fn: () =>
      authModal.includes("shouldCreateUser: false") &&
      authModal.includes("signInWithOtp({"),
  },
  {
    name: "unknown-email magic link points users to Discord or Google signup",
    fn: () =>
      authModal.includes("No account found for this email") &&
      authModal.includes("Create one with Discord or Google"),
  },
  {
    name: "Discord and Google OAuth remain available to create an account",
    fn: () =>
      authUtils.includes('provider: "discord"') &&
      authUtils.includes('provider: "google"') &&
      authUtils.includes("signInWithOAuth") &&
      authUrl.includes('provider: "discord"') &&
      !authUtils.includes("shouldCreateUser: false"),
  },
  {
    name: "there is no separate email signUp() path",
    fn: () => !/auth\.signUp\s*\(/.test(authModal + authUtils + authUrl),
  },
  {
    name: "createTeam success navigates with assign, not router.push",
    fn: () =>
      form.includes("navigateAfterServerAction") &&
      form.includes("/dashboard?flow=new-team&id=") &&
      !/onCompleted\)[\s\S]{0,200}router\.push\(/.test(form) &&
      helper.includes("window.location.assign"),
  },
  {
    name: "navigateAfterServerAction rejects unsafe hrefs",
    fn: () => {
      const hrefs = []
      const original = globalThis.window
      globalThis.window = { location: { assign: (h) => hrefs.push(h) } }
      try {
        navigateAfterServerAction("/dashboard?flow=new-team&id=abc")
        navigateAfterServerAction("//evil.example")
        navigateAfterServerAction("https://evil.example")
        navigateAfterServerAction("javascript:alert(1)")
        return hrefs.length === 1 && hrefs[0] === "/dashboard?flow=new-team&id=abc"
      } finally {
        globalThis.window = original
      }
    },
  },
]

let failed = 0
for (const c of cases) {
  if (!c.fn()) {
    console.error(`FAIL ${c.name}`)
    if (c.name.includes("only signInWithOtp")) console.error(" sites:", otpCallSites)
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
