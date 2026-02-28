import { TeamCard, type TeamCardData } from "@/components/team-card"

const TEAMS: TeamCardData[] = [
  {
    id: 1,
    name: "Pixel Wanderers",
    jam: "Ludum Dare 57",
    engine: "Godot",
    language: "English",
    description:
      "Building a cozy exploration game about a tiny robot lost in a forest. Looking for a 2D artist who loves pixel art and warm palettes!",
    members: 2,
    maxMembers: 4,
    roles: [
      { label: "2D Artist", emoji: "\uD83C\uDFA8", color: "bg-pink/15 text-pink" },
      { label: "Audio", emoji: "\uD83C\uDFB5", color: "bg-lavender/15 text-lavender" },
    ],
    level: { label: "Beginner", emoji: "\uD83C\uDF31", color: "bg-mint/15 text-mint" },
  },
  {
    id: 2,
    name: "Neon Cats Studio",
    jam: "GMTK Game Jam 2026",
    engine: "Unity",
    language: "English",
    description:
      "Fast-paced arcade game where you're a cat dodging lasers in space. We need a developer comfortable with C# and Unity physics.",
    members: 3,
    maxMembers: 5,
    roles: [
      { label: "Developer", emoji: "\uD83D\uDCBB", color: "bg-teal/15 text-teal" },
      { label: "Game Designer", emoji: "\uD83C\uDFAF", color: "bg-peach/15 text-peach" },
    ],
    level: {
      label: "Hobbyist",
      emoji: "\uD83D\uDEE0\uFE0F",
      color: "bg-peach/15 text-peach",
    },
  },
  {
    id: 3,
    name: "Dream Weavers",
    jam: "Global Game Jam 2026",
    engine: "Godot",
    language: "French",
    description:
      "Narrative-driven adventure set inside a child's dreamscape. Seeking a writer who can craft touching, whimsical dialogue in French or English.",
    members: 1,
    maxMembers: 3,
    roles: [
      { label: "Writer", emoji: "\u270D\uFE0F", color: "bg-pink/15 text-pink" },
      { label: "2D Artist", emoji: "\uD83C\uDFA8", color: "bg-lavender/15 text-lavender" },
    ],
    level: {
      label: "Intermediate",
      emoji: "\u2B50",
      color: "bg-lavender/15 text-lavender",
    },
  },
  {
    id: 4,
    name: "Chiptune Bandits",
    jam: "Ludum Dare 57",
    engine: "PICO-8",
    language: "English",
    description:
      "Retro platformer with chiptune music and a speedrun twist. We need someone who can compose catchy 8-bit tracks and sound effects.",
    members: 2,
    maxMembers: 3,
    roles: [
      { label: "Audio", emoji: "\uD83C\uDFB5", color: "bg-lavender/15 text-lavender" },
    ],
    level: {
      label: "Experienced",
      emoji: "\uD83D\uDE80",
      color: "bg-teal/15 text-teal",
    },
  },
  {
    id: 5,
    name: "Mossy Pebbles",
    jam: "Brackeys Game Jam 2026",
    engine: "GameMaker",
    language: "Spanish",
    description:
      "A wholesome gardening sim about growing magical plants on a floating island. Looking for a 2D artist and a developer to join the fun!",
    members: 1,
    maxMembers: 4,
    roles: [
      { label: "Developer", emoji: "\uD83D\uDCBB", color: "bg-teal/15 text-teal" },
      { label: "2D Artist", emoji: "\uD83C\uDFA8", color: "bg-pink/15 text-pink" },
    ],
    level: { label: "Beginner", emoji: "\uD83C\uDF31", color: "bg-mint/15 text-mint" },
  },
  {
    id: 6,
    name: "Void Runners",
    jam: "GMTK Game Jam 2026",
    engine: "Unreal Engine",
    language: "English",
    description:
      "Sci-fi roguelike with procedural dungeons and a unique gravity mechanic. Looking for a 3D artist who can model low-poly environments fast.",
    members: 3,
    maxMembers: 5,
    roles: [
      { label: "3D Artist", emoji: "\uD83D\uDDFF", color: "bg-peach/15 text-peach" },
      { label: "Audio", emoji: "\uD83C\uDFB5", color: "bg-lavender/15 text-lavender" },
    ],
    level: {
      label: "Experienced",
      emoji: "\uD83D\uDE80",
      color: "bg-teal/15 text-teal",
    },
  },
  {
    id: 7,
    name: "Starlit Sparrows",
    jam: "Global Game Jam 2026",
    engine: "Godot",
    language: "Portuguese",
    description:
      "A peaceful puzzle game about constellations and storytelling. Searching for someone with audio/music skills to bring the night sky to life.",
    members: 2,
    maxMembers: 3,
    roles: [
      { label: "Audio", emoji: "\uD83C\uDFB5", color: "bg-lavender/15 text-lavender" },
    ],
    level: {
      label: "Hobbyist",
      emoji: "\uD83D\uDEE0\uFE0F",
      color: "bg-peach/15 text-peach",
    },
  },
  {
    id: 8,
    name: "Bubblegum Wizards",
    jam: "Brackeys Game Jam 2026",
    engine: "Unity",
    language: "German",
    description:
      "Colorful co-op spell-casting game where every wand is candy-themed. We need a developer who knows Unity networking and a pixel artist!",
    members: 2,
    maxMembers: 4,
    roles: [
      { label: "Developer", emoji: "\uD83D\uDCBB", color: "bg-teal/15 text-teal" },
      { label: "2D Artist", emoji: "\uD83C\uDFA8", color: "bg-pink/15 text-pink" },
    ],
    level: {
      label: "Intermediate",
      emoji: "\u2B50",
      color: "bg-lavender/15 text-lavender",
    },
  },
  {
    id: 9,
    name: "Firefly Forge",
    jam: "Ludum Dare 57",
    engine: "Godot",
    language: "Japanese",
    description:
      "A survival-crafting game set in a bioluminescent cave. Seeking a game designer who loves systems design and a chill, creative workflow.",
    members: 1,
    maxMembers: 3,
    roles: [
      {
        label: "Game Designer",
        emoji: "\uD83C\uDFAF",
        color: "bg-peach/15 text-peach",
      },
      { label: "Developer", emoji: "\uD83D\uDCBB", color: "bg-teal/15 text-teal" },
    ],
    level: { label: "Beginner", emoji: "\uD83C\uDF31", color: "bg-mint/15 text-mint" },
  },
]

export function TeamGrid() {
  return (
    <section className="px-4 pb-16 pt-4 lg:px-6 lg:pb-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{TEAMS.length}</span>{" "}
            teams
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEAMS.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      </div>
    </section>
  )
}
