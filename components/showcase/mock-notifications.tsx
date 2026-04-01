"use client"

import { Bell, Gamepad2, LayoutDashboard, Mail, Users, Check, X, Clock, Sparkles, Star, UserPlus, Trophy } from "lucide-react"

export function MockNotifications() {
  return (
    <div className="bg-background">
      {/* Navbar with notification dropdown open */}
      <header className="flex h-12 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
            <Gamepad2 className="size-3.5 text-primary" />
          </div>
          <span className="text-xs font-extrabold tracking-tight text-foreground">GameJamCrew</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-[10px] text-muted-foreground sm:block">
            Hello, <span className="text-foreground font-medium">PixelDev42</span> !
          </span>
          <div className="rounded-lg border border-primary/30 bg-primary/5 px-2 py-1 text-[10px] font-medium text-primary">
            <LayoutDashboard className="inline size-3 mr-0.5" />
            Dashboard
          </div>
          {/* Bell with pulse - active state */}
          <div className="relative">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 ring-2 ring-primary/30 shadow-lg shadow-primary/20">
              <Bell className="size-4 text-primary" />
            </div>
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">3</span>
            </span>
          </div>
        </div>
      </header>

      {/* Dropdown overlay simulation */}
      <div className="relative px-4 pt-2">
        <div className="ml-auto w-80 rounded-2xl border-2 border-primary/30 bg-popover p-3 shadow-2xl shadow-primary/10">
          {/* Header */}
          <div className="flex items-center gap-2 px-1 pb-2">
            <div className="flex size-6 items-center justify-center rounded-lg bg-primary/15">
              <Bell className="size-3.5 text-primary" />
            </div>
            <span className="text-sm font-bold text-popover-foreground">Notifications</span>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">
              <Sparkles className="size-2.5" />
              3 new
            </span>
          </div>
          <div className="my-2 h-px bg-border/60" />

          {/* Notification items */}
          <div className="flex flex-col gap-1">
            {[
              {
                type: "application",
                sender: "SynthWave_Alex",
                senderInitials: "SA",
                team: "Neon Runners",
                role: "Developer",
                roleEmoji: "💻",
                roleColor: "bg-teal/15 text-teal",
                highlight: true,
                time: "2m ago",
                level: 5,
              },
              {
                type: "application",
                sender: "ArtistKira",
                senderInitials: "AK",
                team: "The Pixel Knights",
                role: "2D Artist",
                roleEmoji: "🎨",
                roleColor: "bg-pink/15 text-pink",
                highlight: false,
                time: "15m ago",
                level: 3,
              },
              {
                type: "invitation",
                sender: "Dreamweaver Studio",
                senderInitials: "DS",
                team: "Dreamweaver Studio",
                role: "Writer",
                roleEmoji: "✍️",
                roleColor: "bg-lavender/15 text-lavender",
                highlight: false,
                time: "1h ago",
                level: null,
              },
            ].map((notif, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-xl border transition-all ${
                  notif.highlight 
                    ? "border-primary/40 bg-primary/5 shadow-sm" 
                    : "border-transparent hover:bg-accent"
                }`}
              >
                {/* New indicator bar */}
                {notif.highlight && (
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-teal" />
                )}
                
                <div className="flex items-start gap-3 p-2.5 pl-3">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={`flex size-8 items-center justify-center rounded-full text-[9px] font-bold ${
                      notif.type === "application" 
                        ? "bg-gradient-to-br from-teal/30 to-primary/30 text-foreground" 
                        : "bg-gradient-to-br from-lavender/30 to-pink/30 text-foreground"
                    }`}>
                      {notif.senderInitials}
                    </div>
                    {notif.level && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[7px] font-black text-white border border-popover">
                        {notif.level}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {notif.type === "application" ? (
                        <UserPlus className="size-3 text-teal" />
                      ) : (
                        <Mail className="size-3 text-lavender" />
                      )}
                      <span className="text-[10px] font-medium leading-snug text-popover-foreground">
                        {notif.type === "application" ? (
                          <>
                            <span className="font-bold text-primary">{notif.sender}</span>
                            {" applied"}
                          </>
                        ) : (
                          <>
                            <span className="font-bold">{notif.team}</span>
                            {" invited you"}
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {notif.type === "application" && (
                        <span className="text-[9px] text-muted-foreground">
                          to <span className="font-medium text-foreground">{notif.team}</span>
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${notif.roleColor}`}>
                        {notif.roleEmoji} {notif.role}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[8px] text-muted-foreground">
                        <Clock className="size-2.5" />
                        {notif.time}
                      </span>
                    </div>

                    {/* Quick action buttons for first item */}
                    {notif.highlight && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <button className="flex items-center gap-1 rounded-md bg-success px-2.5 py-1 text-[8px] font-semibold text-white shadow-sm">
                          <Check className="size-2.5" />
                          Accept
                        </button>
                        <button className="flex items-center gap-1 rounded-md border border-destructive/40 px-2 py-1 text-[8px] font-medium text-destructive">
                          <X className="size-2.5" />
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="my-2 h-px bg-border/60" />
          <div className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-semibold text-primary hover:bg-primary/5 transition-colors cursor-pointer">
            <LayoutDashboard className="size-3.5" />
            View all in Dashboard
          </div>
        </div>
      </div>

      {/* Content behind (blurred / dim effect) */}
      <div className="px-4 py-6 opacity-30 blur-[1px]">
        <div className="mx-auto max-w-md">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-peach/20 bg-peach/10 px-2.5 py-0.5 text-[9px] font-medium text-peach">
            <LayoutDashboard className="size-3" />
            Command Center
          </div>
          <h1 className="text-lg font-extrabold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage your teams, track applications, stay organized.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl border border-border/50 bg-card" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
