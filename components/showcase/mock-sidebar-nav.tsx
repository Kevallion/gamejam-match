"use client"

import {
  Gamepad2,
  Users,
  UserSearch,
  PenLine,
  Hand,
  Bell,
  Sun,
  Moon,
  Heart,
  LayoutDashboard,
  LogOut,
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

export function MockSidebarNav() {
  return (
    <div className="flex flex-col bg-background text-foreground">
      {/* Floating Desktop Navbar - exactly like the real one */}
      <div className="flex justify-center pt-4 pb-2 px-4">
        <nav className="relative flex items-center gap-2 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl px-3 py-2 shadow-lg shadow-black/5">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
              <Gamepad2 className="size-3.5 text-primary" />
            </div>
            <span className="text-xs font-extrabold tracking-tight text-foreground">GameJamCrew</span>
          </div>

          {/* Separator */}
          <div className="h-5 w-px bg-border/50 mx-1" />

          {/* Nav Links */}
          <div className="flex items-center gap-0.5">
            <div className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground">
              <Users className="size-3" />
              Teams
            </div>
            <div className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground">
              <UserSearch className="size-3" />
              Members
            </div>
            <div className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground">
              <PenLine className="size-3" />
              Post Team
            </div>
            <div className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground">
              <Hand className="size-3" />
              Available
            </div>
          </div>

          {/* Separator */}
          <div className="h-5 w-px bg-border/50 mx-1" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <div className="flex size-7 items-center justify-center rounded-lg text-muted-foreground">
              <Heart className="size-3.5" />
            </div>
            <div className="flex size-7 items-center justify-center rounded-lg text-muted-foreground">
              <Sun className="size-3.5" />
            </div>

            {/* Notifications */}
            <div className="relative flex size-7 items-center justify-center rounded-lg text-muted-foreground">
              <Bell className="size-3.5" />
              <span className="absolute -right-0.5 -top-0.5 flex min-h-3 min-w-3 items-center justify-center rounded-full bg-peach px-0.5 text-[7px] font-bold text-peach-foreground">
                3
              </span>
            </div>

            {/* User dropdown trigger - with dropdown open */}
            <div className="relative">
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2 py-1">
                <span className="shrink-0 rounded-full border border-amber-500/40 bg-amber-500/15 px-1.5 py-0.5 text-[8px] font-bold text-amber-600 dark:text-amber-400">
                  Lv. 7
                </span>
                <span className="text-[10px] font-medium text-foreground">PixelDev42</span>
              </div>

              {/* Dropdown menu - OPEN */}
              <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-border/50 bg-popover p-2 shadow-xl z-50">
                <div className="px-2 py-1.5">
                  <p className="text-[11px] font-medium text-popover-foreground">PixelDev42</p>
                  <p className="text-[9px] text-muted-foreground">Seasoned Jammer</p>
                </div>
                <div className="my-1 h-px bg-border/60" />
                <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] text-popover-foreground bg-accent">
                  <LayoutDashboard className="size-3.5" />
                  Dashboard
                </div>
                <div className="my-1 h-px bg-border/60" />
                <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] text-destructive">
                  <LogOut className="size-3.5" />
                  Sign Out
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Page content behind (dimmed to focus on navbar) */}
      <div className="px-4 pt-8 pb-6 opacity-50">
        <div className="mx-auto max-w-lg text-center">
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

        {/* Search bar placeholder */}
        <div className="mx-auto mt-6 max-w-md">
          <div className="h-10 rounded-xl border border-border/60 bg-card" />
        </div>

        {/* Grid placeholder */}
        <div className="mx-auto mt-6 max-w-2xl grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl border border-border/50 bg-card" />
          ))}
        </div>
      </div>
    </div>
  )
}
