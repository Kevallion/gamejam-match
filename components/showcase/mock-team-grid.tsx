"use client"

import { Users, Cpu, Globe, ArrowRight } from "lucide-react"

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
      { label: "2D Artist", emoji: "\uD83C\uDFA8", color: "bg-pink/15 text-pink" },
      { label: "Audio", emoji: "\uD83C\uDFB5", color: "bg-lavender/15 text-lavender" },
    ],
    level: { label: "Junior / Student", emoji: "📚", color: "bg-emerald-500/15 text-emerald-400" },
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
      { label: "Developer", emoji: "\uD83D\uDCBB", color: "bg-teal/15 text-teal" },
      { label: "Game Designer", emoji: "\uD83C\uDFAF", color: "bg-peach/15 text-peach" },
    ],
    level: { label: "Regular Jammer", emoji: "🎮", color: "bg-blue-500/15 text-blue-400" },
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
      { label: "3D Artist", emoji: "\uD83D\uDDFF", color: "bg-peach/15 text-peach" },
      { label: "Writer", emoji: "\u270D\uFE0F", color: "bg-pink/15 text-pink" },
    ],
    level: { label: "Beginner / Learner", emoji: "🌱", color: "bg-sky-400/15 text-sky-400" },
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
      { label: "Developer", emoji: "\uD83D\uDCBB", color: "bg-teal/15 text-teal", filled: true },
      { label: "2D Artist", emoji: "\uD83C\uDFA8", color: "bg-pink/15 text-pink" },
      { label: "Audio", emoji: "\uD83C\uDFB5", color: "bg-lavender/15 text-lavender" },
    ],
    level: { label: "Junior / Student", emoji: "📚", color: "bg-emerald-500/15 text-emerald-400" },
  },
]

export function MockTeamGrid() {
  return (
    <div className="bg-background px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <div className="grid grid-cols-2 gap-3">
          {MOCK_TEAMS.map((team, idx) => (
            <div
              key={idx}
              className={`flex flex-col rounded-xl border bg-card p-3 transition-all ${
                idx === 1
                  ? "border-primary/50 ring-2 ring-primary/30 shadow-lg shadow-primary/10"
                  : "border-border/50"
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-xs font-bold text-foreground">{team.name}</h3>
                  <p className="text-[10px] font-medium text-primary">{team.jam}</p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-0.5 rounded-full border border-border/60 px-1.5 py-0.5 text-[9px] text-muted-foreground">
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
                    className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${
                      "filled" in role && role.filled
                        ? "opacity-40 line-through bg-muted text-muted-foreground"
                        : role.color
                    }`}
                  >
                    {role.emoji} {role.label}
                  </span>
                ))}
              </div>

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
