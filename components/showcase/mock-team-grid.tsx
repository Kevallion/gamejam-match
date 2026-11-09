"use client"

import { UsersRound, Cpu, Globe, ArrowRight } from "lucide-react"
import { TagIcon } from "@/components/tag-icon"

const MOCK_TEAMS = [
  {
    name: "The Pixel Knights",
    jam: "Ludum Dare 57",
    engine: "Godot",
    language: "English",
    description: "We're making a cozy pixel-art RPG with a unique twist on turn-based combat. Looking for passionate jammers!",
    members: 2,
    maxMembers: 4,
    roles: [{ key: "2d-artist" }, { key: "audio" }],
    level: "junior",
  },
  {
    name: "Neon Runners",
    jam: "GMTK 2026",
    engine: "Unity",
    language: "English",
    description: "Fast-paced cyberpunk runner. Neon aesthetics, synthwave soundtrack. Need help on the art side.",
    members: 3,
    maxMembers: 5,
    roles: [{ key: "developer" }, { key: "game-design" }],
    level: "regular",
  },
  {
    name: "Dreamweaver Studio",
    jam: "Global Game Jam",
    engine: "Unreal Engine",
    language: "French",
    description: "Atmospheric puzzle game inspired by Limbo and Inside. Dark, moody visuals with environmental storytelling.",
    members: 1,
    maxMembers: 3,
    roles: [{ key: "3d-artist" }, { key: "writer" }],
    level: "beginner",
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
      { key: "developer", filled: true },
      { key: "2d-artist" },
      { key: "audio" },
    ],
    level: "junior",
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
                  <p className="text-xs font-medium text-primary">{team.jam}</p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-0.5 rounded-full border border-border/60 px-1.5 py-0.5 text-xs text-muted-foreground">
                  <UsersRound className="size-3" />
                  {team.members}/{team.maxMembers}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                <span className="inline-flex items-center gap-1">
                  <Cpu className="size-3 text-lavender" />
                  {team.engine}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Globe className="size-3 text-teal" />
                  {team.language}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2 mb-2 flex-1">
                {team.description}
              </p>

              <div className="mb-2 flex flex-wrap items-center gap-1">
                <TagIcon kind="level" value={team.level} size="xs" showLabel withTooltip={false} />
                {team.roles.map((role) => (
                  <TagIcon
                    key={role.key}
                    kind="role"
                    value={role.key}
                    size="xs"
                    showLabel
                    withTooltip={false}
                    className={role.filled ? "opacity-40 line-through" : undefined}
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2 py-1.5 text-xs font-semibold text-primary">
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
