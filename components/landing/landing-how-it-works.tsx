"use client"

import { Users, MessageCircle, Trophy } from "lucide-react"

/**
 * LandingHowItWorks - Neo-brutalist 3-step process with solid borders and dashed connectors.
 * Shows how GameJamCrew works: Find → Connect → Create → Win.
 */
export function LandingHowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Find Your Match",
      description: "Browse talented creators and apply to squads that match your skills and vibe.",
      icon: Users,
      color: "text-teal"
    },
    {
      number: "02",
      title: "Connect & Collaborate",
      description: "Chat with teammates, share ideas, and build something epic together in real-time.",
      icon: MessageCircle,
      color: "text-accent"
    },
    {
      number: "03",
      title: "Ship & Earn Badges",
      description: "Submit your game, celebrate your victory, and unlock badges for your crew.",
      icon: Trophy,
      color: "text-primary"
    }
  ]

  return (
    <section className="relative w-full py-20 px-4 md:px-8 bg-background overflow-hidden">
      {/* Decorative dot pattern background */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots-steps" x="40" y="40" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" className="text-muted-foreground/40" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots-steps)" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-foreground bg-background mb-6">
            <span className="text-sm font-semibold text-foreground">How It Works</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Your Path to Gaming Glory
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Four simple steps to assemble your squad and create unforgettable games.
          </p>
        </div>

        {/* Steps grid */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 mb-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative">
                  {/* Dashed connector line (hidden on mobile, shown on md+) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 -right-4 w-8 h-0.5">
                      <svg className="w-full h-full" viewBox="0 0 32 2" preserveAspectRatio="none">
                        <line
                          x1="0"
                          y1="1"
                          x2="32"
                          y2="1"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray="4,4"
                          className="text-border"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Step card */}
                  <div className="border-2 border-foreground p-6 bg-card relative group">
                    {/* Step number label */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 border-2 border-foreground bg-background flex items-center justify-center">
                      <span className="text-xs font-bold text-foreground font-mono">{step.number}</span>
                    </div>

                    {/* Icon circle */}
                    <div className="w-16 h-16 border-2 border-foreground mb-4 flex items-center justify-center bg-muted">
                      <Icon className={`w-8 h-8 ${step.color}`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>

                  {/* Offset shadow */}
                  <div className="absolute -bottom-2 -right-2 w-full h-full border-2 border-foreground -z-10 opacity-30" />
                </div>
              )
            })}
          </div>

          {/* Final step - "Your Next Jam Awaits" */}
          <div className="relative mt-12 md:mt-20">
            <div className="border-2 border-foreground p-8 bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 border-2 border-foreground flex items-center justify-center bg-background flex-shrink-0">
                  <span className="text-2xl font-bold text-primary">✓</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Your next jam awaits</h3>
                  <p className="text-muted-foreground mb-4">
                    Every game jam is an opportunity to grow, connect, and create something incredible. Ready to level up?
                  </p>
                  <button className="px-6 py-2 border-2 border-foreground bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors">
                    Start Your Journey
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 w-full h-full border-2 border-foreground -z-10 opacity-40" />
          </div>
        </div>
      </div>
    </section>
  )
}
