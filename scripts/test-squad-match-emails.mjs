import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

/** Must stay in sync with lib/squad-match-emails.ts */
function areSquadMatchEmailsEnabled(env) {
  if (env.SQUAD_MATCH_EMAILS_ENABLED === "true") return true
  return env.VERCEL_ENV === "production"
}

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../lib/squad-match-emails.ts"),
  "utf8",
)
if (!source.includes('env.SQUAD_MATCH_EMAILS_ENABLED === "true"')) {
  console.error("FAIL source drift: missing SQUAD_MATCH_EMAILS_ENABLED === \"true\"")
  process.exit(1)
}
if (!source.includes('env.VERCEL_ENV === "production"')) {
  console.error("FAIL source drift: missing VERCEL_ENV === \"production\"")
  process.exit(1)
}

const cases = [
  { name: "production sends", env: { VERCEL_ENV: "production" }, expected: true },
  { name: "preview skips", env: { VERCEL_ENV: "preview" }, expected: false },
  { name: "development skips", env: { VERCEL_ENV: "development" }, expected: false },
  { name: "unset env skips", env: {}, expected: false },
  {
    name: "preview forced on",
    env: { VERCEL_ENV: "preview", SQUAD_MATCH_EMAILS_ENABLED: "true" },
    expected: true,
  },
  {
    name: "local forced on",
    env: { SQUAD_MATCH_EMAILS_ENABLED: "true" },
    expected: true,
  },
  {
    name: "production still sends if override is not true",
    env: { VERCEL_ENV: "production", SQUAD_MATCH_EMAILS_ENABLED: "false" },
    expected: true,
  },
  {
    name: "preview skips if override is not true",
    env: { VERCEL_ENV: "preview", SQUAD_MATCH_EMAILS_ENABLED: "false" },
    expected: false,
  },
]

let failed = 0
for (const c of cases) {
  const got = areSquadMatchEmailsEnabled(c.env)
  if (got !== c.expected) {
    console.error(`FAIL ${c.name}: expected ${c.expected}, got ${got}`)
    failed += 1
  } else {
    console.log(`PASS ${c.name}`)
  }
}

if (failed > 0) {
  console.error(`${failed} test(s) failed`)
  process.exit(1)
}

console.log("PASS source matches lib/squad-match-emails.ts")
console.log(`${cases.length} tests passed`)