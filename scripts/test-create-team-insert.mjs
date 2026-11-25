import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const actionSource = readFileSync(join(root, "app/actions/create-team-actions.ts"), "utf8")
const s7Path = join(root, "supabase/migrations/20261120140000_profiles_rls_lockdown.sql")
const s7Source = readFileSync(s7Path, "utf8")

const requiredSnippets = [
  [actionSource, "app/actions/create-team-actions.ts", "const teamId = crypto.randomUUID()"],
  [actionSource, "app/actions/create-team-actions.ts", "id: teamId"],
  [actionSource, "app/actions/create-team-actions.ts", 'supabase.from("teams").insert([teamData])'],
  [actionSource, "app/actions/create-team-actions.ts", "const jamStartIso = new Date(jamStartDate).toISOString()"],
  [actionSource, "app/actions/create-team-actions.ts", "const jamEndIso = new Date(jamEndDate).toISOString()"],
  [s7Source, "20261120140000_profiles_rls_lockdown.sql", "REVOKE SELECT ON TABLE public.teams FROM anon, authenticated"],
  [s7Source, "20261120140000_profiles_rls_lockdown.sql", "IF col.attname = 'discord_link' THEN"],
]

for (const [source, file, snippet] of requiredSnippets) {
  if (!source.includes(snippet)) {
    console.error(`FAIL source drift: ${file} is missing ${JSON.stringify(snippet)}`)
    process.exit(1)
  }
}

const cases = [
  {
    name: "createTeam returns a server-generated id",
    fn: () =>
      actionSource.includes("const teamId = crypto.randomUUID()") &&
      actionSource.includes("id: teamId") &&
      /teamId:\s*teamId/.test(actionSource),
  },
  {
    name: "createTeam inserts without PostgREST return=representation",
    fn: () =>
      actionSource.includes('supabase.from("teams").insert([teamData])') &&
      !actionSource.includes('.insert([teamData]).select(') &&
      !actionSource.includes('.select("id").single()'),
  },
  {
    name: "createTeam still requires jam start and end dates",
    fn: () =>
      actionSource.includes("const jamStartIso = new Date(jamStartDate).toISOString()") &&
      actionSource.includes("const jamEndIso = new Date(jamEndDate).toISOString()") &&
      actionSource.includes("jam_start_date: jamStartIso") &&
      actionSource.includes("jam_end_date: jamEndIso") &&
      !actionSource.includes("normalizeJamListingDates") &&
      !actionSource.includes("jamDates.jamStartIso"),
  },
  {
    name: "S7 still hides teams.discord_link from other roles",
    fn: () =>
      s7Source.includes("REVOKE SELECT ON TABLE public.teams FROM anon, authenticated") &&
      s7Source.includes("IF col.attname = 'discord_link' THEN"),
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

console.log("PASS createTeam insert hotfix")
console.log(`${cases.length} tests passed`)
