"use client"

import { Code2Icon, MessageSquareIcon, UsersIcon } from "lucide-react"
import { MockDashboard } from "@/components/showcase/mock-dashboard"

/**
 * LandingShowcase - Neo-brutalist dashboard preview with solid borders and offset shadows.
 * Shows the GameJamCrew command center with notifications and squad status.
 */
export function LandingShowcase() {
  return (
    <section className="relative w-full py-20 px-4 md:px-8 bg-background overflow-hidden">
      {/* Decorative dot pattern background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots-showcase" x="40" y="40" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" className="text-muted-foreground/50" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots-showcase)" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section badge */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-foreground bg-background">
            <Code2Icon className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Your Command Center</span>
          </div>
        </div>

        {/* Main browser frame - neo-brutalist */}
        <div className="relative">
          {/* Browser frame header */}
          <div className="border-2 border-foreground bg-card">
            <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-foreground bg-muted">
              <div className="flex gap-2">
                <div className="w-3 h-3 border border-foreground" />
                <div className="w-3 h-3 border border-foreground" />
                <div className="w-3 h-3 border border-foreground" />
              </div>
              <span className="text-xs font-mono text-foreground ml-2">gamejamcrew.local</span>
            </div>

            {/* Dashboard content area */}
            <div className="bg-background">
              <MockDashboard />
            </div>
          </div>

          {/* Offset shadow (neo-brutalist) */}
          <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-foreground -z-10 opacity-60" />
        </div>

        {/* Floating notification cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Notification 1 - Squad Status */}
          <div className="relative">
            <div className="border-2 border-foreground p-4 bg-accent/5">
              <div className="flex items-start gap-3">
                <UsersIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground text-sm">Squad Assembled!</p>
                  <p className="text-xs text-muted-foreground mt-1">Your team is ready to jam. 3 members online.</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-full h-full border-2 border-foreground -z-10 opacity-40" />
          </div>

          {/* Notification 2 - Game Jam Started */}
          <div className="relative">
            <div className="border-2 border-foreground p-4 bg-primary/5">
              <div className="flex items-start gap-3">
                <Code2Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground text-sm">Game Jam Started</p>
                  <p className="text-xs text-muted-foreground mt-1">48 hours to create magic. You got this!</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-full h-full border-2 border-foreground -z-10 opacity-40" />
          </div>
        </div>
      </div>
    </section>
  )
}
