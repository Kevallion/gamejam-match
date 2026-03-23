"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { 
  Users, 
  Gamepad2, 
  Sparkles,
  Cpu,
  Globe,
  ArrowRight,
  Zap,
  Bell
} from "lucide-react"

const MOCK_TEAMS = [
  {
    name: "The Pixel Knights",
    jam: "Ludum Dare 57",
    engine: "Godot",
    language: "English",
    description: "Cozy pixel-art RPG with a unique twist on turn-based combat. Looking for passionate jammers!",
    members: 2,
    maxMembers: 4,
    roles: [
      { label: "2D Artist", emoji: "\uD83C\uDFA8", color: "bg-pink/15 text-pink" },
      { label: "Audio", emoji: "\uD83C\uDFB5", color: "bg-lavender/15 text-lavender" },
    ],
    level: { label: "Junior / Student", emoji: "\uD83D\uDCDA", color: "bg-emerald-500/15 text-emerald-400" },
  },
  {
    name: "Neon Runners",
    jam: "GMTK 2026",
    engine: "Unity",
    language: "English",
    description: "Fast-paced cyberpunk runner. Neon aesthetics, synthwave soundtrack.",
    members: 3,
    maxMembers: 5,
    roles: [
      { label: "Developer", emoji: "\uD83D\uDCBB", color: "bg-teal/15 text-teal" },
      { label: "Game Designer", emoji: "\uD83C\uDFAF", color: "bg-peach/15 text-peach" },
    ],
    level: { label: "Regular Jammer", emoji: "\uD83C\uDFAE", color: "bg-blue-500/15 text-blue-400" },
    highlighted: true,
  },
]

const MOCK_PLAYERS = [
  {
    name: "SynthWave_Alex",
    initials: "SA",
    role: { label: "Developer", emoji: "\uD83D\uDCBB", color: "bg-teal text-teal-foreground" },
    level: { label: "Regular Jammer", emoji: "\uD83C\uDFAE", color: "bg-blue-500/15 text-blue-400" },
    engine: "Godot",
    language: "English",
    bio: "Full-stack dev with a passion for procedural generation.",
    bgColor: "bg-teal/10",
  },
  {
    name: "ArtistKira",
    initials: "AK",
    role: { label: "2D Artist", emoji: "\uD83C\uDFA8", color: "bg-pink text-pink-foreground" },
    level: { label: "Junior / Student", emoji: "\uD83D\uDCDA", color: "bg-emerald-500/15 text-emerald-400" },
    engine: "Any",
    language: "French",
    bio: "Pixel art enthusiast. Love retro aesthetics.",
    bgColor: "bg-pink/10",
  },
]

export function LandingShowcase() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative overflow-hidden px-4 py-20 lg:px-6 lg:py-32">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl text-center mb-16"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-peach/30 bg-peach/10 px-4 py-1.5 text-sm font-medium text-peach">
          <Sparkles className="size-4" />
          Your Squad Awaits
        </div>
        <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl">
          Discover talented jammers
          <br />
          <span className="text-primary">ready to create</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Browse profiles, explore teams, and find collaborators who match your creative vision.
        </p>
      </motion.div>

      {/* Browser Frame Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative mx-auto max-w-5xl"
      >
        {/* Glow effect behind */}
        <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-r from-teal/15 via-primary/10 to-peach/15 blur-3xl opacity-60" />
        
        {/* Browser chrome */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-primary/10">
          {/* Browser header */}
          <div className="flex items-center gap-2 border-b border-border/50 bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded-full bg-destructive/60" />
              <div className="size-3 rounded-full bg-warning/60" />
              <div className="size-3 rounded-full bg-success/60" />
            </div>
            <div className="mx-4 flex-1">
              <div className="mx-auto max-w-sm rounded-lg bg-background/80 px-4 py-1.5 text-center text-xs font-medium text-muted-foreground">
                gamejamcrew.com
              </div>
            </div>
            <div className="w-[52px]" />
          </div>

          {/* App content */}
          <div className="bg-background">
            {/* Navbar mock */}
            <header className="flex h-12 items-center justify-between border-b border-border/50 bg-background/80 px-4">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
                  <Gamepad2 className="size-3.5 text-primary" />
                </div>
                <span className="text-xs font-extrabold tracking-tight text-foreground">GameJamCrew</span>
              </div>
              <div className="hidden items-center gap-3 sm:flex">
                <span className="text-[10px] text-muted-foreground">Find Teams</span>
                <span className="text-[10px] text-primary font-medium">Find Members</span>
                <span className="text-[10px] text-muted-foreground">Post a Team</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bell className="size-3.5 text-muted-foreground" />
                  <span className="absolute -right-0.5 -top-0.5 flex size-2">
                    <span className="absolute inline-flex size-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                  </span>
                </div>
                <div className="size-6 rounded-full bg-gradient-to-br from-teal/40 to-primary/40" />
              </div>
            </header>

            {/* Page content - Teams and Members side by side */}
            <div className="p-4 md:p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Teams column */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-lg bg-teal/10">
                      <Users className="size-3.5 text-teal" />
                    </div>
                    <h3 className="text-xs font-bold text-foreground">Open Teams</h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    {MOCK_TEAMS.map((team, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                        className={`flex flex-col rounded-xl border bg-card p-3 transition-all ${
                          team.highlighted
                            ? "border-primary/50 ring-2 ring-primary/30 shadow-lg shadow-primary/10"
                            : "border-border/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-xs font-bold text-foreground">{team.name}</h4>
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
                              className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${role.color}`}
                            >
                              {role.emoji} {role.label}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2 py-1.5 text-[10px] font-semibold text-primary">
                          <ArrowRight className="size-3" />
                          View details
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Players column */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-lg bg-lavender/10">
                      <Sparkles className="size-3.5 text-lavender" />
                    </div>
                    <h3 className="text-xs font-bold text-foreground">Available Jammers</h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    {MOCK_PLAYERS.map((player, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                        className="flex flex-col rounded-xl border border-border/50 bg-card p-3 transition-all hover:border-primary/30"
                      >
                        {/* Avatar + name */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`flex size-8 items-center justify-center rounded-full text-[9px] font-bold ring-1 ring-border/60 ${player.bgColor}`}>
                            {player.initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-[10px] font-bold text-foreground">{player.name}</h4>
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
                          View profile
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating XP notification */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 1 }}
          className="absolute -right-4 top-20 hidden lg:block"
        >
          <div className="flex items-center gap-2 rounded-full bg-teal/20 border border-teal/30 px-4 py-2 shadow-lg backdrop-blur-sm">
            <Zap className="size-4 text-teal" />
            <span className="text-sm font-bold text-teal">+50 XP</span>
            <span className="text-xs text-muted-foreground">Team joined!</span>
          </div>
        </motion.div>

        {/* Floating team invite */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="absolute -left-4 bottom-24 hidden lg:block"
        >
          <div className="rounded-xl bg-card/95 border border-peach/30 p-3 shadow-lg backdrop-blur-sm max-w-[180px]">
            <div className="flex items-start gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-peach/15 text-peach">
                <Users className="size-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-foreground">New Invite</p>
                <p className="text-[10px] text-muted-foreground">
                  Neon Runners wants you!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
