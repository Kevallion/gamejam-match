"use client"

import { Plus, Sparkles, Rocket, ChevronDown, Check, Zap, Users, Info } from "lucide-react"

export function MockCreateForm() {
  return (
    <div className="bg-background px-4 py-6">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">Create Your Squad</h2>
            <p className="text-[10px] text-muted-foreground">Fill in the details to find your team</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[8px] font-bold text-success">
            <Zap className="size-2.5" />
            +100 XP
          </span>
        </div>

        {/* Progress indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-medium text-muted-foreground">Form progress</span>
            <span className="text-[9px] font-bold text-primary">75% complete</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted/50">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-teal transition-all" />
          </div>
        </div>

        <div className="rounded-2xl border-2 border-border/50 bg-card p-5 shadow-xl shadow-primary/5">
          <div className="flex flex-col gap-5">
            {/* Team Name - filled with validation */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-foreground">Team / Project Name</label>
                <Check className="size-3 text-success" />
              </div>
              <div className="flex h-9 items-center rounded-lg border border-success/40 bg-secondary/50 px-3 text-xs font-medium text-foreground ring-2 ring-success/20">
                The Pixel Knights
              </div>
            </div>

            {/* Game Jam Name - filled with autocomplete hint */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-foreground">Game Jam Name</label>
                <span className="inline-flex items-center gap-0.5 text-[8px] text-success">
                  <Check className="size-2.5" />
                  Found
                </span>
              </div>
              <div className="relative">
                <div className="flex h-9 items-center rounded-lg border border-success/40 bg-secondary/50 px-3 text-xs font-medium text-foreground ring-2 ring-success/20">
                  Ludum Dare 57
                </div>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-primary/15 px-1.5 py-0.5 text-[8px] font-bold text-primary">
                  Apr 2026
                </span>
              </div>
            </div>

            {/* Engine & Language row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-foreground">Engine</label>
                <div className="flex h-9 items-center justify-between rounded-lg border-2 border-primary/50 bg-secondary/50 px-3 ring-4 ring-primary/20 shadow-lg shadow-primary/10">
                  <span className="text-xs font-medium text-foreground">Godot</span>
                  <ChevronDown className="size-3.5 text-primary" />
                </div>
                {/* Simulated open dropdown */}
                <div className="relative">
                  <div className="absolute left-0 top-0 z-10 w-full rounded-xl border-2 border-border/60 bg-popover py-1.5 shadow-2xl">
                    {[
                      { name: "Godot", icon: "🎮", popular: true },
                      { name: "Unity", icon: "🔷", popular: true },
                      { name: "Unreal Engine", icon: "⚡", popular: false },
                      { name: "GameMaker", icon: "🎨", popular: false },
                      { name: "PICO-8", icon: "👾", popular: false },
                    ].map((engine, i) => (
                      <div
                        key={engine.name}
                        className={`flex items-center gap-2 px-3 py-2 text-[10px] transition-colors ${
                          i === 0
                            ? "bg-primary/15 font-semibold text-primary"
                            : "text-popover-foreground hover:bg-accent"
                        }`}
                      >
                        <span>{engine.icon}</span>
                        <span>{engine.name}</span>
                        {engine.popular && (
                          <span className="ml-auto rounded bg-amber-500/15 px-1 py-0.5 text-[7px] font-bold text-amber-500">
                            Popular
                          </span>
                        )}
                        {i === 0 && <Check className="ml-auto size-3" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-foreground">Spoken Language</label>
                <div className="flex h-9 items-center justify-between rounded-lg border border-success/40 bg-secondary/50 px-3 ring-2 ring-success/20">
                  <span className="text-xs font-medium text-foreground">English</span>
                  <Check className="size-3 text-success" />
                </div>
              </div>
            </div>

            {/* Roles section - pushed down to avoid dropdown overlap */}
            <div className="mt-16 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users className="size-3 text-primary" />
                  <label className="text-[10px] font-bold text-foreground">Roles Needed</label>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-bold text-primary">
                  2 roles added
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { role: "2D Artist", roleEmoji: "🎨", level: "Hobbyist", levelEmoji: "🌟" },
                  { role: "Audio / Music", roleEmoji: "🎵", level: "Beginner", levelEmoji: "🌱" },
                ].map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/30 p-2.5 transition-all hover:border-border">
                    <div className="flex flex-1 gap-2">
                      <div className="flex h-8 flex-1 items-center gap-1.5 rounded-lg border border-border/50 bg-card px-2.5 text-[10px] font-medium text-foreground">
                        <span>{entry.roleEmoji}</span>
                        {entry.role}
                      </div>
                      <div className="flex h-8 flex-1 items-center gap-1.5 rounded-lg border border-border/50 bg-card px-2.5 text-[10px] font-medium text-foreground">
                        <span>{entry.levelEmoji}</span>
                        {entry.level}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5 self-start rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-1.5 text-[10px] font-medium text-primary transition-all hover:bg-primary/10 cursor-pointer">
                <Plus className="size-3" />
                Add another role
              </div>
            </div>

            {/* Tip */}
            <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-2.5 border border-amber-500/20">
              <Info className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[9px] text-amber-700 dark:text-amber-400 leading-relaxed">
                <strong>Tip:</strong> Teams with 2+ roles fill up 3x faster. Consider adding a designer role!
              </p>
            </div>

            {/* Submit button */}
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-xs font-extrabold text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] cursor-pointer">
              <Sparkles className="size-4" />
              Publish Announcement
              <Rocket className="size-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
