"use client"

import { Sparkles, Users, Gamepad2, Search, SlidersHorizontal, Filter, Check, Globe } from "lucide-react"

export function MockHero() {
  return (
    <div className="flex flex-col">
      {/* Navbar */}
      <header className="flex h-12 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
            <Gamepad2 className="size-3.5 text-primary" />
          </div>
          <span className="text-xs font-extrabold tracking-tight text-foreground">GameJamCrew</span>
        </div>
        <div className="hidden items-center gap-4 sm:flex">
          <span className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Find Teams</span>
          <span className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Find Members</span>
          <span className="text-[10px] text-foreground font-medium border-b border-primary">Post a Team</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-[#5865F2] px-3 py-1.5 text-[10px] font-semibold text-white shadow-lg shadow-[#5865F2]/25 transition-transform hover:scale-105">
            Sign in with Discord
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative overflow-hidden px-4 pb-6 pt-10">
        <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
          <div className="absolute left-1/2 top-0 size-[300px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/20 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-lg text-center">
          {/* Live counter badge */}
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-medium text-primary">
              <Sparkles className="size-3" />
              Browse teams looking for members
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[9px] font-bold text-success">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-success" />
              </span>
              42 online
            </span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            Find Your Game Jam <span className="text-primary">Squad</span>
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
            Connect with developers, artists, and designers. Build amazing games together.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl">
              <Users className="size-3.5" />
              Create a Squad
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
              Browse Teams
            </div>
          </div>
        </div>
      </section>

      {/* Search + Filters bar */}
      <div className="border-y border-border/50 bg-background/95 px-4 py-4">
        <div className="mx-auto max-w-lg">
          {/* Search bar with typing animation */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-primary" />
            <div className="h-9 rounded-xl border-2 border-primary/40 bg-card pl-8 pr-3 flex items-center ring-4 ring-primary/10">
              <span className="text-[11px] font-medium text-foreground">Ludum Dare</span>
              <span className="ml-0.5 h-4 w-0.5 animate-pulse bg-primary rounded-full" />
            </div>
            {/* Search suggestions dropdown */}
            <div className="absolute left-0 right-0 top-full mt-1 rounded-lg border border-border/60 bg-popover p-1 shadow-xl z-10">
              <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2">
                <Search className="size-3 text-primary" />
                <span className="text-[10px] font-medium text-foreground">Ludum Dare 57</span>
                <span className="ml-auto text-[8px] text-muted-foreground">32 teams</span>
              </div>
              <div className="flex items-center gap-2 rounded-md px-3 py-1.5 hover:bg-accent">
                <Search className="size-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Ludum Dare 56</span>
                <span className="ml-auto text-[8px] text-muted-foreground">18 teams</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mt-12">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-3 text-muted-foreground" />
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Filter teams</span>
            </div>
            <span className="text-[9px] text-primary font-medium">4 filters active</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { label: "Any Engine", active: false },
              { label: "Any Role", active: false },
              { label: "Any Experience", active: false },
              { label: "English", active: true, icon: Globe },
            ].map((f, i) => (
              <div
                key={f.label}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-medium transition-all ${
                  f.active
                    ? "border-primary bg-primary/15 text-primary shadow-sm ring-2 ring-primary/20"
                    : "border-border/60 bg-card text-muted-foreground hover:border-border"
                }`}
              >
                {f.icon && <f.icon className="size-3" />}
                {f.label}
                {f.active && <Check className="size-3" />}
              </div>
            ))}
          </div>

          {/* Results count */}
          <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
            <Filter className="size-3" />
            Showing <span className="font-bold text-foreground">24 teams</span> matching your filters
          </div>
        </div>
      </div>
    </div>
  )
}
