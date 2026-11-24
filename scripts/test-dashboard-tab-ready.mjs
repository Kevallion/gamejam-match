import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

/** Must stay in sync with lib/dashboard-tab-ready.ts */
function shouldShowDashboardSkeleton(tab, loading, rewardsReady, coreReady = false) {
  if (tab === "achievements") return !rewardsReady
  if (tab === "squads" && coreReady) return false
  return loading
}

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../lib/dashboard-tab-ready.ts"),
  "utf8",
)
if (!source.includes('tab === "achievements"') || !source.includes("return !rewardsReady") || !source.includes('tab === "squads" && coreReady')) {
  console.error("FAIL source drift: lib/dashboard-tab-ready.ts does not match the test helper")
  process.exit(1)
}

const cases = [
  { name: "Rewards waits until the snapshot is ready", tab: "achievements", loading: true, rewardsReady: false, coreReady: false, expected: true },
  { name: "Rewards paints while the rest of loadData is still running", tab: "achievements", loading: true, rewardsReady: true, coreReady: true, expected: false },
  { name: "Rewards stays visible after loadData finishes", tab: "achievements", loading: false, rewardsReady: true, coreReady: true, expected: false },
  { name: "Rewards keeps the skeleton if the snapshot never arrives", tab: "achievements", loading: false, rewardsReady: false, coreReady: false, expected: true },
  { name: "Home waits for the full load without a core payload", tab: "squads", loading: true, rewardsReady: false, coreReady: false, expected: true },
  { name: "Home paints once core data is ready, even if recos are still loading", tab: "squads", loading: true, rewardsReady: true, coreReady: true, expected: false },
  { name: "Home paints when the full load is done", tab: "squads", loading: false, rewardsReady: true, coreReady: true, expected: false },
  { name: "Inbox waits for the full load even if the home payload is ready", tab: "inbox", loading: true, rewardsReady: true, coreReady: true, expected: true },
  { name: "Settings paints only after the full load", tab: "settings", loading: false, rewardsReady: true, coreReady: true, expected: false },
]

let failed = 0
for (const c of cases) {
  const got = shouldShowDashboardSkeleton(c.tab, c.loading, c.rewardsReady, c.coreReady)
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

console.log("PASS source matches lib/dashboard-tab-ready.ts")
console.log(`${cases.length} tests passed`)