"use client"

import { useState } from "react"
import { Sword, Gamepad2, Palette, Music, Code2, Sparkles } from "lucide-react"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"

// ────────────────────────────────────────────────────────────
// Player / Role card data
// ────────────────────────────────────────────────────────────
const roleCards = [
  {
    emoji: "💻",
    role: "Godot Developer",
    engine: "Godot 4",
    language: "English",
    badges: ["GDScript", "2D Physics"],
    accent: "border-teal bg-teal/5",
    badgeColor: "bg-teal/10 text-teal border-teal/30",
    rotate: "-rotate-2",
  },
  {
    emoji: "🎨",
    role: "2D Pixel Artist",
    engine: "Aseprite",
    language: "Français",
    badges: ["Pixel Art", "Animation"],
    accent: "border-pink bg-pink/5",
    badgeColor: "bg-pink/10 text-pink border-pink/30",
    rotate: "rotate-1",
  },
  {
    emoji: "🎵",
    role: "Audio Wizard",
    engine: "FMOD",
    language: "Español",
    badges: ["SFX", "Music"],
    accent: "border-lavender bg-lavender/5",
    badgeColor: "bg-lavender/10 text-lavender border-lavender/30",
    rotate: "-rotate-1",
  },
]

// ────────────────────────────────────────────────────────────
// Dot-pattern background (inline SVG)
// ────────────────────────────────────────────────────────────
const DOT_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%2394a3b8' fill-opacity='0.35'/%3E%3C/svg%3E")`

export function LandingHero() {
  const [authModalOpen, setAuthModalOpen] = useState(false)

  return (
    <section
      className="relative min-h-[90vh] flex items-center overflow-hidden px-4 pt-24 pb-16 lg:px-8 lg:pt-32 lg:pb-24"
      style={{ backgroundImage: DOT_PATTERN, backgroundColor: "var(--background)" }}
    >
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">

          {/* ── Left column: copy ── */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-4 py-1.5 text-sm font-bold text-foreground shadow-[3px_3px_0px_0px_var(--neo-shadow)]">
              <Sword className="size-4 text-teal" />
              <span>{"It's dangerous to go alone!"} 🗡️</span>
            </div>

            {/* Headline */}
            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Assemble your crew.
              <br />
              <span className="text-teal">Finish the game.</span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground lg:mx-0">
              No corporate networking. Just a cozy community of indie devs, pixel
              artists, and audio wizards teaming up for their next game jam adventure.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
              <Button
                type="button"
                size="lg"
                className="h-14 min-w-[220px] rounded-lg border-2 border-foreground bg-teal px-8 text-base font-extrabold text-white shadow-[4px_4px_0px_0px_var(--neo-shadow)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--neo-shadow)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_var(--neo-shadow)]"
                onClick={() => setAuthModalOpen(true)}
              >
                <Sparkles className="mr-2 size-5" />
                Find your Squad 🚀
              </Button>
            </div>

            {/* Social proof row */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground lg:justify-start">
              <div className="flex items-center gap-2">
                <Gamepad2 className="size-4 text-teal" />
                <span>Ludum Dare &bull; GMTK &bull; Game Off</span>
              </div>
              <div className="hidden h-4 w-px bg-border sm:block" />
              <div className="flex items-center gap-2">
                <Code2 className="size-4 text-lavender" />
                <span>Godot &bull; Unity &bull; Pygame &bull; more</span>
              </div>
            </div>
          </div>

          {/* ── Right column: role cards ── */}
          <div className="relative flex-shrink-0 w-full max-w-sm lg:max-w-md">
            <div className="relative flex flex-col gap-4">
              {roleCards.map((card) => (
                <RoleCard key={card.role} card={card} />
              ))}

              {/* Connecting line decoration */}
              <div className="pointer-events-none absolute left-6 top-12 bottom-12 w-0.5 border-l-2 border-dashed border-slate-300" />
            </div>
          </div>

        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </section>
  )
}

// ────────────────────────────────────────────────────────────
// Role Card sub-component
// ────────────────────────────────────────────────────────────
function RoleCard({ card }: { card: (typeof roleCards)[number] }) {
  return (
    <div
      className={`relative z-10 rounded-xl border-2 border-foreground bg-card p-4 shadow-[4px_4px_0px_0px_var(--neo-shadow)] transition-transform hover:-translate-y-0.5 ${card.rotate}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`flex size-12 flex-shrink-0 items-center justify-center rounded-lg border-2 border-foreground text-2xl ${card.accent}`}
        >
          {card.emoji}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-foreground leading-tight">{card.role}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span>{card.engine}</span>
            <span>&bull;</span>
            <span>{card.language}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {card.badges.map((b) => (
              <span
                key={b}
                className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${card.badgeColor}`}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Status dot */}
        <div className="flex-shrink-0 flex items-center gap-1.5 mt-0.5">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-teal" />
          </span>
          <span className="text-xs font-medium text-teal">Open</span>
        </div>
      </div>
    </div>
  )
}
