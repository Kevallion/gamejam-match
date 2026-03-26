"use client"

import {
  Gamepad2,
  Search,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  Check,
  Sparkles,
  Users,
} from "lucide-react"

export function MockDropdownMenu() {
  return (
    <div className="bg-background text-foreground">
      {/* Simplified navbar reference */}
      <header className="flex h-12 items-center justify-between border-b border-border/50 bg-background/80 px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
            <Gamepad2 className="size-3.5 text-primary" />
          </div>
          <span className="text-xs font-extrabold tracking-tight text-foreground">GameJamCrew</span>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative px-4 pt-6 pb-4 text-center">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-medium text-primary">
          <Sparkles className="size-3" />
          Browse teams looking for members
        </div>
        <h1 className="text-lg font-extrabold tracking-tight text-foreground">
          Find Your Game Jam <span className="text-primary">Squad</span>
        </h1>
      </section>

      {/* Search Bar */}
      <div className="px-4 pb-4">
        <div className="mx-auto max-w-lg">
          <div className="relative">
            <div className="absolute inset-0 -m-0.5 rounded-2xl bg-primary/20 blur-sm" />
            <div className="relative flex items-center rounded-xl border-2 border-primary/30 bg-card">
              <Search className="ml-4 size-4 text-muted-foreground" />
              <div className="flex-1 px-3 py-3">
                <span className="text-sm text-muted-foreground">Search by jam name or team...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section - matches real Filters.tsx */}
      <section className="px-4 py-4 border-t border-border/50 bg-muted/20">
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-3.5 text-muted-foreground" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Filter teams
              </span>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">
              18 results
            </span>
          </div>

          {/* Filter dropdowns - matching real component style */}
          <div className="relative flex flex-wrap items-center gap-2">
            {/* Engine Select - OPEN */}
            <div className="relative">
              <button className="flex h-10 items-center justify-between gap-2 rounded-xl border border-primary/40 bg-card px-3 text-[11px] font-medium text-foreground shadow-sm min-w-[140px]">
                <span>Any Engine</span>
                <ChevronDown className="size-3.5 text-primary" />
              </button>

              {/* Dropdown content - open */}
              <div className="absolute left-0 top-full z-50 mt-1 w-[180px] rounded-xl border border-border/60 bg-popover p-1 shadow-xl">
                {[
                  { label: "Any Engine", selected: false },
                  { label: "Unity", selected: false },
                  { label: "Unreal Engine", selected: false },
                  { label: "Godot", selected: true },
                  { label: "GameMaker", selected: false },
                  { label: "Custom / Other", selected: false },
                ].map((opt) => (
                  <div
                    key={opt.label}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-[11px] cursor-pointer transition-colors ${
                      opt.selected
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-popover-foreground hover:bg-accent"
                    }`}
                  >
                    {opt.label}
                    {opt.selected && <Check className="size-3.5 text-primary" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Role Select */}
            <button className="flex h-10 items-center justify-between gap-2 rounded-xl border border-border/60 bg-card px-3 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/30 min-w-[150px]">
              <span>Any Role</span>
              <ChevronDown className="size-3.5" />
            </button>

            {/* Experience Select */}
            <button className="flex h-10 items-center justify-between gap-2 rounded-xl border border-border/60 bg-card px-3 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/30 min-w-[150px]">
              <span>Any Experience</span>
              <ChevronDown className="size-3.5" />
            </button>

            {/* Language Select */}
            <button className="flex h-10 items-center justify-between gap-2 rounded-xl border border-border/60 bg-card px-3 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/30 min-w-[140px]">
              <span>Any Language</span>
              <ChevronDown className="size-3.5" />
            </button>

            {/* Reset button */}
            <button className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              <RotateCcw className="size-3.5" />
              Reset Filters
            </button>
          </div>

          {/* Active filter indicator */}
          <div className="mt-2">
            <p className="text-[10px] text-muted-foreground">
              <span className="font-semibold text-foreground">Active filters:</span>{" "}
              Engine: Godot
            </p>
          </div>
        </div>
      </section>

      {/* Results preview (dimmed) */}
      <div className="px-4 py-4 opacity-50">
        <div className="mx-auto max-w-2xl grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card p-3">
              <div className="mb-2">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="mt-1 h-2.5 w-16 rounded bg-primary/20" />
              </div>
              <div className="flex gap-1">
                <div className="h-5 w-14 rounded-full bg-teal/10" />
                <div className="h-5 w-12 rounded-full bg-pink/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
