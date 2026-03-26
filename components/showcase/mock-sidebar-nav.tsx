"use client"

import {
  Gamepad2,
  Home,
  Users2,
  UserSearch,
  Trophy,
  Settings2,
  Bell,
  ChevronRight,
  Inbox,
  Calendar,
  MessageCircle,
  Star,
  Zap,
  PlusCircle,
  LogOut,
  ChevronDown,
  FolderOpen,
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
    <div className="flex h-[420px] bg-background">
      {/* Expanded Sidebar */}
      <aside className="flex w-56 flex-col border-r border-border/50 bg-sidebar">
        {/* Sidebar Header */}
        <div className="flex items-center gap-2.5 border-b border-sidebar-border/50 p-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 shadow-sm">
            <Gamepad2 className="size-4.5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold tracking-tight text-sidebar-foreground">
              GameJamCrew
            </span>
            <span className="text-[9px] text-muted-foreground">Find your squad</span>
          </div>
        </div>

        {/* User Section with dropdown open */}
        <div className="border-b border-sidebar-border/50 p-3">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-2.5">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <InitialsAvatar name="PixelDev42" className="size-9 ring-2 ring-primary/20" />
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-sidebar bg-mint" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-[11px] font-semibold text-sidebar-foreground">PixelDev42</p>
                <p className="text-[9px] text-muted-foreground">Seasoned Jammer</p>
              </div>
              <ChevronDown className="size-3.5 text-primary" />
            </div>
            
            {/* Dropdown menu expanded */}
            <div className="mt-2.5 rounded-lg border border-border/50 bg-popover p-1.5 shadow-lg">
              <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] text-popover-foreground hover:bg-accent">
                <Star className="size-3 text-peach" />
                View Profile
              </div>
              <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] text-popover-foreground hover:bg-accent">
                <Settings2 className="size-3 text-muted-foreground" />
                Settings
              </div>
              <div className="my-1 h-px bg-border/60" />
              <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] text-destructive hover:bg-destructive/10">
                <LogOut className="size-3" />
                Sign Out
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="mb-2 px-2 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/70">
            Main
          </div>
          
          {[
            { icon: Home, label: "Home", active: false, badge: null },
            { icon: Users2, label: "Browse Teams", active: false, badge: "24" },
            { icon: UserSearch, label: "Find Members", active: true, badge: null },
            { icon: PlusCircle, label: "Create Team", active: false, badge: null },
          ].map((item) => (
            <div
              key={item.label}
              className={`mb-1 flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11px] font-medium transition-all ${
                item.active
                  ? "border border-primary/30 bg-primary/10 text-primary shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent"
              }`}
            >
              <item.icon className={`size-3.5 ${item.active ? "text-primary" : "text-muted-foreground"}`} />
              {item.label}
              {item.badge && (
                <span className="ml-auto rounded-full bg-teal/15 px-1.5 py-0.5 text-[8px] font-bold text-teal">
                  {item.badge}
                </span>
              )}
              {item.active && <ChevronRight className="ml-auto size-3 text-primary/60" />}
            </div>
          ))}

          <div className="mb-2 mt-4 px-2 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/70">
            Your Activity
          </div>
          
          {[
            { icon: Inbox, label: "Inbox", active: false, badge: "3", badgeColor: "bg-peach text-peach-foreground" },
            { icon: Calendar, label: "My Jams", active: false, badge: null },
            { icon: FolderOpen, label: "My Teams", active: false, badge: "2" },
            { icon: Trophy, label: "Achievements", active: false, badge: null },
          ].map((item) => (
            <div
              key={item.label}
              className="mb-1 flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11px] font-medium text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent"
            >
              <item.icon className="size-3.5 text-muted-foreground" />
              {item.label}
              {item.badge && (
                <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[8px] font-bold ${item.badgeColor ?? "bg-muted text-muted-foreground"}`}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-sidebar-border/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Zap className="size-3 text-peach" />
              <span>720 XP</span>
            </div>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-teal to-peach" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area (dimmed to focus on sidebar) */}
      <main className="flex-1 bg-background/50">
        {/* Top bar */}
        <header className="flex h-12 items-center justify-between border-b border-border/50 bg-background/80 px-4">
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-muted-foreground">Home</span>
            <ChevronRight className="size-3 text-muted-foreground/50" />
            <span className="font-medium text-foreground">Find Members</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="size-4 text-muted-foreground" />
              <span className="absolute -right-0.5 -top-0.5 flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
            </div>
            <div className="relative">
              <MessageCircle className="size-4 text-muted-foreground" />
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-mint" />
            </div>
          </div>
        </header>

        {/* Content placeholder */}
        <div className="p-4 opacity-50">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-lavender/20 bg-lavender/10 px-2.5 py-0.5 text-[9px] font-medium text-lavender">
            <UserSearch className="size-3" />
            Scout Teammates
          </div>
          <h1 className="text-lg font-extrabold tracking-tight text-foreground">Find Members</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Browse available jammers and invite them to your team.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-xl border border-border/50 bg-card" />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
