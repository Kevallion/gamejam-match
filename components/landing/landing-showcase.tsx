"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { 
  Users, 
  Bell, 
  Gamepad2, 
  LayoutDashboard, 
  MessageSquare,
  Trophy,
  Zap,
  UserPlus,
  Calendar
} from "lucide-react"

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
          <LayoutDashboard className="size-4" />
          Your Command Center
        </div>
        <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl">
          Everything you need to
          <br />
          <span className="text-primary">dominate game jams</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          A sleek dashboard that puts your teams, applications, and progression front and center.
        </p>
      </motion.div>

      {/* Dashboard preview with glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative mx-auto max-w-6xl"
      >
        {/* Glow effect behind */}
        <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-teal/20 via-primary/10 to-peach/20 blur-2xl opacity-50" />
        
        {/* Browser frame */}
        <div className="relative rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/20 overflow-hidden">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-border/50 bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded-full bg-destructive/60" />
              <div className="size-3 rounded-full bg-warning/60" />
              <div className="size-3 rounded-full bg-success/60" />
            </div>
            <div className="mx-4 flex-1">
              <div className="mx-auto max-w-sm rounded-lg bg-background/80 px-4 py-1.5 text-center text-xs font-medium text-muted-foreground">
                gamejamcrew.com/dashboard
              </div>
            </div>
            <div className="w-[52px]" />
          </div>

          {/* Mock dashboard content */}
          <div className="relative bg-background p-4 md:p-6">
            {/* Dashboard grid */}
            <div className="grid gap-4 md:grid-cols-12">
              {/* Left sidebar - Stats */}
              <div className="md:col-span-3 space-y-4">
                {/* User card */}
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl bg-gradient-to-br from-teal/30 to-lavender/30" />
                    <div>
                      <p className="font-bold text-foreground">PixelDev42</p>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1 rounded-md bg-teal/15 px-1.5 py-0.5 text-[10px] font-bold text-teal">
                          <Trophy className="size-2.5" />
                          Lv. 12
                        </div>
                        <span className="text-xs text-muted-foreground">2,450 XP</span>
                      </div>
                    </div>
                  </div>
                  {/* XP bar */}
                  <div className="mt-3">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-teal to-primary" />
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">550 XP to Level 13</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="glass rounded-xl p-4 space-y-3">
                  {[
                    { icon: Users, label: "My Teams", value: "3", color: "text-teal bg-teal/15" },
                    { icon: Bell, label: "Applications", value: "7", color: "text-peach bg-peach/15" },
                    { icon: Calendar, label: "Active Jams", value: "2", color: "text-lavender bg-lavender/15" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-3">
                      <div className={`flex size-9 items-center justify-center rounded-lg ${stat.color}`}>
                        <stat.icon className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-lg font-bold text-foreground">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main content */}
              <div className="md:col-span-9 space-y-4">
                {/* Tab navigation */}
                <div className="flex gap-1 rounded-xl bg-muted/50 p-1">
                  {["My Teams", "Inbox", "Sent", "Available"].map((tab, i) => (
                    <div
                      key={tab}
                      className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold transition-all ${
                        i === 0
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab}
                      {i === 1 && (
                        <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-peach text-peach-foreground text-[10px] font-bold">
                          3
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Team cards grid */}
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    {
                      name: "Neon Runners",
                      jam: "Ludum Dare 57",
                      engine: "Godot",
                      members: 4,
                      roles: ["Developer", "2D Artist"],
                      color: "from-teal/20 to-primary/10",
                    },
                    {
                      name: "Pixel Knights",
                      jam: "GMTK 2026",
                      engine: "Unity",
                      members: 3,
                      roles: ["Audio", "Writer"],
                      color: "from-peach/20 to-pink/10",
                    },
                    {
                      name: "Dreamweaver",
                      jam: "Game Off",
                      engine: "Unreal",
                      members: 5,
                      roles: ["Full"],
                      color: "from-lavender/20 to-primary/10",
                    },
                  ].map((team) => (
                    <div
                      key={team.name}
                      className="group glass rounded-xl p-4 transition-all hover:border-teal/30 hover:shadow-lg hover:shadow-teal/5 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className={`mb-2 inline-block rounded-lg bg-gradient-to-r ${team.color} px-2 py-0.5 text-[10px] font-bold text-foreground/70`}>
                            {team.jam}
                          </div>
                          <h3 className="font-bold text-foreground group-hover:text-teal transition-colors">
                            {team.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">{team.engine}</p>
                        </div>
                        <div className="flex -space-x-1.5">
                          {[...Array(Math.min(team.members, 3))].map((_, i) => (
                            <div
                              key={i}
                              className="size-7 rounded-full border-2 border-card bg-gradient-to-br from-teal/30 to-lavender/30"
                            />
                          ))}
                          {team.members > 3 && (
                            <div className="flex size-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-bold text-muted-foreground">
                              +{team.members - 3}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {team.roles.map((role) => (
                          <span
                            key={role}
                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                              role === "Full"
                                ? "bg-success/15 text-success"
                                : "bg-primary/15 text-primary"
                            }`}
                          >
                            {role === "Full" ? "Team Full" : `Looking: ${role}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Create new team card */}
                  <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border/60 p-6 text-center hover:border-teal/40 hover:bg-teal/5 transition-all cursor-pointer group">
                    <div>
                      <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-teal/10 text-teal group-hover:bg-teal group-hover:text-teal-foreground transition-all">
                        <UserPlus className="size-5" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Create New Team</p>
                      <p className="text-xs text-muted-foreground">Start your next jam</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating notification */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="absolute right-6 top-20 hidden lg:block"
            >
              <div className="glass rounded-xl p-3 shadow-lg max-w-[200px] border-teal/30">
                <div className="flex items-start gap-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal/15 text-teal">
                    <MessageSquare className="size-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-foreground">New Message</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">
                      SynthWave_Alex wants to join your team!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating XP notification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 1 }}
              className="absolute left-6 bottom-20 hidden lg:block"
            >
              <div className="flex items-center gap-2 rounded-full bg-teal/20 px-3 py-1.5 border border-teal/30">
                <Zap className="size-4 text-teal" />
                <span className="text-xs font-bold text-teal">+50 XP</span>
                <span className="text-[10px] text-muted-foreground">Team Created!</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
