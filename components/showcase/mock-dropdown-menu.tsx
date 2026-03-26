"use client"

import {
  Gamepad2,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Code2,
  Palette,
  Music,
  Pencil,
  Mic,
  Briefcase,
  Check,
  Filter,
  SlidersHorizontal,
  X,
} from "lucide-react"

const AVATAR_COLORS: Record<string, string> = {
  PixelDev42: "from-teal/70 to-primary/70",
}

function InitialsAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .replace(/_/g, " ")
    .split(/[\s_]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")
  const gradient = AVATAR_COLORS[name] ?? "from-lavender/70 to-primary/70"
  return (
    <div
      aria-label={name}
      className={`flex items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white ${gradient} ${className ?? ""}`}
    >
      {initials}
    </div>
  )
}

export function MockDropdownMenu() {
  return (
    <div className="bg-background">
      {/* Navbar */}
      <header className="flex h-12 items-center justify-between border-b border-border/50 bg-background/80 px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
            <Gamepad2 className="size-3.5 text-primary" />
          </div>
          <span className="text-xs font-extrabold tracking-tight text-foreground">GameJamCrew</span>
        </div>
        <div className="hidden items-center gap-4 sm:flex">
          <span className="text-[10px] font-medium text-primary">Find Teams</span>
          <span className="text-[10px] text-muted-foreground">Find Members</span>
          <span className="text-[10px] text-muted-foreground">Post a Team</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="size-4 text-muted-foreground" />
          </div>
          <InitialsAvatar name="PixelDev42" className="size-7 ring-2 ring-border/40" />
        </div>
      </header>

      {/* Search and Filter Section */}
      <div className="border-b border-border/50 bg-muted/30 px-4 py-4">
        <div className="mx-auto max-w-2xl">
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <div className="flex h-10 items-center rounded-xl border border-border/60 bg-background pl-10 pr-3">
              <span className="text-sm text-muted-foreground">Search teams for Ludum Dare 57...</span>
            </div>
          </div>

          {/* Filter row with open dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <SlidersHorizontal className="size-3" />
              Filters
            </div>

            {/* Engine Filter - OPEN */}
            <div className="relative">
              <button className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary shadow-sm">
                <Code2 className="size-3" />
                Engine
                <ChevronDown className="size-3" />
              </button>
              
              {/* Dropdown menu open */}
              <div className="absolute left-0 top-full z-50 mt-1.5 w-48 rounded-xl border border-border/60 bg-popover p-2 shadow-2xl">
                <div className="mb-2 px-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">
                  Select Engine
                </div>
                
                {[
                  { icon: "U", label: "Unity", selected: false, color: "bg-slate-500" },
                  { icon: "UE", label: "Unreal Engine", selected: false, color: "bg-slate-700" },
                  { icon: "G", label: "Godot", selected: true, color: "bg-teal" },
                  { icon: "GM", label: "GameMaker", selected: false, color: "bg-green-600" },
                  { icon: "C", label: "Custom/Other", selected: false, color: "bg-lavender" },
                ].map((engine) => (
                  <div
                    key={engine.label}
                    className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] transition-all ${
                      engine.selected
                        ? "border border-primary/30 bg-primary/10 text-primary"
                        : "text-popover-foreground hover:bg-accent"
                    }`}
                  >
                    <div className={`flex size-5 items-center justify-center rounded-md ${engine.color} text-[8px] font-bold text-white`}>
                      {engine.icon}
                    </div>
                    <span className="flex-1">{engine.label}</span>
                    {engine.selected && (
                      <Check className="size-3.5 text-primary" />
                    )}
                  </div>
                ))}

                <div className="my-2 h-px bg-border/60" />
                <button className="flex w-full items-center justify-center gap-1 rounded-lg bg-primary/10 py-1.5 text-[10px] font-semibold text-primary transition-all hover:bg-primary/20">
                  Apply Filter
                  <ChevronRight className="size-3" />
                </button>
              </div>
            </div>

            {/* Role Filter */}
            <button className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-all hover:border-primary/30">
              <Palette className="size-3" />
              Role
              <ChevronDown className="size-3" />
            </button>

            {/* Experience Filter */}
            <button className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-all hover:border-primary/30">
              <Briefcase className="size-3" />
              Experience
              <ChevronDown className="size-3" />
            </button>

            {/* Active filter chips */}
            <div className="ml-2 flex items-center gap-1.5">
              <div className="flex items-center gap-1 rounded-full bg-teal/15 px-2 py-1 text-[10px] font-medium text-teal">
                Godot
                <X className="size-3 cursor-pointer hover:text-teal/70" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results section (slightly dimmed) */}
      <div className="px-4 py-4 opacity-60">
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">12 teams found</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Sorted by: Recent</span>
          </div>

          <div className="grid gap-3">
            {[
              { name: "Pixel Pioneers", engine: "Godot", roles: ["2D Artist", "Sound"], members: 3 },
              { name: "Neon Coders", engine: "Godot", roles: ["Developer"], members: 4 },
            ].map((team, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/50 bg-card p-3 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{team.name}</h3>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {team.engine} - {team.members} members
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {team.roles.map((role) => (
                      <span
                        key={role}
                        className="rounded-full bg-teal/10 px-2 py-0.5 text-[9px] font-medium text-teal"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
