"use client"

import { Users, Cpu, Globe, ArrowRight, Clock, Sparkles, Heart, Eye, MessageCircle } from "lucide-react"

const MOCK_TEAMS = [
  {
    name: "The Pixel Knights",
    jam: "Ludum Dare 57",
    engine: "Godot",
    language: "English",
    description: "We're making a cozy pixel-art RPG with a unique twist on turn-based combat. Looking for passionate jammers!",
    members: 2,
    maxMembers: 4,
    roles: [
      { label: "2D Artist", emoji: "🎨", color: "bg-pink/15 text-pink" },
      { label: "Audio", emoji: "🎵", color: "bg-lavender/15 text-lavender" },
    ],
    level: { label: "Junior / Student", emoji: "📚", color: "bg-emerald-500/15 text-emerald-400" },
    stats: { views: 124, likes: 18 },
    postedAgo: "2h ago",
    online: true,
  },
  {
    name: "Neon Runners",
    jam: "GMTK 2026",
    engine: "Unity",
    language: "English",
    description: "Fast-paced cyberpunk runner. Neon aesthetics, synthwave soundtrack. Need help on the art side.",
    members: 3,
    maxMembers: 5,
    roles: [
      { label: "Developer", emoji: "💻", color: "bg-teal/15 text-teal" },
      { label: "Game Designer", emoji: "🎯", color: "bg-peach/15 text-peach" },
    ],
    level: { label: "Regular Jammer", emoji: "🎮", color: "bg-blue-500/15 text-blue-400" },
    stats: { views: 256, likes: 42 },
    postedAgo: "5h ago",
    online: true,
    featured: true,
  },
  {
    name: "Dreamweaver Studio",
    jam: "Global Game Jam",
    engine: "Unreal Engine",
    language: "French",
    description: "Atmospheric puzzle game inspired by Limbo and Inside. Dark, moody visuals with environmental storytelling.",
    members: 1,
    maxMembers: 3,
    roles: [
      { label: "3D Artist", emoji: "🗿", color: "bg-peach/15 text-peach" },
      { label: "Writer", emoji: "✍️", color: "bg-pink/15 text-pink" },
    ],
    level: { label: "Beginner / Learner", emoji: "🌱", color: "bg-sky-400/15 text-sky-400" },
    stats: { views: 89, likes: 12 },
    postedAgo: "1d ago",
    online: false,
  },
  {
    name: "Chaos Collective",
    jam: "Brackeys Jam",
    engine: "GameMaker",
    language: "English",
    description: "Wacky physics-based party game. We want to make people laugh! Absurd humor and ragdoll mechanics.",
    members: 2,
    maxMembers: 4,
    roles: [
      { label: "Developer", emoji: "💻", color: "bg-teal/15 text-teal", filled: true },
      { label: "2D Artist", emoji: "🎨", color: "bg-pink/15 text-pink" },
      { label: "Audio", emoji: "🎵", color: "bg-lavender/15 text-lavender" },
    ],
    level: { label: "Junior / Student", emoji: "📚", color: "bg-emerald-500/15 text-emerald-400" },
    stats: { views: 67, likes: 8 },
    postedAgo: "3d ago",
    online: true,
  },
]

export function MockTeamGrid() {
  return (
    <div className="bg-background px-4 py-6">
      <div className="mx-auto max-w-3xl">
        {/* Results header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-foreground">24 Teams Found</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[9px] font-medium text-success">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-success" />
              </span>
              12 active now
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2 py-1 text-[9px] text-muted-foreground">
            Sort: <span className="font-medium text-foreground">Most Recent</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {MOCK_TEAMS.map((team, idx) => (
            <div
              key={idx}
              className={`group relative flex flex-col rounded-xl border bg-card p-3 transition-all duration-200 ${
                idx === 1
                  ? "border-primary/50 ring-2 ring-primary/30 shadow-lg shadow-primary/10 scale-[1.02]"
                  : "border-border/50 hover:border-border hover:shadow-md"
              }`}
            >
              {/* Featured badge */}
              {team.featured && (
                <div className="absolute -top-2 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[8px] font-bold text-primary-foreground shadow-sm">
                  <Sparkles className="size-2.5" />
                  Featured
                </div>
              )}

              {/* Online indicator */}
              {team.online && (
                <div className="absolute right-3 top-3">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-success" />
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between gap-1 mb-2 pr-4">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-xs font-bold text-foreground">{team.name}</h3>
                  <p className="text-[10px] font-medium text-primary">{team.jam}</p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-0.5 rounded-full border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[9px] text-muted-foreground">
                  <Users className="size-2.5" />
                  {team.members}/{team.maxMembers}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[9px] text-muted-foreground mb-1.5">
                <span className="inline-flex items-center gap-1">
                  <Cpu className="size-2.5 text-lavender" />
                  {team.engine}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Globe className="size-2.5 text-teal" />
                  {team.language}
                </span>
                <span className="inline-flex items-center gap-1 ml-auto">
                  <Clock className="size-2.5" />
                  {team.postedAgo}
                </span>
              </div>

              <p className="text-[9px] leading-relaxed text-muted-foreground line-clamp-2 mb-2 flex-1">
                {team.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-2">
                <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${team.level.color}`}>
                  {team.level.emoji} {team.level.label}
                </span>
                {team.roles.map((role, rIdx) => (
                  <span
                    key={rIdx}
                    className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold transition-all ${
                      "filled" in role && role.filled
                        ? "opacity-40 line-through bg-muted text-muted-foreground"
                        : role.color
                    }`}
                  >
                    {role.emoji} {role.label}
                  </span>
                ))}
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 mb-2 pt-1 border-t border-border/30">
                <span className="inline-flex items-center gap-1 text-[8px] text-muted-foreground">
                  <Eye className="size-2.5" />
                  {team.stats.views}
                </span>
                <span className="inline-flex items-center gap-1 text-[8px] text-muted-foreground">
                  <Heart className="size-2.5" />
                  {team.stats.likes}
                </span>
              </div>

              <div className={`flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-all ${
                idx === 1 
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-primary/30 bg-primary/5 text-primary group-hover:bg-primary/10"
              }`}>
                <ArrowRight className="size-3" />
                {idx === 1 ? "Apply Now" : "View details"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
