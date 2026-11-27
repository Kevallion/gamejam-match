/**
 * Unit checks for lib/allow-qa-fixtures.ts (Node 22+ type stripping).
 * Run from the repo root: node --experimental-strip-types scripts/test-allow-qa-fixtures.mjs
 */
import assert from "node:assert/strict"
import { allowQaFixtures } from "../lib/allow-qa-fixtures.ts"

const cases = [
  [{ NODE_ENV: "development" }, true, "local next dev"],
  [{ NODE_ENV: "development", VERCEL_ENV: "production" }, true, "dev NODE_ENV wins even if VERCEL_ENV is set oddly"],
  [{ NODE_ENV: "production", VERCEL_ENV: "preview" }, true, "Vercel preview"],
  [{ NODE_ENV: "production", VERCEL_ENV: "production" }, false, "Vercel production"],
  [{ NODE_ENV: "production" }, false, "local next build/start without VERCEL_ENV"],
  [{ NODE_ENV: "production", VERCEL_ENV: "" }, false, "local prod with empty VERCEL_ENV"],
  [{ NODE_ENV: "production", VERCEL_ENV: "development" }, false, "VERCEL_ENV development is not the preview whitelist"],
  [{}, true, "empty env (not production NODE_ENV)"],
]

let failed = 0
for (const [env, expected, label] of cases) {
  const actual = allowQaFixtures(env)
  try {
    assert.equal(actual, expected, label)
    console.log(`ok  ${label} -> ${actual}`)
  } catch (error) {
    failed += 1
    console.error(`fail ${label}: expected ${expected}, got ${actual}`)
    console.error(error)
  }
}

if (failed) {
  process.exit(1)
}
console.log(`passed ${cases.length}`)
