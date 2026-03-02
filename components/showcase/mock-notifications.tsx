"use client"

import { Bell, Gamepad2, LayoutDashboard, Mail, Users } from "lucide-react"

export function MockNotifications() {
  return (
    <div className="bg-background">
      {/* Navbar with notification dropdown open */}
      <header className="flex h-12 items-center justify-between border-b border-border/50 bg-background/80 px-4">
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
          {/* Bell with pulse */}
          <div className="relative">
            <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
              <Bell className="size-3.5 text-foreground" />
            </div>
            <span className="absolute -right-0.5 -top-0.5 flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
            </span>
          </div>
        </div>
      </header>

      {/* Dropdown overlay simulation */}
      <div className="relative px-4 pt-2">
        <div className="ml-auto w-72 rounded-2xl border border-border/60 bg-popover p-2 shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Bell className="size-3.5 text-primary" />
            <span className="text-xs font-bold text-popover-foreground">Notifications</span>
            <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
              3
            </span>
          </div>
          <div className="my-1 h-px bg-border/60" />

          {/* Notification items */}
          <div className="flex flex-col gap-0.5">
            {[
              {
                type: "application",
                sender: "SynthWave_Alex",
                team: "Neon Runners",
                role: "Developer",
                highlight: true,
              },
              {
                type: "application",
                sender: "ArtistKira",
                team: "The Pixel Knights",
                role: "2D Artist",
                highlight: false,
              },
              {
                type: "invitation",
                sender: null,
                team: "Dreamweaver Studio",
                role: "Writer",
                highlight: false,
              },
            ].map((notif, i) => (
              <div
                key={i}
                className={`flex flex-col gap-0.5 rounded-lg px-3 py-2.5 ${
                  notif.highlight ? "bg-primary/5" : "hover:bg-accent"
                }`}
              >
                <span className="text-[10px] font-medium leading-snug text-popover-foreground">
                  {notif.type === "application" ? (
                    <>
                      <span className="text-primary">{notif.sender}</span>
                      {" applied to "}
                      <span className="font-bold">{notif.team}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-bold">{notif.team}</span>
                      {" invited you"}
                    </>
                  )}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  Role: {notif.role}
                </span>
              </div>
            ))}
          </div>

          <div className="my-1 h-px bg-border/60" />
          <div className="flex items-center justify-center gap-1 rounded-lg py-2 text-[10px] font-semibold text-primary">
            <LayoutDashboard className="size-3" />
            View all in Dashboard
          </div>
        </div>
      </div>

      {/* Content behind (blurred / dim effect) */}
      <div className="px-4 py-6 opacity-40">
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
