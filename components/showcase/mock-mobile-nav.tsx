"use client"

import {
  Gamepad2,
  Bell,
  Menu,
  X,
  Home,
  Users2,
  UserSearch,
  PlusCircle,
  Inbox,
  Trophy,
  Settings2,
  LogOut,
  ChevronRight,
  Zap,
  Star,
  ExternalLink,
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
    <div className="relative h-[480px] overflow-hidden bg-background">
      {/* Navbar with menu button active */}
      <header className="relative z-10 flex h-12 items-center justify-between border-b border-border/50 bg-background px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
            <Gamepad2 className="size-3.5 text-primary" />
          </div>
          <span className="text-xs font-extrabold tracking-tight text-foreground">GameJamCrew</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="size-4 text-muted-foreground" />
            <span className="absolute -right-0.5 -top-0.5 flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
          </div>
          <button className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <X className="size-4" />
          </button>
        </div>
      </header>

      {/* Backdrop overlay */}
      <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm" />

      {/* Mobile Menu Drawer (sliding from right) */}
      <div className="absolute right-0 top-0 z-30 flex h-full w-[280px] flex-col border-l border-border/50 bg-card shadow-2xl">
        {/* Menu Header */}
        <div className="flex items-center justify-between border-b border-border/50 p-4">
          <span className="text-sm font-bold text-foreground">Menu</span>
          <button className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <X className="size-4" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="border-b border-border/50 p-4">
          <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
            <div className="relative">
              <InitialsAvatar name="PixelDev42" className="size-11 ring-2 ring-primary/20 text-sm" />
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-mint" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">PixelDev42</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-500">
                  Lv. 7
                </span>
                <span className="text-[9px] text-muted-foreground">Seasoned Jammer</span>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
          
          {/* XP Bar */}
          <div className="mt-3 flex items-center gap-2">
            <Zap className="size-3 text-peach" />
            <div className="flex-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-teal to-peach" />
              </div>
            </div>
            <span className="text-[9px] font-medium text-muted-foreground">720/1000 XP</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="mb-2 px-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">
            Navigate
          </div>
          
          {[
            { icon: Home, label: "Home", badge: null, active: false },
            { icon: Users2, label: "Browse Teams", badge: "24", active: false },
            { icon: UserSearch, label: "Find Members", badge: null, active: true },
            { icon: PlusCircle, label: "Create Team", badge: null, active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`mb-1.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                item.active
                  ? "border border-primary/30 bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className={`size-4 ${item.active ? "text-primary" : "text-muted-foreground"}`} />
              {item.label}
              {item.badge && (
                <span className="ml-auto rounded-full bg-teal/15 px-2 py-0.5 text-[10px] font-bold text-teal">
                  {item.badge}
                </span>
              )}
            </div>
          ))}

          <div className="my-3 h-px bg-border/60" />
          
          <div className="mb-2 px-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">
            Your Activity
          </div>
          
          {[
            { icon: Inbox, label: "Inbox", badge: "3", badgeColor: "bg-peach text-peach-foreground" },
            { icon: Star, label: "Followed Teams", badge: "5", badgeColor: null },
            { icon: Trophy, label: "Achievements", badge: null },
            { icon: Settings2, label: "Settings", badge: null },
          ].map((item) => (
            <div
              key={item.label}
              className="mb-1.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted/50"
            >
              <item.icon className="size-4 text-muted-foreground" />
              {item.label}
              {item.badge && (
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${item.badgeColor ?? "bg-muted text-muted-foreground"}`}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-border/50 p-3">
          <div className="mb-2 flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5 text-sm font-medium text-muted-foreground">
            <ExternalLink className="size-4" />
            Discord Server
          </div>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10">
            <LogOut className="size-4" />
            Sign Out
          </div>
        </div>
      </div>

      {/* Background content (dimmed) */}
      <div className="relative z-0 px-4 py-4 opacity-30">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-lavender/20 bg-lavender/10 px-2.5 py-0.5 text-[9px] font-medium text-lavender">
          <UserSearch className="size-3" />
          Scout Teammates
        </div>
        <h1 className="text-lg font-extrabold tracking-tight text-foreground">Find Members</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Browse available jammers and invite them to your team.
        </p>
        <div className="mt-4 grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl border border-border/50 bg-card" />
          ))}
        </div>
      </div>
    </div>
  )
}
