"use client"

import { useState } from "react"
import { Sword, Sparkles, Zap, Star, Gamepad2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth-modal"

const DOT_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%2394a3b8' fill-opacity='0.35'/%3E%3C/svg%3E")`

export function LandingCTA() {
  const [authModalOpen, setAuthModalOpen] = useState(false)

  return (
    <section
      className="relative overflow-hidden px-4 py-20 lg:px-8 lg:py-28"
      style={{ backgroundImage: DOT_PATTERN, backgroundColor: "var(--background)" }}
    >
      {/* Top divider */}
      <div className="mx-auto mb-16 max-w-6xl">
        <div className="h-0.5 w-full border-t-2 border-dashed border-slate-300" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        {/* Main CTA card */}
        <div className="relative">
          {/* Neo-brutalist offset shadow */}
          <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border-2 border-teal opacity-50" />

          {/* Card */}
          <div className="relative rounded-2xl border-2 border-foreground bg-card p-8 md:p-12 lg:p-16 text-center">
            {/* Floating badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-4 py-1.5 text-sm font-bold text-foreground shadow-[3px_3px_0px_0px_var(--neo-shadow)]">
                <Sword className="size-4 text-teal" />
                Your next jam awaits
              </div>
            </div>

            {/* Icon */}
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-xl border-2 border-teal/30 bg-teal/10">
              <Gamepad2 className="size-10 text-teal" />
            </div>

            {/* Headline */}
            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Ready to find your
              <br />
              <span className="text-teal">dream squad?</span>
            </h2>

            {/* Description */}
            <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Join hundreds of indie developers, artists, and designers already building games together on
              GameJamCrew.
            </p>

            {/* CTA Button */}
            <div className="mt-8">
              <Button
                type="button"
                size="lg"
                className="h-14 min-w-[220px] rounded-lg border-2 border-foreground bg-teal px-8 text-base font-extrabold text-white shadow-[4px_4px_0px_0px_var(--neo-shadow)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--neo-shadow)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_var(--neo-shadow)]"
                onClick={() => setAuthModalOpen(true)}
              >
                <Sparkles className="mr-2 size-5" />
                Join the Crew
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-teal" />
                <span>Free to use</span>
              </div>
              <div className="hidden h-4 w-px bg-slate-300 sm:block" />
              <div className="flex items-center gap-2">
                <Star className="size-4 text-pink" />
                <span>No credit card</span>
              </div>
              <div className="hidden h-4 w-px bg-slate-300 sm:block" />
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-lavender" />
                <span>Instant setup</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className="mt-12 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="size-2 rounded-full border border-slate-300 bg-muted"
            />
          ))}
        </div>
      </div>

      {/* Bottom divider */}
      <div className="mx-auto mt-16 max-w-6xl">
        <div className="h-0.5 w-full border-t-2 border-dashed border-slate-300" />
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </section>
  )
}
