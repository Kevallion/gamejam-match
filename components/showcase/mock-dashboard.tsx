"use client"

import {
  Users2,
  Inbox,
  UserSearch,
  Trophy,
  Settings2,
  Bell,
  Gamepad2,
  Check,
  X,
  Send,
  Clock,
  MessageSquareText,
} from "lucide-react"

const DICEBEAR_BASE = "https://api.dicebear.com/9.x/adventurer/svg"

function DiceBearAvatar({ name, className }: { name: string; className?: string }) {
  const url = `${DICEBEAR_BASE}?seed=${encodeURIComponent(name)}&backgroundColor=d1d4f9`
  return (
    <img
      src={url}
      alt={name}
      className={className}
    />
  )
}

export function MockDashboard() {
  return (
    <div className="bg-background text-foreground">
      {/* Navbar */}
      <header className="flex h-12 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
            <Gamepad2 className="size-3.5 text-primary" />
          </div>
          <span className="text-xs font-extrabold tracking-tight text-foreground">GameJamCrew</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="size-4 text-muted-foreground" />
            <span className="absolute -right-0.5 -top-0.5 flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
          </div>
          <DiceBearAvatar name="PixelDev42" className="size-7 rounded-full ring-2 ring-border/40" />
        </div>
      </header>

      {/* Identity Header with XP bar */}
      <section className="px-4 pt-4">
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm">
          {/* XP Progress bar */}
          <div className="h-1 w-full bg-muted/50">
            <div
              className="h-full bg-gradient-to-r from-teal to-peach"
              style={{ width: "68%" }}
            />
          </div>
          <div className="flex items-center gap-3 p-4">
            <DiceBearAvatar
              name="PixelDev42"
              className="size-12 shrink-0 rounded-xl ring-2 ring-border/30"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                  PixelDev42
                </p>
                <span className="shrink-0 rounded-full border border-amber-500/40 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                  Lv. 7
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Seasoned Jammer
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-3 gap-2 px-4 pt-3">
        {/* Teams KPI */}
        <div className="rounded-xl border border-teal/20 bg-teal/5 p-2.5">
          <div className="flex items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-teal/15">
              <Users2 className="size-3.5 text-teal" />
            </div>
            <div>
              <p className="text-[8px] font-medium text-muted-foreground">Teams</p>
              <p className="text-sm font-bold tabular-nums">2</p>
            </div>
          </div>
        </div>

        {/* Activity KPI */}
        <div className="rounded-xl border border-peach/20 bg-peach/5 p-2.5">
          <div className="flex items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-peach/15">
              <Inbox className="size-3.5 text-peach" />
            </div>
            <div>
              <p className="text-[8px] font-medium text-muted-foreground">Activity</p>
              <p className="text-sm font-bold tabular-nums">5</p>
            </div>
          </div>
        </div>

        {/* Availability KPI */}
        <div className="rounded-xl border border-lavender/20 bg-lavender/5 p-2.5">
          <div className="flex items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-lavender/15">
              <UserSearch className="size-3.5 text-lavender" />
            </div>
            <div>
              <p className="text-[8px] font-medium text-muted-foreground">Available</p>
              <p className="text-sm font-bold tabular-nums">1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="flex gap-1 rounded-xl border border-border/50 bg-muted/30 p-1">
          {[
            { icon: Users2, label: "Squads", color: "text-teal", active: false },
            { icon: Inbox, label: "Inbox", color: "text-peach", active: true },
            { icon: UserSearch, label: "Available", color: "text-lavender", active: false },
            { icon: Trophy, label: "Achievements", color: "text-amber-500", active: false },
            { icon: Settings2, label: "Settings", color: "text-slate-400", active: false },
          ].map((tab) => (
            <div
              key={tab.label}
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 text-[9px] font-semibold transition-all ${
                tab.active
                  ? "border border-peach/30 bg-background/80 text-peach shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <tab.icon className={`size-3 ${tab.active ? tab.color : ""}`} />
              <span className="hidden sm:inline">{tab.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Inbox - Incoming Applications */}
      <div className="px-4 pt-4">
        <div className="rounded-2xl border border-border/50 bg-card/50 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl bg-mint/15">
              <Inbox className="size-4 text-mint" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-foreground">Incoming Applications</h2>
              <p className="text-[9px] text-muted-foreground">Players who want to join your teams</p>
            </div>
            <span className="ml-auto rounded-full bg-mint px-2 py-0.5 text-[9px] font-bold text-mint-foreground">
              1 pending
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {[
              { name: "SynthWave_Alex", team: "Neon Runners", role: "Developer", roleEmoji: "< >", roleColor: "bg-teal/15 text-teal", time: "2h ago" },
            ].map((app, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-mint/30"
              >
                {/* Top accent line on hover */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-mint/60 via-teal/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                
                <div className="flex flex-col gap-3 p-3">
                  {/* Top row: avatar + user info */}
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <DiceBearAvatar
                        name={app.name}
                        className="size-9 shrink-0 rounded-full ring-2 ring-mint/20"
                      />
                      {/* Online dot */}
                      <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-mint" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="text-[11px] font-bold text-foreground">{app.name}</h3>
                        <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${app.roleColor}`}>
                          {app.roleEmoji} {app.role}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[9px] text-muted-foreground">
                        <span>
                          Applying to <span className="font-semibold text-foreground">{app.team}</span>
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                          <Clock className="size-2.5" />
                          {app.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Motivation box */}
                  <div className="relative overflow-hidden rounded-lg bg-secondary/50">
                    <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-mint/60 to-lavender/40" />
                    <div className="px-3 py-2">
                      <div className="mb-1 flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/80">
                        <MessageSquareText className="size-2.5" />
                        Motivation
                      </div>
                      <p className="text-[9px] leading-relaxed text-foreground/80">
                        Super excited to join! I&apos;ve been working with Unity for 3 years...
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-[9px] font-semibold text-white shadow-sm transition-all hover:bg-green-700">
                      <Check className="size-3" />
                      Accept
                    </button>
                    <button className="flex items-center gap-1 rounded-lg border border-red-500/50 px-3 py-1.5 text-[9px] font-semibold text-red-600 transition-all hover:bg-red-500/10">
                      <X className="size-3" />
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sent Applications Section */}
      <div className="px-4 py-4">
        <div className="rounded-2xl border border-border/50 bg-card/50 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl bg-teal/15">
              <Send className="size-4 text-teal" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-foreground">My Sent Applications</h2>
              <p className="text-[9px] text-muted-foreground">Track your applications to join a team</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {[
              { team: "Dreamweaver Studio", role: "3D Artist", roleColor: "bg-peach/15 text-peach", status: "accepted" },
              { team: "Cosmic Creators", role: "Developer", roleColor: "bg-teal/15 text-teal", status: "pending" },
            ].map((app, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-border/40 bg-background/50 px-3 py-2.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-medium text-foreground truncate">{app.team}</span>
                  <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${app.roleColor}`}>
                    {app.role}
                  </span>
                </div>
                <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[8px] font-medium ${
                  app.status === "accepted" 
                    ? "bg-success/10 text-success" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {app.status === "accepted" ? "Accepted" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
