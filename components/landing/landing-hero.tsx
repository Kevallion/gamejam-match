"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function LandingHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 pt-24 pb-12 lg:px-6 lg:pt-32 lg:pb-20">
      {/* Animated mesh gradient background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Main gradient blob - teal */}
        <motion.div
          className="absolute left-1/2 top-1/4 size-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal/20 blur-[140px]"
          animate={{
            scale: [1, 1.1, 1],
            x: ["-50%", "-45%", "-50%"],
            y: ["-50%", "-55%", "-50%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Secondary blob - peach */}
        <motion.div
          className="absolute right-0 top-1/3 size-[500px] rounded-full bg-peach/15 blur-[120px]"
          animate={{
            scale: [1, 1.15, 1],
            x: ["0%", "5%", "0%"],
            y: ["0%", "-5%", "0%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        {/* Tertiary blob - lavender */}
        <motion.div
          className="absolute left-0 bottom-1/4 size-[400px] rounded-full bg-lavender/10 blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            x: ["0%", "-5%", "0%"],
            y: ["0%", "5%", "0%"],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        {/* Grid overlay for texture */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-1.5 text-sm font-medium text-teal"
        >
          <Sparkles className="size-4" />
          <span>Level up your game jam experience</span>
          <span className="flex items-center gap-1 rounded-full bg-teal/20 px-2 py-0.5 text-xs font-bold">
            <Zap className="size-3" />
            +500 XP
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Build Games Together.
          <br />
          <span className="bg-gradient-to-r from-teal via-primary to-lavender bg-clip-text text-transparent">
            Ship Faster.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl"
        >
          The smart way to find your perfect game jam squad. Connect with developers, artists, and composers — 
          powered by AI matchmaking and RPG-style progression.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="group h-14 min-w-[200px] rounded-2xl bg-teal px-8 text-base font-semibold text-teal-foreground shadow-xl shadow-teal/25 transition-all hover:bg-teal/90 hover:shadow-teal/35 hover:scale-[1.02]"
          >
            <Link href="/teams">
              Get Started
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-14 min-w-[200px] rounded-2xl border-border/60 bg-card/50 px-8 text-base font-semibold backdrop-blur-sm transition-all hover:border-teal/40 hover:bg-card/80"
          >
            <Link href="/showcase">
              See How It Works
            </Link>
          </Button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="size-8 rounded-full border-2 border-background bg-gradient-to-br from-teal/40 to-lavender/40"
                />
              ))}
            </div>
            <span className="font-medium">500+ jammers</span>
          </div>
          <div className="hidden h-4 w-px bg-border sm:block" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-teal">100+</span>
            <span>teams formed</span>
          </div>
          <div className="hidden h-4 w-px bg-border sm:block" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-peach">50+</span>
            <span>jams supported</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
