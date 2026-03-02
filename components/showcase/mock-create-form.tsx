"use client"

import { Plus, Sparkles, Rocket, ChevronDown } from "lucide-react"

export function MockCreateForm() {
  return (
    <div className="bg-background px-4 py-6">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-xl shadow-primary/5">
          <div className="flex flex-col gap-5">
            {/* Team Name - filled */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-foreground">Team / Project Name</label>
              <div className="flex h-8 items-center rounded-lg border border-border/60 bg-secondary/50 px-3 text-xs text-foreground">
                The Pixel Knights
              </div>
            </div>

            {/* Game Jam Name - filled */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-foreground">Game Jam Name</label>
              <div className="flex h-8 items-center rounded-lg border border-border/60 bg-secondary/50 px-3 text-xs text-foreground">
                Ludum Dare 57
              </div>
            </div>

            {/* Engine & Language row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-foreground">Engine</label>
                <div className="flex h-8 items-center justify-between rounded-lg border border-primary/40 bg-secondary/50 px-3 ring-2 ring-primary/20">
                  <span className="text-xs text-foreground">Godot</span>
                  <ChevronDown className="size-3 text-muted-foreground" />
                </div>
                {/* Simulated open dropdown */}
                <div className="relative">
                  <div className="absolute left-0 top-0 z-10 w-full rounded-lg border border-border/60 bg-popover py-1 shadow-xl">
                    {["Godot", "Unity", "Unreal Engine", "GameMaker", "PICO-8"].map((engine, i) => (
                      <div
                        key={engine}
                        className={`px-3 py-1.5 text-[10px] ${
                          i === 0
                            ? "bg-primary/10 font-semibold text-primary"
                            : "text-popover-foreground"
                        }`}
                      >
                        {engine}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-foreground">Spoken Language</label>
                <div className="flex h-8 items-center justify-between rounded-lg border border-border/60 bg-secondary/50 px-3">
                  <span className="text-xs text-foreground">English</span>
                  <ChevronDown className="size-3 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Roles section - pushed down to avoid dropdown overlap */}
            <div className="mt-16 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-foreground">Roles Needed</label>
                <span className="text-[9px] font-medium text-muted-foreground">2 roles added</span>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { role: "2D Artist", level: "Hobbyist" },
                  { role: "Audio / Music", level: "Beginner" },
                ].map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl border border-border/40 bg-secondary/30 p-2.5">
                    <div className="flex flex-1 gap-2">
                      <div className="flex h-7 flex-1 items-center rounded-lg border border-border/50 bg-card px-2 text-[10px] text-foreground">
                        {entry.role}
                      </div>
                      <div className="flex h-7 flex-1 items-center rounded-lg border border-border/50 bg-card px-2 text-[10px] text-foreground">
                        {entry.level}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5 self-start rounded-lg border border-dashed border-border/60 px-2.5 py-1 text-[10px] text-muted-foreground">
                <Plus className="size-3" />
                Add another role
              </div>
            </div>

            {/* Submit button */}
            <div className="flex items-center justify-center gap-1.5 rounded-2xl bg-primary py-3 text-xs font-extrabold text-primary-foreground shadow-lg shadow-primary/25">
              <Sparkles className="size-3.5" />
              Publish Announcement
              <Rocket className="size-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
