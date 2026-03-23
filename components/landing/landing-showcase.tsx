"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { 
  Users, 
  Gamepad2, 
  Sparkles,
  Trophy,
  Zap,
  Star,
  Code2,
  Palette,
  Music,
  PenTool
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

      {/* Abstract showcase - Discover page inspired cards */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative mx-auto max-w-5xl"
      >
        {/* Glow effect behind */}
        <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-r from-teal/15 via-primary/10 to-peach/15 blur-3xl opacity-60" />
        
        {/* Main container with glassmorphism */}
        <div className="glass relative rounded-3xl p-6 md:p-8 lg:p-10">
          {/* Floating profile cards grid */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Featured jammer card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="md:col-span-2 glass rounded-2xl p-5 border-teal/20"
            >
              <div className="flex items-start gap-4">
                <div className="size-16 shrink-0 rounded-2xl bg-gradient-to-br from-teal/30 to-primary/30 flex items-center justify-center">
                  <Code2 className="size-7 text-teal" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground truncate">Looking for Devs</h3>
                    <div className="flex items-center gap-1 rounded-md bg-teal/15 px-1.5 py-0.5 text-[10px] font-bold text-teal">
                      <Trophy className="size-2.5" />
                      Lv. 8
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Unity / Godot specialists wanted for our Ludum Dare team</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
                      Developer
                    </span>
                    <span className="rounded-lg bg-lavender/15 px-2.5 py-1 text-xs font-semibold text-lavender">
                      Intermediate+
                    </span>
                  </div>
                </div>
              </div>
              {/* Team members preview */}
              <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-4">
                <div className="flex -space-x-2">
                  {[
                    "from-peach/40 to-pink/40",
                    "from-lavender/40 to-primary/40",
                    "from-mint/40 to-teal/40",
                  ].map((gradient, i) => (
                    <div
                      key={i}
                      className={`size-8 rounded-full border-2 border-card bg-gradient-to-br ${gradient}`}
                    />
                  ))}
                  <div className="flex size-8 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-bold text-muted-foreground">
                    +2
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">5 members</span>
              </div>
            </motion.div>

            {/* Role cards stack */}
            <div className="flex flex-col gap-4">
              {[
                { icon: Palette, label: "2D Artist", color: "peach", level: 5 },
                { icon: Music, label: "Composer", color: "lavender", level: 12 },
              ].map((role, idx) => (
                <motion.div
                  key={role.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                  className="glass rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-xl bg-${role.color}/15 flex items-center justify-center`}>
                      <role.icon className={`size-5 text-${role.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{role.label}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={`flex items-center gap-0.5 text-[10px] font-bold text-${role.color}`}>
                          <Star className="size-2.5" />
                          Lv. {role.level}
                        </div>
                        <span className="text-[10px] text-muted-foreground">Available</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom row - More jammer cards */}
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {[
              { icon: Gamepad2, name: "PixelPioneer", role: "Game Designer", jam: "GMTK 2026", color: "teal" },
              { icon: PenTool, name: "ArtfulAnnie", role: "UI/UX Artist", jam: "Game Off", color: "pink" },
              { icon: Code2, name: "ByteBuilder", role: "Programmer", jam: "Ludum Dare", color: "primary" },
              { icon: Music, name: "SoundScape", role: "Audio Lead", jam: "GMTK 2026", color: "lavender" },
            ].map((jammer, idx) => (
              <motion.div
                key={jammer.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.6 + idx * 0.1 }}
                className="glass rounded-xl p-4 group hover:border-teal/30 transition-colors cursor-pointer"
              >
                <div className={`size-10 rounded-xl bg-${jammer.color}/15 flex items-center justify-center mb-3`}>
                  <jammer.icon className={`size-5 text-${jammer.color}`} />
                </div>
                <p className="font-bold text-foreground text-sm group-hover:text-teal transition-colors">{jammer.name}</p>
                <p className="text-xs text-muted-foreground">{jammer.role}</p>
                <div className="mt-2 flex items-center gap-1">
                  <Sparkles className="size-3 text-peach" />
                  <span className="text-[10px] text-peach font-medium">{jammer.jam}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Floating XP notification */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 1 }}
            className="absolute -right-4 top-8 hidden lg:block"
          >
            <div className="flex items-center gap-2 rounded-full bg-teal/20 px-4 py-2 border border-teal/30 shadow-lg">
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
            className="absolute -left-4 bottom-16 hidden lg:block"
          >
            <div className="glass rounded-xl p-3 shadow-lg max-w-[180px] border-peach/30">
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
        </div>
      </motion.div>
    </section>
  )
}
