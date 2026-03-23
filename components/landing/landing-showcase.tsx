"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { 
  Users, 
  Bell, 
  UserCircle, 
  LayoutDashboard, 
  Send, 
  Gamepad2,
  Sparkles,
  Zap,
  User,
  Palette,
  Music
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
          <Sparkles className="size-4" />
          Your Command Center
        </div>
        <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl">
          Manage your teams
          <br />
          <span className="text-primary">in one place</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Track applications, communicate with teammates, and level up your jam experience.
        </p>
      </motion.div>

      {/* Browser Frame with real Dashboard design */}
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
                gamejamcrew.com/dashboard
              </div>
            </div>
            <div className="w-[52px]" />
          </div>

          {/* Dashboard content - exact design from MockDashboard */}
          <div className="bg-background">
            {/* Navbar */}
            <header className="flex h-12 items-center justify-between border-b border-border/50 bg-background/80 px-4">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
                  <Gamepad2 className="size-3.5 text-primary" />
                </div>
                <span className="text-xs font-extrabold tracking-tight text-foreground">GameJamCrew</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-[10px] text-muted-foreground sm:inline">
                  Hello, <span className="text-foreground font-medium">PixelDev42</span> !
                </span>
                <div className="rounded-lg border border-primary/30 bg-primary/5 px-2 py-1 text-[10px] font-medium text-primary">
                  Dashboard
                </div>
                <div className="relative">
                  <Bell className="size-3.5 text-muted-foreground" />
                  <span className="absolute -right-0.5 -top-0.5 flex size-2">
                    <span className="absolute inline-flex size-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                  </span>
                </div>
              </div>
            </header>

            {/* Dashboard header */}
            <section className="relative overflow-hidden px-4 pb-4 pt-8">
              <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
                <div className="absolute left-1/2 top-0 size-[200px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-peach/20 blur-[80px]" />
              </div>
              <div className="relative">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-peach/20 bg-peach/10 px-2.5 py-0.5 text-[9px] font-medium text-peach">
                  <LayoutDashboard className="size-3" />
                  Command Center
                </div>
                <h1 className="text-lg font-extrabold tracking-tight text-foreground">Dashboard</h1>
              </div>
            </section>

            {/* Stats row */}
            <div className="px-4 pb-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Users, label: "My Teams", value: "3", color: "bg-teal/15 text-teal" },
                  { icon: Bell, label: "Applications", value: "5", color: "bg-peach/15 text-peach" },
                  { icon: UserCircle, label: "Profiles", value: "1", color: "bg-lavender/15 text-lavender" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-3">
                    <div className="flex items-center gap-2">
                      <div className={`flex size-8 items-center justify-center rounded-lg ${stat.color}`}>
                        <stat.icon className="size-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-medium text-muted-foreground">{stat.label}</p>
                        <p className="text-sm font-bold text-foreground">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="px-4">
              <div className="flex gap-1 rounded-lg border border-border/50 bg-muted/50 p-0.5">
                {["My Teams", "Inbox", "Profiles", "Sent"].map((tab, i) => (
                  <div
                    key={tab}
                    className={`flex-1 rounded-md px-2 py-1.5 text-center text-[10px] font-semibold transition-all ${
                      i === 1
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    {tab}
                  </div>
                ))}
              </div>
            </div>

            {/* Inbox content */}
            <div className="px-4 py-4">
              <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-peach/10">
                    <Bell className="size-3.5 text-peach" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-foreground">Incoming Applications</h2>
                    <p className="text-[9px] text-muted-foreground">Review requests to join your squads</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {[
                    { name: "SynthWave_Alex", team: "Neon Runners", role: "Developer", roleColor: "bg-teal/15 text-teal", icon: User, iconColor: "text-teal" },
                    { name: "ArtistKira", team: "The Pixel Knights", role: "2D Artist", roleColor: "bg-pink/15 text-pink", icon: Palette, iconColor: "text-pink" },
                    { name: "BeatMaker99", team: "Neon Runners", role: "Audio", roleColor: "bg-lavender/15 text-lavender", icon: Music, iconColor: "text-lavender" },
                  ].map((app, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                      className={`flex items-center justify-between rounded-lg border p-2.5 ${
                        i === 0 ? "border-primary/30 bg-primary/5" : "border-border/40 bg-background"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex size-7 items-center justify-center rounded-full bg-secondary ${app.iconColor}`}>
                          <app.icon className="size-3.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-foreground">{app.name}</p>
                          <p className="text-[9px] text-muted-foreground">{app.team}</p>
                        </div>
                        <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${app.roleColor}`}>
                          {app.role}
                        </span>
                      </div>
                      <div className="hidden items-center gap-1 sm:flex">
                        <div className="rounded-md bg-success/15 px-2 py-0.5 text-[9px] font-semibold text-success">
                          Accept
                        </div>
                        <div className="rounded-md bg-destructive/10 px-2 py-0.5 text-[9px] font-semibold text-destructive">
                          Decline
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sent section teaser */}
            <div className="px-4 pb-4">
              <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-teal/10">
                    <Send className="size-3.5 text-teal" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-foreground">My Sent Applications</h2>
                    <p className="text-[9px] text-muted-foreground">Track your applications</p>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.9 }}
                  className="flex items-center justify-between rounded-lg border border-border/40 bg-background p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-foreground">Dreamweaver Studio</span>
                    <span className="rounded-full bg-peach/15 px-1.5 py-0.5 text-[8px] font-semibold text-peach">
                      3D Artist
                    </span>
                  </div>
                  <span className="rounded bg-success/10 px-2 py-0.5 text-[9px] font-medium text-success">
                    Accepted
                  </span>
                </motion.div>
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
