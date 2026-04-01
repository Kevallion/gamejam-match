"use client"

import { Sparkles, Users, Gamepad2, Search, SlidersHorizontal, LogIn } from "lucide-react"

export function MockHero() {
  return (
    <div className="flex flex-col">
      {/* Navbar */}
      <header className="flex h-12 items-center justify-between border-b border-border/50 bg-background/80 px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
            <Gamepad2 className="size-3.5 text-primary" />
          </div>
          <span className="text-xs font-extrabold tracking-tight text-foreground">GameJamCrew</span>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <span className="text-[10px] text-muted-foreground">Find Teams</span>
          <span className="text-[10px] text-muted-foreground">Find Members</span>
          <span className="text-[10px] text-muted-foreground">Post a Team</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-xl bg-teal px-2.5 py-1 text-[10px] font-semibold text-teal-foreground">
            <LogIn className="size-3 shrink-0" />
            Sign In
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative overflow-hidden px-4 pb-6 pt-10">
        <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
          <div className="absolute left-1/2 top-0 size-[300px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/20 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-lg text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-medium text-primary">
            <Sparkles className="size-3" />
            Browse teams looking for members
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            Find Your Game Jam <span className="text-primary">Squad</span>
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
            Connect with developers, artists, and designers. Build amazing games together.
          </p>
          <div className="mt-4">
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/25">
              <Users className="size-3.5" />
              Create a Squad
            </div>
          </div>
        </div>
      </section>

      {/* Search + Filters bar */}
      <div className="border-y border-border/50 bg-background/95 px-4 py-4">
        <div className="mx-auto max-w-lg">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <div className="h-8 rounded-xl border border-border/60 bg-card pl-8 pr-3 flex items-center">
              <span className="text-[10px] text-primary">Ludum Dare</span>
              <span className="ml-0.5 h-3.5 w-px animate-pulse bg-primary" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-3 text-muted-foreground" />
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Filter teams</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {["Any Engine", "Any Role", "Any Experience", "English"].map((f, i) => (
              <div
                key={f}
                className={`rounded-lg border px-2.5 py-1 text-[10px] font-medium ${
                  i === 3
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/60 bg-card text-muted-foreground"
                }`}
              >
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
