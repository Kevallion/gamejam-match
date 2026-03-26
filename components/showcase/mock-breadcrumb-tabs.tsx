"use client"

import {
  Gamepad2,
  Users,
  ArrowLeft,
  Cpu,
  Globe,
  ExternalLink,
} from "lucide-react"

const AVATAR_COLORS: Record<string, string> = {
  PixelDev42: "from-teal/70 to-primary/70",
  NeonArtist: "from-pink/70 to-lavender/70",
  SynthCoder: "from-mint/70 to-teal/70",
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
    <div className="bg-background text-foreground">
      {/* Navbar simplified */}
      <header className="flex h-12 items-center justify-between border-b border-border/50 bg-background/80 px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
            <Gamepad2 className="size-3.5 text-primary" />
          </div>
          <span className="text-xs font-extrabold tracking-tight text-foreground">GameJamCrew</span>
        </div>
      </header>

      {/* Squad Space Header - matches real team page */}
      <section className="relative px-4 pt-6 pb-4">
        <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
          <div className="absolute left-1/2 top-0 size-[300px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-peach/20 blur-[80px]" />
        </div>

        <div className="relative">
          {/* Back link */}
          <button className="mb-4 flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" />
            Back to Dashboard
          </button>

          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-medium text-primary">
            <Users className="size-3" />
            Squad space
          </div>

          <h1 className="text-xl font-extrabold tracking-tight text-foreground">
            Neon Runners
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Ludum Dare 57</p>
        </div>
      </section>

      {/* Tabs - matches real Tabs component */}
      <section className="px-4 pb-4">
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          {/* Tab List */}
          <div className="flex border-b border-border/50 bg-muted/30">
            <button className="flex-1 px-4 py-3 text-[11px] font-medium text-muted-foreground border-b-2 border-transparent transition-colors hover:text-foreground">
              Squad overview
            </button>
            <button className="flex-1 px-4 py-3 text-[11px] font-semibold text-primary border-b-2 border-primary">
              Squad chat
            </button>
          </div>

          {/* Tab Content - Chat view */}
          <div className="p-4">
            {/* Chat messages */}
            <div className="space-y-3">
              {/* System message */}
              <div className="flex justify-center">
                <span className="rounded-full bg-muted/50 px-3 py-1 text-[9px] text-muted-foreground">
                  SynthCoder joined the squad
                </span>
              </div>

              {/* Chat message from other user */}
              <div className="flex gap-2.5">
                <InitialsAvatar name="NeonArtist" className="size-7 shrink-0 ring-2 ring-border/30" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-foreground">NeonArtist</span>
                    <span className="rounded-full bg-pink/15 px-1.5 py-0.5 text-[8px] font-medium text-pink">
                      2D Artist
                    </span>
                    <span className="text-[9px] text-muted-foreground">2:34 PM</span>
                  </div>
                  <div className="mt-1 rounded-xl rounded-tl-sm bg-muted/50 px-3 py-2">
                    <p className="text-[11px] text-foreground">
                      Hey team! Just pushed the new sprite sheet to the repo. Check it out!
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat message from current user */}
              <div className="flex gap-2.5 flex-row-reverse">
                <InitialsAvatar name="PixelDev42" className="size-7 shrink-0 ring-2 ring-primary/30" />
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-[9px] text-muted-foreground">2:36 PM</span>
                    <span className="text-[11px] font-semibold text-foreground">You</span>
                  </div>
                  <div className="mt-1 rounded-xl rounded-tr-sm bg-primary/15 px-3 py-2 text-left">
                    <p className="text-[11px] text-foreground">
                      Looking great! Can we add a running animation next?
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat input */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-9 rounded-xl border border-border/60 bg-background px-3 flex items-center">
                <span className="text-[11px] text-muted-foreground">Type a message...</span>
              </div>
              <button className="h-9 px-4 rounded-xl bg-primary text-[11px] font-semibold text-primary-foreground">
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Squad info bar */}
        <div className="mt-3 flex items-center justify-between rounded-xl border border-border/50 bg-card/50 px-4 py-2.5">
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Cpu className="size-3 text-lavender" />
              Unity
            </span>
            <span className="inline-flex items-center gap-1">
              <Globe className="size-3 text-teal" />
              English
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="size-3" />
              3/4 members
            </span>
          </div>
          <button className="flex items-center gap-1 text-[10px] font-medium text-primary">
            <ExternalLink className="size-3" />
            Join Discord
          </button>
        </div>
      </section>
    </div>
  )
}
