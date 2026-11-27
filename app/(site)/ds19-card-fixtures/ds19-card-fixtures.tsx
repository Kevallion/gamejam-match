"use client"

import { JammerCard, type JammerCardData, type SquadOption } from "@/components/player-card"
import { TeamCard, type TeamCardData } from "@/components/team-card"

const ROLE = { key: "artist", label: "3D Artist", color: "" }
const LEVEL = { key: "regular", label: "Regular Jammer", color: "" }
const STYLE = { key: "comfy", label: "Comfy", color: "" }
const EMPTY_ROLE = { label: "Role", color: "" }
const EMPTY_LEVEL = { label: "Experience", color: "" }

const MY_SQUADS: SquadOption[] = [{ id: "fixture-squad", team_name: "Fixture squad" }]

const DIRECTORY_FIXTURES: JammerCardData[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    username: "Jammer_VeryLongUsernameWithoutSpaces_SixtyPlusCharactersXXXXXX",
    avatar_url: null,
    role: ROLE,
    level: LEVEL,
    jamStyle: STYLE,
    engine: "godot",
    language: "german",
    bio: "Two-line bio that should clamp. This second sentence keeps the reserved bio slot filled on a tall card.",
    jammerTitle: "Town Crier",
    jammerLevel: 3,
    programmingLanguages: ["csharp", "cpp", "gdscript", "python", "rust", "lua"],
    kudosCounts: { Technical: 2, Artistic: 1, Friendly: 4 },
    jam: { title: "GMTK Game Jam 2026", url: "https://itch.io" },
    availability: "2026-12-01 to 2026-12-08",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    username: "QA Onboarding Test",
    avatar_url: null,
    role: ROLE,
    level: LEVEL,
    engine: "",
    language: "",
    bio: "",
    jammerTitle: "Rookie Jammer",
    jammerLevel: 4,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    username: "qa-test-1",
    avatar_url: null,
    role: EMPTY_ROLE,
    level: EMPTY_LEVEL,
    engine: "",
    language: "",
    bio: "",
    jammerTitle: "Rookie Jammer",
    jammerLevel: 2,
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    username: "No Title Or Level",
    avatar_url: null,
    role: EMPTY_ROLE,
    level: EMPTY_LEVEL,
    engine: "",
    language: "",
    bio: "",
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    username: "Bio and dates only",
    avatar_url: null,
    role: EMPTY_ROLE,
    level: EMPTY_LEVEL,
    engine: "",
    language: "english",
    bio: "Short bio.",
    availability: "2026-11-01 to 2026-11-30",
    jammerLevel: 1,
  },
]

const TEAM_FIXTURES: TeamCardData[] = [
  {
    id: "aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
    name: "QA-FORGE-DSQA12-VeryLongSquadNameWithoutSpaces-SixtyPlusCharsXXXX",
    jam: "Dated Jam",
    engine: "godot",
    language: "en",
    description: "Dated listing",
    members: 1,
    maxMembers: 2,
    roles: [{ key: "artist", label: "3D Artist", color: "" }],
    level: { key: "regular", label: "Regular Jammer", color: "" },
    jamStartDate: "2026-12-02T12:00:00.000Z",
    jamEndDate: "2026-12-08T12:00:00.000Z",
    createdAt: "2026-11-27T12:00:00.000Z",
  },
  {
    id: "aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
    name: "QA-FORGE DSQA11 flex",
    jam: "Flex Jam",
    engine: "unity",
    language: "en",
    description: "No dates",
    members: 1,
    maxMembers: 2,
    roles: [{ key: "programmer", label: "Programmer", color: "" }],
    level: { key: "regular", label: "Regular Jammer", color: "" },
  },
  {
    id: "aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3",
    name: "Short",
    jam: "Jam",
    engine: "",
    language: "",
    description: "",
    members: 4,
    maxMembers: 4,
    roles: [],
    level: { label: "Any", color: "" },
  },
]

export function Ds19CardFixtures() {
  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-16">
      <h1 className="font-display text-2xl font-extrabold text-foreground">DS-19 card height fixtures</h1>
      <p className="text-sm text-muted-foreground">
        Preview-only. Directory and team cards with and without optional blocks. Not for production.
      </p>

      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground">Directory</h2>
        <ul
          data-ds19-grid="directory"
          className="app-card-grid grid w-full list-none grid-cols-1 items-stretch gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3"
        >
          {DIRECTORY_FIXTURES.map((player) => (
            <li key={player.id} className="h-full min-h-0 min-w-0">
              <JammerCard player={player} mySquads={MY_SQUADS} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground">Teams</h2>
        <ul
          data-ds19-grid="teams"
          className="app-card-grid grid list-none items-stretch gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TEAM_FIXTURES.map((team) => (
            <li key={team.id} className="h-full min-h-0 min-w-0">
              <TeamCard team={team} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
