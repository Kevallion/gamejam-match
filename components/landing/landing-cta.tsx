"use client"

import { Gamepad2, LogIn, Zap, Star, Sparkles } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth-modal"

/**
 * LandingCTA - Neo-brutalist final call-to-action with chunky card and offset shadows.
 * Encourages users to join and find their gaming squad.
 */
export function LandingCTA() {
  const [authModalOpen, setAuthModalOpen] = useState(false)

  return (
    <section className="relative w-full py-20 px-4 md:px-8 bg-background overflow-hidden border-t-2 border-b-2 border-dashed border-slate-300">
      {/* Decorative dot pattern background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots-cta" x="40" y="40" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" className="text-muted-foreground/40" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots-cta)" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Main CTA card - neo-brutalist chunky */}
        <div className="relative">
          {/* Main card with thick borders */}
          <div className="border-4 border-foreground p-8 md:p-12 bg-card">
            {/* Floating badge */}
            <div className="absolute -top-5 left-8 md:left-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-foreground bg-background">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Your next jam awaits</span>
              </div>
            </div>

            {/* Content wrapper */}
            <div className="text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 border-3 border-foreground bg-muted mb-8 mx-auto">
                <Gamepad2 className="w-10 h-10 text-primary" />
              </div>

              {/* Headline */}
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to find your
                <br />
                <span className="text-primary">dream squad?</span>
              </h2>

              {/* Description */}
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Stop searching Discord servers and Reddit threads. Join the platform built specifically for game jam team building.
              </p>

              {/* CTA Button */}
              <button
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-3 border-2 border-foreground bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 transition-colors shadow-[4px_4px_0px_var(--neo-shadow)]"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-12 pt-8 border-t-2 border-foreground grid grid-cols-3 gap-4 md:gap-8">
              <div className="flex flex-col items-center">
                <Zap className="w-5 h-5 text-primary mb-2" />
                <span className="text-xs md:text-sm font-semibold text-foreground">Free to use</span>
              </div>
              <div className="flex flex-col items-center">
                <Star className="w-5 h-5 text-accent mb-2" />
                <span className="text-xs md:text-sm font-semibold text-foreground">No credit card</span>
              </div>
              <div className="flex flex-col items-center">
                <Sparkles className="w-5 h-5 text-lavender mb-2" />
                <span className="text-xs md:text-sm font-semibold text-foreground">Instant setup</span>
              </div>
            </div>
          </div>

          {/* Offset shadow layer 1 */}
          <div className="absolute -bottom-3 -right-3 w-full h-full border-3 border-foreground -z-10 opacity-50" />

          {/* Offset shadow layer 2 */}
          <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-foreground/30 -z-20 opacity-30" />
        </div>

        {/* Bottom decorative element */}
        <div className="mt-16 flex justify-center gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 border-2 border-foreground/60 rounded-full"
              style={{
                animation: `pulse 2s ease-in-out ${i * 0.2}s infinite`,
                opacity: 0.4 + (i * 0.1)
              }}
            />
          ))}
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </section>
  )
}
