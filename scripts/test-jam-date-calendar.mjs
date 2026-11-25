import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  dateInputToUtcEnd,
  dateInputToUtcStart,
  formatJamCalendarDate,
  isoTimestampToDateInput,
  utcCalendarDayEndMs,
  utcCalendarDayStartMs,
} from "../lib/jam-date-utc.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function localLabel(iso, timeZone) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone,
  }).format(new Date(iso))
}

const sources = {
  utc: readFileSync(join(root, "lib/jam-date-utc.ts"), "utf8"),
  listingDates: readFileSync(join(root, "lib/jam-listing-dates.ts"), "utf8"),
  labels: readFileSync(join(root, "lib/listing-dates.ts"), "utf8"),
  status: readFileSync(join(root, "lib/jam-calendar-status.ts"), "utf8"),
}

const requiredSnippets = [
  [sources.utc, "lib/jam-date-utc.ts", "T12:00:00.000Z"],
  [sources.utc, "lib/jam-date-utc.ts", "export function formatJamCalendarDate"],
  [sources.listingDates, "lib/jam-listing-dates.ts", "startYmd > endYmd"],
  [sources.listingDates, "lib/jam-listing-dates.ts", "dateInputToUtcStart(startYmd)"],
  [sources.labels, "lib/listing-dates.ts", "formatJamCalendarDate"],
  [sources.labels, "lib/listing-dates.ts", "startYmd > endYmd"],
  [sources.status, "lib/jam-calendar-status.ts", "utcCalendarDayStartMs(jamStartIso)"],
  [sources.status, "lib/jam-calendar-status.ts", "utcCalendarDayEndMs(jamEndIso)"],
]

for (const [source, file, snippet] of requiredSnippets) {
  if (!source.includes(snippet)) {
    console.error(`FAIL source drift: ${file} is missing ${JSON.stringify(snippet)}`)
    process.exit(1)
  }
}

const ZONES = ["Europe/Paris", "UTC", "America/Los_Angeles"]
const endYmd = "2026-12-08"
const noon = dateInputToUtcEnd(endYmd)
const startNoon = dateInputToUtcStart(endYmd)
const legacyEnd = "2026-12-08T23:59:59.999Z"
const legacyStart = "2026-12-08T00:00:00.000Z"

const cases = [
  {
    name: "start and end of 8 Dec are stored at 12:00 UTC",
    fn: () => noon === "2026-12-08T12:00:00.000Z" && startNoon === noon,
  },
  {
    name: "8 Dec end shows Dec 8 in Paris, UTC and America/Los_Angeles",
    fn: () => ZONES.every((tz) => localLabel(noon, tz) === "Dec 8"),
  },
  {
    name: "formatJamCalendarDate shows Dec 8 even for a legacy 23:59:59.999Z end",
    fn: () =>
      formatJamCalendarDate(legacyEnd) === "Dec 8, 2026" &&
      formatJamCalendarDate(noon) === "Dec 8, 2026" &&
      ZONES.every((tz) => formatJamCalendarDate(noon, { timeZone: tz }) === "Dec 8, 2026"),
  },
  {
    name: "legacy 23:59:59.999Z still shifts to Dec 9 in Europe/Paris without UTC formatting",
    fn: () => localLabel(legacyEnd, "Europe/Paris") === "Dec 9" && localLabel(legacyEnd, "UTC") === "Dec 8",
  },
  {
    name: "legacy 00:00:00.000Z still shifts to Dec 7 in America/Los_Angeles without UTC formatting",
    fn: () =>
      localLabel(legacyStart, "America/Los_Angeles") === "Dec 7" &&
      localLabel(noon, "America/Los_Angeles") === "Dec 8",
  },
  {
    name: "date inputs round-trip the calendar day for noon and legacy instants",
    fn: () =>
      isoTimestampToDateInput(noon) === endYmd &&
      isoTimestampToDateInput(legacyEnd) === endYmd &&
      isoTimestampToDateInput(legacyStart) === endYmd,
  },
  {
    name: "start = end on 8 Dec is accepted",
    fn: () => startNoon === noon && endYmd <= endYmd && !(endYmd > endYmd),
  },
  {
    name: "a one-day jam stays live through the UTC calendar day",
    fn: () => {
      const start = utcCalendarDayStartMs(noon)
      const end = utcCalendarDayEndMs(noon)
      const mid = Date.parse("2026-12-08T18:00:00.000Z")
      const early = Date.parse("2026-12-08T01:00:00.000Z")
      const ended = Date.parse("2026-12-09T00:00:00.000Z")
      const upcoming = Date.parse("2026-12-07T23:00:00.000Z")
      return mid <= end && mid >= start && early <= end && early >= start && ended > end && upcoming < start
    },
  },
  {
    name: "no dates stay empty",
    fn: () => isoTimestampToDateInput(null) === "" && isoTimestampToDateInput("") === "" && formatJamCalendarDate(null) === null,
  },
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

console.log(`${cases.length} tests passed`)
