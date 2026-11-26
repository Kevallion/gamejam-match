import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { createTeamFormSchema, updateTeamJamListingSchema } from "../lib/team-listing-schema.ts"
import {
  dateInputToUtcEnd,
  dateInputToUtcStart,
  endOfUtcCalendarDayIso,
} from "../lib/jam-date-utc.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

const actionSource = readFileSync(join(root, "app/actions/create-team-actions.ts"), "utf8")
const formSource = readFileSync(join(root, "components/create-team-form.tsx"), "utf8")
const schemaSource = readFileSync(join(root, "lib/team-listing-schema.ts"), "utf8")
const announcement = readFileSync(join(root, "components/team-announcement-public.tsx"), "utf8")
const jammer = readFileSync(join(root, "app/jammer/[userId]/page.tsx"), "utf8")
const manage = readFileSync(join(root, "app/teams/[id]/manage/page.tsx"), "utf8")

const requiredSnippets = [
  [actionSource, "create-team-actions.ts", "const jamStartIso = isoTimestampOrNull(jamStartDate)"],
  [actionSource, "create-team-actions.ts", "const jamEndIso = isoTimestampOrNull(jamEndDate)"],
  [actionSource, "create-team-actions.ts", "const expiresAt = jamEndIso ? endOfUtcCalendarDayIso(jamEndIso) : null"],
  [actionSource, "create-team-actions.ts", "expires_at: expiresAt"],
  [actionSource, "create-team-actions.ts", "const teamId = crypto.randomUUID()"],
  [actionSource, "create-team-actions.ts", 'supabase.from("teams").insert([teamData])'],
  [formSource, "create-team-form.tsx", "jamStartDate: dateInputToUtcStart(jamYmd.start)"],
  [formSource, "create-team-form.tsx", "jamEndDate: dateInputToUtcEnd(jamYmd.end)"],
  [formSource, "create-team-form.tsx", "navigateAfterServerAction(hrefAfterSuccessfulTeamCreate"],
  [formSource, "create-team-form.tsx", "startMs > endMs"],
  [schemaSource, "team-listing-schema.ts", "jamStartDate: isoTimestamp"],
  [schemaSource, "team-listing-schema.ts", "jamEndDate: isoTimestamp"],
  [schemaSource, "team-listing-schema.ts", ".getTime() <= new Date(data.jamEndDate).getTime()"],
  [announcement, "team-announcement-public.tsx", "formatJamCalendarDate(iso)"],
  [jammer, "jammer/[userId]/page.tsx", "formatJamCalendarDate(team.jam_end_date)"],
  [manage, "teams/[id]/manage/page.tsx", "const newEnd = dateInputToUtcEnd(dateInputEnd)"],
  [manage, "teams/[id]/manage/page.tsx", "expires_at: newExpiresAt"],
  [manage, "teams/[id]/manage/page.tsx", "startMs > endMs"],
]

for (const [source, file, snippet] of requiredSnippets) {
  if (!source.includes(snippet)) {
    console.error(`FAIL source drift: ${file} is missing ${JSON.stringify(snippet)}`)
    process.exit(1)
  }
}

function baseInput(dates) {
  return {
    teamName: "QA Squad",
    jamName: "QA Jam",
    description: "A dated listing",
    engine: "godot",
    language: "gdscript",
    lookingFor: [{ role: "programmer", level: "any" }],
    ...dates,
  }
}

const start = dateInputToUtcStart("2026-12-01")
const end = dateInputToUtcEnd("2026-12-08")
const sameDay = dateInputToUtcEnd("2026-12-08")
const invertedEnd = dateInputToUtcEnd("2026-11-30")

const cases = [
  {
    name: "dated publish payload stores start and end at 12:00 UTC",
    fn: () => start === "2026-12-01T12:00:00.000Z" && end === "2026-12-08T12:00:00.000Z",
  },
  {
    name: "createTeamFormSchema accepts a dated range and a same-day jam",
    fn: () =>
      createTeamFormSchema.safeParse(baseInput({ jamStartDate: start, jamEndDate: end })).success &&
      createTeamFormSchema.safeParse(baseInput({ jamStartDate: sameDay, jamEndDate: sameDay })).success,
  },
  {
    name: "createTeamFormSchema rejects an inverted date range",
    fn: () =>
      !createTeamFormSchema.safeParse(baseInput({ jamStartDate: start, jamEndDate: invertedEnd })).success,
  },
  {
    name: "updateTeamJamListingSchema accepts the same dated payloads",
    fn: () => {
      const ok = {
        teamId: "11111111-1111-4111-8111-111111111111",
        teamName: "QA Squad",
        gameName: "QA Jam",
        description: "A dated listing",
        lookingFor: [{ role: "programmer", level: "any" }],
        jamStartDate: start,
        jamEndDate: end,
      }
      const same = { ...ok, jamStartDate: sameDay, jamEndDate: sameDay }
      return updateTeamJamListingSchema.safeParse(ok).success && updateTeamJamListingSchema.safeParse(same).success
    },
  },
  {
    name: "master still requires jam dates (ONB-4 optional dates are not on this branch)",
    fn: () => {
      const missing = createTeamFormSchema.safeParse(baseInput({}))
      const empty = createTeamFormSchema.safeParse(baseInput({ jamStartDate: "", jamEndDate: "" }))
      return (
        !missing.success &&
        !empty.success &&
        !schemaSource.includes("optionalIsoTimestamp") &&
        !actionSource.includes("normalizeJamListingDates")
      )
    },
  },
  {
    name: "createTeam sets expires_at to the end of the UTC calendar day, not noon",
    fn: () =>
      endOfUtcCalendarDayIso(end) === "2026-12-08T23:59:59.999Z" &&
      actionSource.includes("expires_at: expiresAt") &&
      !actionSource.includes("expires_at: jamEndIso"),
  },
  {
    name: "createTeam still inserts without PostgREST return=representation",
    fn: () =>
      actionSource.includes('supabase.from("teams").insert([teamData])') &&
      !actionSource.includes('.insert([teamData]).select(') &&
      actionSource.includes("const teamId = crypto.randomUUID()"),
  },
  {
    name: "dated and undated publishes share the HOTFIX-2 success navigation helper",
    fn: () => formSource.includes("navigateAfterServerAction(hrefAfterSuccessfulTeamCreate"),
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
