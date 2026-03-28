"use client"

import { Gamepad2, Users, Zap } from "lucide-react"
import { MockDashboard } from "@/components/showcase/mock-dashboard"

const DOT_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%2394a3b8' fill-opacity='0.35'/%3E%3C/svg%3E")`

export function LandingShowcase() {
  return (
    <section
      className="relative overflow-hidden px-4 py-20 lg:px-8 lg:py-28"
      style={{ backgroundImage: DOT_PATTERN, backgroundColor: "var(--background)" }}
    >
      {/* Top divider */}
      <div className="mx-auto mb-16 max-w-6xl">
        <div className="h-0.5 w-full border-t-2 border-dashed border-slate-300" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-14 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-4 py-1.5 text-sm font-bold text-foreground shadow-[3px_3px_0px_0px_var(--neo-shadow)]">
            <Gamepad2 className="size-4 text-teal" />
            Your Command Center
          </div>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Manage your teams{" "}
            <span className="text-teal">in one place.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
            Track applications, communicate with teammates, and level up your jam experience.
          </p>
        </div>

        {/* Browser Frame */}
        <div className="relative">
          {/* Neo-brutalist offset shadow */}
          <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-xl border-2 border-teal opacity-40" />

          {/* Browser chrome */}
          <div className="relative rounded-xl border-2 border-foreground bg-card overflow-hidden">
            {/* Browser header */}
            <div className="flex items-center gap-2 border-b-2 border-foreground bg-muted px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-full border-2 border-foreground bg-pink/30" />
                <div className="size-3 rounded-full border-2 border-foreground bg-peach/30" />
                <div className="size-3 rounded-full border-2 border-foreground bg-teal/30" />
              </div>
              <div className="mx-4 flex-1">
                <div className="mx-auto max-w-sm rounded-lg border border-slate-300 bg-background px-4 py-1.5 text-center text-xs font-mono text-muted-foreground">
                  gamejamcrew.com/dashboard
                </div>
              </div>
              <div className="w-[52px]" />
            </div>

            {/* Dashboard content */}
            <div className="bg-background">
              <MockDashboard />
            </div>
          </div>
        </div>

        {/* Floating notification cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Notification 1 */}
          <div className="group relative">
            <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-xl border-2 border-teal opacity-40" />
            <div className="relative rounded-xl border-2 border-foreground bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg border-2 border-teal/30 bg-teal/10">
                  <Zap className="size-5 text-teal" />
                </div>
                <div>
                  <p className="font-extrabold text-foreground text-sm">+50 XP Earned!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Your team just joined a new jam.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notification 2 */}
          <div className="group relative">
            <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-xl border-2 border-pink opacity-40" />
            <div className="relative rounded-xl border-2 border-foreground bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg border-2 border-pink/30 bg-pink/10">
                  <Users className="size-5 text-pink" />
                </div>
                <div>
                  <p className="font-extrabold text-foreground text-sm">New Invite!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Neon Runners wants you on their squad.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="mx-auto mt-16 max-w-6xl">
        <div className="h-0.5 w-full border-t-2 border-dashed border-slate-300" />
      </div>
    </section>
  )
}
