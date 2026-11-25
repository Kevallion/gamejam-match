import { readdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

/** Must stay in sync with lib/jam-listing-dates.ts */
const JAM_DATES_PAIR_REQUIRED_MSG =
  "Provide both a jam start and a jam end, or leave both empty."
const JAM_START_BEFORE_END_MSG = "Jam start must be on or before jam end."
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

function isBlank(value) {
  return value == null || String(value).trim() === ""
}

function normalizeJamListingDates(input) {
  const hasStart = !isBlank(input.jamStartDate)
  const hasEnd = !isBlank(input.jamEndDate)

  if (!hasStart && !hasEnd) {
    return { ok: true, start: null, end: null }
  }

  if (!hasStart) {
    return { ok: false, error: JAM_DATES_PAIR_REQUIRED_MSG, path: "jamStartDate" }
  }
  if (!hasEnd) {
    return { ok: false, error: JAM_DATES_PAIR_REQUIRED_MSG, path: "jamEndDate" }
  }

  const startMs = Date.parse(String(input.jamStartDate).trim())
  const endMs = Date.parse(String(input.jamEndDate).trim())
  if (Number.isNaN(startMs)) {
    return { ok: false, error: "Invalid date.", path: "jamStartDate" }
  }
  if (Number.isNaN(endMs)) {
    return { ok: false, error: "Invalid date.", path: "jamEndDate" }
  }
  const startYmd = new Date(startMs).toISOString().slice(0, 10)
  const endYmd = new Date(endMs).toISOString().slice(0, 10)
  if (startYmd > endYmd) {
    return { ok: false, error: JAM_START_BEFORE_END_MSG, path: "jamEndDate" }
  }

  return {
    ok: true,
    start: new Date(`${startYmd}T12:00:00.000Z`).toISOString(),
    end: new Date(`${endYmd}T12:00:00.000Z`).toISOString(),
  }
}

function defaultTeamExpiresAtIso(jamEndIso, now = new Date()) {
  if (jamEndIso) return jamEndIso
  return new Date(now.getTime() + THIRTY_DAYS_MS).toISOString()
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const helperSource = readFileSync(join(root, "lib/jam-listing-dates.ts"), "utf8")
const schemaSource = readFileSync(join(root, "lib/team-listing-schema.ts"), "utf8")
const actionSource = readFileSync(join(root, "app/actions/create-team-actions.ts"), "utf8")
const s7Source = readFileSync(
  join(root, "supabase/migrations/20261120140000_profiles_rls_lockdown.sql"),
  "utf8",
)
const laterMigrations = readdirSync(join(root, "supabase/migrations"))
  .filter((name) => name.endsWith(".sql") && name > "20261120140000_profiles_rls_lockdown.sql")
  .map((name) => ({
    name,
    source: readFileSync(join(root, "supabase/migrations", name), "utf8"),
  }))

const requiredSnippets = [
  [helperSource, "lib/jam-listing-dates.ts", "export function normalizeJamListingDates"],
  [helperSource, "lib/jam-listing-dates.ts", "JAM_DATES_PAIR_REQUIRED_MSG"],
  [helperSource, "lib/jam-listing-dates.ts", "startYmd > endYmd"],
  [schemaSource, "lib/team-listing-schema.ts", "optionalIsoTimestamp"],
  [schemaSource, "lib/team-listing-schema.ts", "superRefine(refineJamListingDates)"],
  [actionSource, "app/actions/create-team-actions.ts", "jam_start_date: jamDates.jamStartIso"],
  [actionSource, "app/actions/create-team-actions.ts", "jam_end_date: jamDates.jamEndIso"],
  [actionSource, "app/actions/create-team-actions.ts", "expires_at: jamDates.expiresAt"],
  [actionSource, "app/actions/create-team-actions.ts", "const teamId = crypto.randomUUID()"],
  [actionSource, "app/actions/create-team-actions.ts", "id: teamId"],
  [actionSource, "app/actions/create-team-actions.ts", 'supabase.from("teams").insert([teamData])'],
  [s7Source, "20261120140000_profiles_rls_lockdown.sql", "REVOKE SELECT ON TABLE public.teams FROM anon, authenticated"],
]

for (const [source, file, snippet] of requiredSnippets) {
  if (!source.includes(snippet)) {
    console.error(`FAIL source drift: ${file} is missing ${JSON.stringify(snippet)}`)
    process.exit(1)
  }
}

const start = "2026-12-01T00:00:00.000Z"
const end = "2026-12-07T23:59:59.999Z"
const now = new Date("2026-11-25T12:00:00.000Z")

const cases = [
  {
    name: "no dates: omitted fields store NULL",
    fn: () => {
      const result = normalizeJamListingDates({})
      return result.ok === true && result.start === null && result.end === null
    },
  },
  {
    name: "no dates: empty strings store NULL",
    fn: () => {
      const result = normalizeJamListingDates({ jamStartDate: "  ", jamEndDate: "" })
      return result.ok === true && result.start === null && result.end === null
    },
  },
  {
    name: "no dates: null fields store NULL",
    fn: () => {
      const result = normalizeJamListingDates({ jamStartDate: null, jamEndDate: null })
      return result.ok === true && result.start === null && result.end === null
    },
  },
  {
    name: "valid dates are stored at UTC noon of each calendar day",
    fn: () => {
      const result = normalizeJamListingDates({ jamStartDate: start, jamEndDate: end })
      return (
        result.ok === true &&
        result.start === "2026-12-01T12:00:00.000Z" &&
        result.end === "2026-12-07T12:00:00.000Z"
      )
    },
  },
  {
    name: "start after end is refused",
    fn: () => {
      const result = normalizeJamListingDates({ jamStartDate: end, jamEndDate: start })
      return result.ok === false && result.error === JAM_START_BEFORE_END_MSG && result.path === "jamEndDate"
    },
  },
  {
    name: "start equal to end is accepted as a one-day jam",
    fn: () => {
      const result = normalizeJamListingDates({ jamStartDate: start, jamEndDate: start })
      return result.ok === true && result.start === "2026-12-01T12:00:00.000Z" && result.end === "2026-12-01T12:00:00.000Z"
    },
  },
  {
    name: "only a start date is refused",
    fn: () => {
      const result = normalizeJamListingDates({ jamStartDate: start })
      return result.ok === false && result.error === JAM_DATES_PAIR_REQUIRED_MSG && result.path === "jamEndDate"
    },
  },
  {
    name: "only an end date is refused",
    fn: () => {
      const result = normalizeJamListingDates({ jamEndDate: end, jamStartDate: "" })
      return result.ok === false && result.error === JAM_DATES_PAIR_REQUIRED_MSG && result.path === "jamStartDate"
    },
  },
  {
    name: "without dates, expires_at falls back to 30 days",
    fn: () => defaultTeamExpiresAtIso(null, now) === "2026-12-25T12:00:00.000Z",
  },
  {
    name: "with dates, expires_at stays the jam end",
    fn: () => defaultTeamExpiresAtIso(end, now) === end,
  },
  {
    name: "createTeam insert uses NULL dates from the helper",
    fn: () =>
      actionSource.includes("resolvedJamDates({ jamStartDate, jamEndDate })") &&
      actionSource.includes("jam_start_date: jamDates.jamStartIso") &&
      !actionSource.includes("const jamStartIso = new Date(jamStartDate).toISOString()"),
  },
  {
    name: "update path no longer blocks listings without dates",
    fn: () => !actionSource.includes("MISSING_JAM_DATES_MSG"),
  },
  {
    name: "createTeam returns a server-generated id",
    fn: () =>
      actionSource.includes("const teamId = crypto.randomUUID()") &&
      actionSource.includes("id: teamId") &&
      actionSource.includes("teamId: teamId"),
  },
  {
    name: "createTeam inserts without PostgREST return=representation",
    fn: () =>
      actionSource.includes('supabase.from("teams").insert([teamData])') &&
      !actionSource.includes('.select("id")') &&
      !actionSource.includes(".select('id')"),
  },
  {
    name: "S7 still hides teams.discord_link from other roles",
    fn: () =>
      s7Source.includes("REVOKE SELECT ON TABLE public.teams FROM anon, authenticated") &&
      s7Source.includes("IF col.attname = 'discord_link' THEN"),
  },
  {
    name: "later migrations do not grant other users more team columns",
    fn: () =>
      laterMigrations.every(
        (file) =>
          !/GRANT\s+SELECT\s+ON\s+TABLE\s+public\.teams/i.test(file.source) &&
          !/GRANT\s+SELECT\s*\(\s*discord_link\s*\)/i.test(file.source),
      ),
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

console.log("PASS source matches jam-date helpers and createTeam insert")
console.log(`${cases.length} tests passed`)
