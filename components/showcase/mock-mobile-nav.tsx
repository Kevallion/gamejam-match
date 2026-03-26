"use client"

import {
  Gamepad2,
  Bell,
  Menu,
  X,
  Users,
  UserSearch,
  PenLine,
  Hand,
  LayoutDashboard,
  LogOut,
  Heart,
  Sun,
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

export function MockMobileNav() {
  return (
    <div className="relative h-[420px] overflow-hidden bg-background">
      {/* Mobile Header */}
      <header className="relative z-10 flex h-12 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-sm px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
            <Gamepad2 className="size-3.5 text-primary" />
          </div>
          <span className="text-xs font-extrabold tracking-tight text-foreground">GameJamCrew</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex size-8 items-center justify-center rounded-lg">
            <Heart className="size-4 text-muted-foreground" />
          </div>
          <div className="flex size-8 items-center justify-center rounded-lg">
            <Sun className="size-4 text-muted-foreground" />
          </div>
          <div className="relative flex size-8 items-center justify-center rounded-lg">
            <Bell className="size-4 text-muted-foreground" />
            <span className="absolute right-1 top-1 flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-peach opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-peach" />
            </span>
          </div>
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted/50">
            <Menu className="size-4 text-foreground" />
          </div>
        </div>
      </header>

      {/* Backdrop overlay */}
      <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-sm" />

      {/* Sheet Drawer (matching real navbar Sheet) */}
      <div className="absolute right-0 top-0 z-30 flex h-full w-[280px] flex-col border-l border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl">
        {/* Sheet content - matches real navbar */}
        <div className="flex flex-1 flex-col pt-4 px-4">
          {/* User Info - matches real navbar */}
          <div className="pb-4 border-b border-border/40">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="shrink-0 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  Lv. 7
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">PixelDev42</p>
                  <p className="text-[10px] text-muted-foreground">Seasoned Jammer</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <div className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-teal px-3 py-2 text-[11px] font-semibold text-teal-foreground">
                  <LayoutDashboard className="size-3.5" />
                  Dashboard
                </div>
                <div className="flex items-center justify-center rounded-xl border border-destructive/30 px-3 py-2 text-destructive hover:bg-destructive/10">
                  <LogOut className="size-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Nav Links - matches real navbar exactly */}
          <nav className="mt-4 flex flex-col gap-1">
            <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
              <Users className="size-5" />
              <span className="font-medium text-sm">Find Teams</span>
            </div>
            {/* Active/Selected state */}
            <div className="flex items-center gap-3 rounded-xl px-3 py-3 bg-primary/10 text-primary">
              <UserSearch className="size-5" />
              <span className="font-medium text-sm">Find Members</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
              <PenLine className="size-5" />
              <span className="font-medium text-sm">Post a Team</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
              <Hand className="size-5" />
              <span className="font-medium text-sm">I&apos;m Available</span>
            </div>
          </nav>
        </div>
      </div>

      {/* Background content (dimmed) */}
      <div className="relative z-0 px-4 py-6 opacity-30">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-lavender/30 bg-lavender px-3 py-1 text-[10px] font-medium text-lavender-foreground">
          <UserSearch className="size-3" />
          Browse available jammers
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-foreground">
          Find <span className="text-lavender">Teammates</span>
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Discover talented jammers ready to join your squad.
        </p>
      </div>
    </div>
  )
}
