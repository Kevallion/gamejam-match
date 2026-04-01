"use client"

import { Globe, Cpu, ArrowRight, UserSearch, Sparkles, Star, Mail, Heart, Trophy, Clock, MessageCircle } from "lucide-react"

const MOCK_PLAYERS = [
  {
    name: "SynthWave_Alex",
    initials: "SA",
    role: { label: "Developer", emoji: "💻", color: "bg-teal text-teal-foreground" },
    level: { label: "Regular Jammer", emoji: "🎮", color: "bg-blue-500/15 text-blue-400" },
    engine: "Godot",
    language: "English",
    bio: "Full-stack dev with a passion for procedural generation. 3 jams under my belt, ready for more!",
    bgColor: "bg-teal/10",
    xpLevel: 5,
    jamsCompleted: 3,
    online: true,
    lastActive: "now",
  },
  {
    name: "ArtistKira",
    initials: "AK",
    role: { label: "2D Artist", emoji: "🎨", color: "bg-pink text-pink-foreground" },
    level: { label: "Junior / Student", emoji: "📚", color: "bg-emerald-500/15 text-emerald-400" },
    engine: "Any",
    language: "French",
    bio: "Pixel art enthusiast. Can animate in Aseprite and create tilesets. Love retro aesthetics.",
    bgColor: "bg-pink/10",
    xpLevel: 3,
    jamsCompleted: 1,
    online: true,
    lastActive: "2m ago",
  },
  {
    name: "BeatMaker99",
    initials: "BM",
    role: { label: "Audio", emoji: "🎵", color: "bg-lavender text-lavender-foreground" },
    level: { label: "Industry Veteran", emoji: "👑", color: "bg-amber-500/15 text-amber-400" },
    engine: "Unity",
    language: "English",
    bio: "Composer & sound designer. Chiptune, orchestral, electronic. I make your game sound amazing.",
    bgColor: "bg-lavender/10",
    xpLevel: 12,
    jamsCompleted: 8,
    online: true,
    lastActive: "now",
    featured: true,
  },
  {
    name: "NarrativeNina",
    initials: "NN",
    role: { label: "Writer", emoji: "✍️", color: "bg-pink text-pink-foreground" },
    level: { label: "Beginner / Learner", emoji: "🌱", color: "bg-sky-400/15 text-sky-400" },
    engine: "Any",
    language: "Spanish",
    bio: "Creative writer and worldbuilder. First jam but tons of experience in tabletop game design.",
    bgColor: "bg-mint/10",
    xpLevel: 1,
    jamsCompleted: 0,
    online: false,
    lastActive: "1h ago",
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
        <div className="relative flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-lavender/30 bg-lavender px-2.5 py-0.5 text-[9px] font-medium text-lavender-foreground">
                <UserSearch className="size-3" />
                Find your next teammate
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[8px] font-bold text-success">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-success" />
                </span>
                18 online
              </span>
            </div>
            <h1 className="text-lg font-extrabold tracking-tight text-foreground">Find Members</h1>
            <p className="mt-1 text-xs text-muted-foreground">Browse available jammers looking for a squad</p>
          </div>
        </div>
      </section>

      {/* Player grid */}
      <div className="px-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {MOCK_PLAYERS.map((player, idx) => (
            <div
              key={idx}
              className={`group relative flex flex-col rounded-xl border bg-card p-3 transition-all duration-200 ${
                idx === 2
                  ? "border-primary/50 ring-2 ring-primary/30 shadow-lg shadow-primary/10 scale-[1.02]"
                  : "border-border/50 hover:border-border hover:shadow-md"
              }`}
            >
              {/* Featured badge */}
              {player.featured && (
                <div className="absolute -top-2 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[8px] font-bold text-white shadow-sm">
                  <Trophy className="size-2.5" />
                  Top Rated
                </div>
              )}

              {/* Avatar + name */}
              <div className="flex items-center gap-2 mb-2">
                <div className="relative">
                  <div className={`flex size-9 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-border/40 ${player.bgColor}`}>
                    {player.initials}
                  </div>
                  {/* Online indicator */}
                  {player.online ? (
                    <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-success" />
                  ) : (
                    <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-muted-foreground/40" />
                  )}
                  {/* Level badge */}
                  <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[7px] font-black text-white border border-card">
                    {player.xpLevel}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="truncate text-[10px] font-bold text-foreground">{player.name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground">
                    <span className="inline-flex items-center gap-0.5">
                      <Globe className="size-2.5 text-teal" />
                      {player.language}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <Clock className="size-2.5" />
                      {player.lastActive}
                    </span>
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

              {/* Stats row */}
              <div className="flex items-center gap-2 text-[8px] text-muted-foreground mb-1.5">
                <span className="inline-flex items-center gap-1">
                  <Cpu className="size-2.5 text-lavender" />
                  {player.engine}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Trophy className="size-2.5 text-amber-500" />
                  {player.jamsCompleted} jams
                </span>
              </div>

              {/* Bio */}
              <p className="flex-1 text-[9px] leading-relaxed text-muted-foreground line-clamp-2 mb-2">
                {player.bio}
              </p>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5">
                <div className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[9px] font-semibold transition-all ${
                  idx === 2
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-primary/30 bg-primary/5 text-primary group-hover:bg-primary/10"
                }`}>
                  <Mail className="size-3" />
                  {idx === 2 ? "Send Invite" : "Invite"}
                </div>
                <div className="flex size-7 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground transition-colors hover:text-pink hover:border-pink/30">
                  <Heart className="size-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
