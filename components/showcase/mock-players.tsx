"use client"

import { Globe, Cpu, ArrowRight, UserSearch, Sparkles } from "lucide-react"

const MOCK_PLAYERS = [
  {
    name: "SynthWave_Alex",
    initials: "SA",
    role: { label: "Developer", emoji: "\uD83D\uDCBB", color: "bg-teal/15 text-teal" },
    level: { label: "Regular Jammer", emoji: "🎮", color: "bg-blue-500/15 text-blue-400" },
    engine: "Godot",
    language: "English",
    bio: "Full-stack dev with a passion for procedural generation. 3 jams under my belt, ready for more!",
    bgColor: "bg-teal/10",
  },
  {
    name: "ArtistKira",
    initials: "AK",
    role: { label: "2D Artist", emoji: "\uD83C\uDFA8", color: "bg-pink/15 text-pink" },
    level: { label: "Junior / Student", emoji: "📚", color: "bg-emerald-500/15 text-emerald-400" },
    engine: "Any",
    language: "French",
    bio: "Pixel art enthusiast. Can animate in Aseprite and create tilesets. Love retro aesthetics.",
    bgColor: "bg-pink/10",
  },
  {
    name: "BeatMaker99",
    initials: "BM",
    role: { label: "Audio", emoji: "\uD83C\uDFB5", color: "bg-lavender/15 text-lavender" },
    level: { label: "Industry Veteran", emoji: "👑", color: "bg-amber-500/15 text-amber-400" },
    engine: "Unity",
    language: "English",
    bio: "Composer & sound designer. Chiptune, orchestral, electronic. I make your game sound amazing.",
    bgColor: "bg-lavender/10",
  },
  {
    name: "NarrativeNina",
    initials: "NN",
    role: { label: "Writer", emoji: "\u270D\uFE0F", color: "bg-pink/15 text-pink" },
    level: { label: "Beginner / Learner", emoji: "🌱", color: "bg-sky-400/15 text-sky-400" },
    engine: "Any",
    language: "Spanish",
    bio: "Creative writer and worldbuilder. First jam but tons of experience in tabletop game design.",
    bgColor: "bg-mint/10",
  },
]

export function MockPlayers() {
  return (
    <div className="bg-background">
      {/* Section header */}
      <section className="relative overflow-hidden px-4 pb-4 pt-8">
        <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
          <div className="absolute left-1/2 top-0 size-[200px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-lavender/20 blur-[80px]" />
        </div>
        <div className="relative">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-lavender/20 bg-lavender/10 px-2.5 py-0.5 text-[9px] font-medium text-lavender">
            <UserSearch className="size-3" />
            Find your next teammate
          </div>
          <h1 className="text-lg font-extrabold tracking-tight text-foreground">Find Members</h1>
          <p className="mt-1 text-xs text-muted-foreground">Browse available jammers looking for a squad</p>
        </div>
      </section>

      {/* Player grid */}
      <div className="px-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {MOCK_PLAYERS.map((player, idx) => (
            <div
              key={idx}
              className={`flex flex-col rounded-xl border bg-card p-3 transition-all ${
                idx === 2
                  ? "border-primary/50 ring-2 ring-primary/30 shadow-lg shadow-primary/10"
                  : "border-border/50"
              }`}
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-2 mb-2">
                <div className={`flex size-8 items-center justify-center rounded-full text-[9px] font-bold ring-1 ring-border/60 ${player.bgColor}`}>
                  {player.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[10px] font-bold text-foreground">{player.name}</h3>
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                    <Globe className="size-2.5 text-teal" />
                    {player.language}
                  </div>
                </div>
              </div>

              {/* Role + Level badges */}
              <div className="flex flex-wrap items-center gap-1 mb-2">
                <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${player.role.color}`}>
                  {player.role.emoji} {player.role.label}
                </span>
                <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${player.level.color}`}>
                  {player.level.emoji} {player.level.label}
                </span>
              </div>

              {/* Engine */}
              <div className="flex items-center gap-1 text-[9px] text-muted-foreground mb-1.5">
                <Cpu className="size-2.5 text-lavender" />
                {player.engine}
              </div>

              {/* Bio */}
              <p className="flex-1 text-[9px] leading-relaxed text-muted-foreground line-clamp-2 mb-2">
                {player.bio}
              </p>

              <div className="flex items-center justify-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2 py-1.5 text-[10px] font-semibold text-primary">
                <ArrowRight className="size-3" />
                View details
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
