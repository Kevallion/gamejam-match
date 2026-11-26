import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  ITCH_JAMS_LISTING_URL,
  ITCH_JAMS_USER_AGENT,
  fetchItchJamsListingHtml,
  filterAndSortUpcoming,
  parseItchJamsListing,
  parseItchListingDate,
  persistUpcomingJams,
  parseUpcomingJamsPayload,
  toPublicContract,
  type UpcomingJamRow,
  type UpcomingJamsWriter,
} from "../lib/upcoming-jams.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const fixture = readFileSync(join(root, "scripts/fixtures/itch-jams-listing.html"), "utf8")
const now = new Date("2026-11-26T12:00:00.000Z")
let failed = 0

function test(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      console.log(`ok  ${name}`)
    })
    .catch((err: unknown) => {
      failed += 1
      console.error(`not ok  ${name}`)
      console.error(err)
    })
}

await test("parseItchListingDate treats naive itch dates as UTC", () => {
  assert.equal(parseItchListingDate("2026-12-05 23:00:00"), "2026-12-05T23:00:00.000Z")
  assert.equal(parseItchListingDate("2026-12-16T03:00:00Z"), "2026-12-16T03:00:00.000Z")
  assert.equal(parseItchListingDate(""), null)
  assert.equal(parseItchListingDate("not-a-date"), null)
})

await test("parser reads the fixture calendar and enriches featured image/host", () => {
  const parsed = parseItchJamsListing(fixture)
  assert.equal(parsed.ok, true)
  if (!parsed.ok) return
  const byId = new Map(parsed.jams.map((jam) => [jam.itchId, jam]))
  // Missing dates are skipped; 5 valid jams remain.
  assert.equal(parsed.jams.length, 5)
  assert.equal(byId.has(22), false)

  const featured = byId.get(420993)
  assert.ok(featured)
  assert.equal(featured.title, "Featured Jam")
  assert.equal(featured.url, "https://itch.io/jam/featured-jam")
  assert.equal(featured.imageUrl, "https://img.itch.zone/featured-cover.png")
  assert.equal(featured.host, "augie, RetroCrow")
  assert.equal(featured.startAt, "2026-12-05T23:00:00.000Z")
  assert.equal(featured.endAt, "2026-12-13T17:00:00.000Z")
  assert.equal(featured.joinedCount, 2592)

  const inProgress = byId.get(417834)
  assert.ok(inProgress)
  assert.equal(inProgress.imageUrl, null)
  assert.equal(inProgress.host, null)
  assert.equal(inProgress.joinedCount, 4511)
})

await test("parser fails closed on missing or broken payloads", () => {
  const empty = parseItchJamsListing("")
  assert.equal(empty.ok, false)

  const missing = parseItchJamsListing("<html><body>no calendar</body></html>")
  assert.equal(missing.ok, false)

  const broken = parseItchJamsListing(
    `R.Jam.FilteredJamCalendar({"jams":[}), document.getElementById("x")`,
  )
  assert.equal(broken.ok, false)

  const none = parseItchJamsListing(
    `R.Jam.FilteredJamCalendar({"search_url":"/search","jams":[]}), document.getElementById("x")`,
  )
  assert.equal(none.ok, true)
  if (none.ok) assert.equal(none.jams.length, 0)
})

await test("filter and sort keep unended jams, ranked by joinedCount", () => {
  const parsed = parseItchJamsListing(fixture)
  assert.equal(parsed.ok, true)
  if (!parsed.ok) return
  const top = filterAndSortUpcoming(parsed.jams, now, 10)
  assert.deepEqual(
    top.map((jam) => jam.itchId),
    [417834, 420993, 414508, 3],
  )
  assert.equal(top.some((jam) => jam.itchId === 11), false)
  const top3 = filterAndSortUpcoming(parsed.jams, now, 3)
  assert.deepEqual(
    top3.map((jam) => jam.joinedCount),
    [4511, 2592, 851],
  )
})

await test("public contract shape is exact and dates are ISO", () => {
  const parsed = parseItchJamsListing(fixture)
  assert.equal(parsed.ok, true)
  if (!parsed.ok) return
  const top = toPublicContract(filterAndSortUpcoming(parsed.jams, now, 10))
  assert.ok(top.length > 0)
  const keys = Object.keys(top[0]).sort()
  assert.deepEqual(keys, [
    "endAt",
    "host",
    "id",
    "imageUrl",
    "joinedCount",
    "startAt",
    "title",
    "url",
  ])
  for (const jam of top) {
    assert.equal(typeof jam.id, "string")
    assert.equal(typeof jam.title, "string")
    assert.equal(typeof jam.url, "string")
    assert.ok(jam.imageUrl === null || typeof jam.imageUrl === "string")
    assert.ok(jam.host === null || typeof jam.host === "string")
    assert.match(jam.startAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    assert.match(jam.endAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    assert.equal(typeof jam.joinedCount, "number")
    assert.equal(Object.keys(jam).length, 8)
  }
  const featured = top.find((jam) => jam.id === "420993")
  assert.ok(featured)
  assert.equal(featured.imageUrl, "https://img.itch.zone/featured-cover.png")
  assert.equal(featured.host, "augie, RetroCrow")
})


await test("client parser accepts the public contract, including null image/host", () => {
  const parsed = parseItchJamsListing(fixture)
  assert.equal(parsed.ok, true)
  if (!parsed.ok) return
  const top = toPublicContract(filterAndSortUpcoming(parsed.jams, now, 10))
  const accepted = parseUpcomingJamsPayload(top)
  assert.ok(accepted)
  assert.equal(accepted.length, top.length)
  assert.equal(accepted[0].id, "417834")
  const featured = accepted.find((jam) => jam.id === "420993")
  assert.ok(featured)
  assert.equal(featured.imageUrl, "https://img.itch.zone/featured-cover.png")
  const inProgress = accepted.find((jam) => jam.id === "417834")
  assert.ok(inProgress)
  assert.equal(inProgress.imageUrl, null)
  assert.equal(inProgress.host, null)
})

await test("persist writes nothing when parsing fails or returns 0 jams", async () => {
  const calls: string[] = []
  const writer: UpcomingJamsWriter = {
    async upsert() {
      calls.push("upsert")
    },
    async deleteEnded() {
      calls.push("delete")
      return 0
    },
  }

  const failed = await persistUpcomingJams(writer, { ok: false, error: "boom" }, now)
  assert.deepEqual(failed, { wrote: false, reason: "failed" })
  assert.deepEqual(calls, [])

  const empty = await persistUpcomingJams(writer, { ok: true, jams: [] }, now)
  assert.deepEqual(empty, { wrote: false, reason: "empty" })
  assert.deepEqual(calls, [])
})

await test("persist upserts then purges ended rows only after a successful parse", async () => {
  const parsed = parseItchJamsListing(fixture)
  assert.equal(parsed.ok, true)
  if (!parsed.ok) return
  const upserted: UpcomingJamRow[][] = []
  const deletedAt: string[] = []
  const writer: UpcomingJamsWriter = {
    async upsert(rows) {
      upserted.push(rows)
    },
    async deleteEnded(nowIso) {
      deletedAt.push(nowIso)
      return upserted[0].filter((row) => row.end_at <= nowIso).length
    },
  }

  const result = await persistUpcomingJams(writer, parsed, now)
  assert.equal(result.wrote, true)
  if (!result.wrote) return
  assert.equal(upserted.length, 1)
  assert.equal(upserted[0].length, 5)
  assert.equal(deletedAt[0], now.toISOString())
  assert.equal(result.upserted, 5)
  assert.equal(result.purged, 1)
  assert.ok(upserted[0].some((row) => row.itch_id === 11 && row.end_at === "2026-01-02T00:00:00.000Z"))
})

await test("fetch helper uses the identified UA and a single listing URL", async () => {
  const calls: { url: string; ua: string | null }[] = []
  const fetchImpl: typeof fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
    calls.push({
      url,
      ua: new Headers(init?.headers).get("User-Agent"),
    })
    return new Response("<html></html>", { status: 200 })
  }) as typeof fetch

  const result = await fetchItchJamsListingHtml(fetchImpl)
  assert.equal(result.ok, true)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, ITCH_JAMS_LISTING_URL)
  assert.equal(calls[0].ua, ITCH_JAMS_USER_AGENT)
})

await test("cron and public routes keep the expected wiring", () => {
  const cron = readFileSync(join(root, "app/api/cron/refresh-upcoming-jams/route.ts"), "utf8")
  const publicRoute = readFileSync(join(root, "app/api/jams/upcoming/route.ts"), "utf8")
  const vercel = readFileSync(join(root, "vercel.json"), "utf8")
  const migration = readFileSync(
    join(root, "supabase/migrations/20261126133000_upcoming_jams.sql"),
    "utf8",
  )

  assert.match(cron, /process\.env\.CRON_SECRET/)
  assert.match(cron, /Authorization: Bearer/)
  assert.match(cron, /createAdminClient/)
  assert.match(cron, /fetchItchJamsListingHtml/)
  assert.match(cron, /persistUpcomingJams/)
  assert.doesNotMatch(cron, /jams\.json/)

  assert.match(publicRoute, /from\("upcoming_jams"\)/)
  assert.match(publicRoute, /s-maxage=300/)
  assert.match(publicRoute, /stale-while-revalidate/)
  assert.match(publicRoute, /\.gt\("end_at"/)
  assert.match(publicRoute, /\.order\("joined_count"/)
  assert.match(publicRoute, /\.limit\(10\)/)
  assert.doesNotMatch(publicRoute, /ITCH_JAMS_LISTING_URL|fetchItchJamsListingHtml|fetch\(/)

  const vercelJson = JSON.parse(vercel) as { crons: { path: string; schedule: string }[] }
  assert.ok(
    vercelJson.crons.some(
      (job) => job.path === "/api/cron/refresh-upcoming-jams" && job.schedule === "0 * * * *",
    ),
  )

  assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.upcoming_jams/)
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/)
  assert.match(migration, /TO anon, authenticated/)
  assert.match(migration, /GRANT SELECT ON TABLE public\.upcoming_jams TO anon, authenticated/)
})

if (failed > 0) {
  console.error(`\n${failed} test(s) failed`)
  process.exit(1)
}
console.log("\nAll upcoming jams tests passed")
