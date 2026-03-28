"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { 
  Sparkles,
  Zap,
  Users
} from "lucide-react"
import { MockDashboard } from "@/components/showcase/mock-dashboard"

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

          {/* Dashboard content - using real MockDashboard */}
          <div className="bg-background">
            <MockDashboard />
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
