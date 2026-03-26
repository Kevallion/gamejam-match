"use client"

import {
  Gamepad2,
  Bell,
  ChevronRight,
  Home,
  FolderOpen,
  Users2,
  Settings2,
  MessageCircle,
  Calendar,
  Trophy,
  Pencil,
  ExternalLink,
  MoreHorizontal,
  Pin,
  Star,
  Clock,
} from "lucide-react"

const AVATAR_COLORS: Record<string, string> = {
  PixelDev42: "from-teal/70 to-primary/70",
  "NeonArtist": "from-pink/70 to-lavender/70",
  "SynthCoder": "from-mint/70 to-teal/70",
  "PixelQueen": "from-peach/70 to-pink/70",
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

export function MockBreadcrumbTabs() {
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
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="size-4 text-muted-foreground" />
          </div>
          <InitialsAvatar name="PixelDev42" className="size-7 ring-2 ring-border/40" />
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <div className="border-b border-border/50 bg-muted/20 px-4 py-2.5">
        <nav className="flex items-center gap-1.5 text-[11px]">
          <a href="#" className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
            <Home className="size-3" />
            Home
          </a>
          <ChevronRight className="size-3 text-muted-foreground/50" />
          <a href="#" className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
            <FolderOpen className="size-3" />
            My Teams
          </a>
          <ChevronRight className="size-3 text-muted-foreground/50" />
          <span className="flex items-center gap-1 font-medium text-foreground">
            <Users2 className="size-3 text-primary" />
            Neon Runners
          </span>
        </nav>
      </div>

      {/* Team Header */}
      <div className="border-b border-border/50 px-4 py-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal/20 to-lavender/20 text-xl">
              <span role="img" aria-label="team">🎮</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-foreground">Neon Runners</h1>
                <span className="rounded-full bg-mint/15 px-2 py-0.5 text-[9px] font-bold text-mint">Open</span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Ludum Dare 57 - Building a neon platformer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-[10px] font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground">
              <Star className="size-3" />
              Follow
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[10px] font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90">
              <Pencil className="size-3" />
              Manage
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Active on Members */}
      <div className="border-b border-border/50 px-4">
        <div className="flex gap-1">
          {[
            { icon: MessageCircle, label: "Chat", active: false, badge: "12" },
            { icon: Users2, label: "Members", active: true, badge: "4" },
            { icon: Calendar, label: "Schedule", active: false, badge: null },
            { icon: Trophy, label: "Progress", active: false, badge: null },
            { icon: Settings2, label: "Settings", active: false, badge: null },
          ].map((tab) => (
            <button
              key={tab.label}
              className={`relative flex items-center gap-1.5 px-4 py-3 text-[11px] font-medium transition-all ${
                tab.active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="size-3.5" />
              {tab.label}
              {tab.badge && (
                <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                  tab.active 
                    ? "bg-primary/15 text-primary" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {tab.badge}
                </span>
              )}
              {/* Active indicator */}
              {tab.active && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Members Content */}
      <div className="px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">Team Members</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
              4 of 5
            </span>
          </div>
          <button className="flex items-center gap-1 text-[10px] font-medium text-primary">
            <ExternalLink className="size-3" />
            Invite Link
          </button>
        </div>

        {/* Member Cards */}
        <div className="space-y-2">
          {[
            { name: "PixelDev42", role: "Team Lead", roleColor: "bg-peach/15 text-peach", isOwner: true, online: true },
            { name: "NeonArtist", role: "2D Artist", roleColor: "bg-pink/15 text-pink", isOwner: false, online: true },
            { name: "SynthCoder", role: "Developer", roleColor: "bg-teal/15 text-teal", isOwner: false, online: false },
            { name: "PixelQueen", role: "Sound Designer", roleColor: "bg-lavender/15 text-lavender", isOwner: false, online: true },
          ].map((member) => (
            <div
              key={member.name}
              className="group flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-3 transition-all hover:border-primary/20 hover:bg-card"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <InitialsAvatar name={member.name} className="size-9 ring-2 ring-border/30" />
                  <span className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card ${
                    member.online ? "bg-mint" : "bg-muted-foreground/50"
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-foreground">{member.name}</span>
                    {member.isOwner && (
                      <Pin className="size-3 text-peach" />
                    )}
                  </div>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${member.roleColor}`}>
                    {member.role}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="flex size-7 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition-all hover:text-foreground">
                  <MessageCircle className="size-3" />
                </button>
                <button className="flex size-7 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition-all hover:text-foreground">
                  <MoreHorizontal className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Open Role Slot */}
        <div className="mt-3 flex items-center justify-between rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full border-2 border-dashed border-primary/40">
              <span className="text-lg text-primary/60">+</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-foreground">Looking for Writer</span>
              <p className="text-[9px] text-muted-foreground">1 open slot remaining</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <Clock className="size-3" />
            Posted 2 days ago
          </span>
        </div>
      </div>
    </div>
  )
}
