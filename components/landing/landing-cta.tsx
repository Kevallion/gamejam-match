"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Gamepad2, Users, Zap, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function LandingCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative overflow-hidden px-4 py-20 lg:px-6 lg:py-32">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <motion.div
          className="absolute left-1/2 top-1/2 size-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal/10 blur-[150px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute left-1/4 top-1/2 size-[400px] -translate-y-1/2 rounded-full bg-peach/10 blur-[100px]"
          animate={{
            scale: [1, 1.15, 1],
            x: ["0%", "10%", "0%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute right-1/4 top-1/2 size-[400px] -translate-y-1/2 rounded-full bg-lavender/10 blur-[100px]"
          animate={{
            scale: [1, 1.15, 1],
            x: ["0%", "-10%", "0%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl">
        {/* Main CTA card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          {/* Card glow */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-teal/30 via-primary/20 to-peach/30 blur-xl opacity-50" />
          
          {/* Card */}
          <div className="relative rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl p-8 md:p-12 lg:p-16 text-center">
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -top-4 left-1/2 -translate-x-1/2"
            >
              <div className="flex items-center gap-2 rounded-full border border-teal/40 bg-card px-4 py-2 shadow-lg">
                <Sparkles className="size-4 text-teal" />
                <span className="text-sm font-semibold text-foreground">Your next jam awaits</span>
              </div>
            </motion.div>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal/20 to-primary/20 border border-teal/30"
            >
              <Gamepad2 className="size-10 text-teal" />
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl"
            >
              Ready to find your
              <br />
              <span className="bg-gradient-to-r from-teal via-primary to-lavender bg-clip-text text-transparent">
                dream squad?
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground"
            >
              Stop searching Discord servers and Reddit threads. Join the platform built specifically for game jam team building.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button
                asChild
                size="lg"
                className="group h-14 min-w-[220px] rounded-2xl bg-teal px-8 text-base font-semibold text-teal-foreground shadow-xl shadow-teal/25 transition-all hover:bg-teal/90 hover:shadow-teal/35 hover:scale-[1.02]"
              >
                <Link href="/create-profile">
                  <Users className="size-5" />
                  Create Your Profile
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 min-w-[180px] rounded-2xl border-border/60 bg-background/50 px-8 text-base font-semibold backdrop-blur-sm transition-all hover:border-teal/40 hover:bg-background/80"
              >
                <Link href="/teams">
                  Browse Teams
                </Link>
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-teal" />
                <span>Free to use</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Star className="size-4 text-peach" />
                <span>No credit card</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-lavender" />
                <span>Instant setup</span>
              </div>
            </motion.div>

            {/* Corner decorations */}
            <div className="absolute left-4 top-4 size-20 rounded-full bg-teal/5 blur-2xl" />
            <div className="absolute right-4 bottom-4 size-20 rounded-full bg-peach/5 blur-2xl" />
          </div>
        </motion.div>

        {/* Bottom pattern */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 flex justify-center gap-3"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="size-2 rounded-full bg-primary/20"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
