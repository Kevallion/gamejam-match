"use client"

import { Swords, Gamepad2, Palette, Music, Code2, Sparkles } from "lucide-react"

const playerCards = [
  {
    role: "Godot Developer",
    icon: Code2,
    tag: "Engine: Godot 4",
    timezone: "UTC+1",
    jams: 12,
    color: "border-teal-400 bg-teal-50",
    iconColor: "text-teal-600",
    tagColor: "bg-teal-100 text-teal-700",
    rotate: "-rotate-3",
  },
  {
    role: "2D Pixel Artist",
    icon: Palette,
    tag: "Aseprite wizard",
    timezone: "UTC-5",
    jams: 7,
    color: "border-coral-400 bg-coral-50",
    iconColor: "text-coral-600",
    tagColor: "bg-coral-100 text-coral-700",
    rotate: "rotate-2",
  },
  {
    role: "Audio Wizard",
    icon: Music,
    tag: "FMOD + BFXR",
    timezone: "UTC+9",
    jams: 5,
    color: "border-lavender-400 bg-lavender-50",
    iconColor: "text-lavender-600",
    tagColor: "bg-lavender-100 text-lavender-700",
    rotate: "rotate-3",
  },
  {
    role: "Game Designer",
    icon: Gamepad2,
    tag: "Narrative + Systems",
    timezone: "UTC+2",
    jams: 9,
    color: "border-teal-300 bg-teal-50",
    iconColor: "text-teal-500",
    tagColor: "bg-teal-100 text-teal-600",
    rotate: "-rotate-1",
  },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden dot-pattern py-20 md:py-28 lg:py-36">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Left: copy */}
          <div className="flex flex-col gap-6">
            {/* badge */}
            <span className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-slate-800 bg-amber-100 px-4 py-1.5 text-sm font-bold text-slate-800 shadow-[2px_2px_0_#1e293b]">
              <Swords className="h-4 w-4" />
              {"It's dangerous to go alone! 🗡️"}
            </span>

            {/* headline */}
            <h1 className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-900 text-balance md:text-6xl lg:text-7xl">
              Assemble your crew.{" "}
              <span className="text-teal-500 underline decoration-wavy decoration-teal-300 underline-offset-4">
                Finish the game.
              </span>
            </h1>

            {/* subtitle */}
            <p className="max-w-xl text-lg leading-relaxed text-slate-600">
              No corporate networking. Just a cozy community of indie devs, pixel artists, and audio
              wizards teaming up for their next game jam adventure.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap items-center gap-4">
              <button className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-slate-900 bg-teal-500 px-8 py-4 text-lg font-extrabold text-white shadow-[4px_4px_0_#0f172a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#0f172a] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                Find your Squad 🚀
              </button>
              <a
                href="#features"
                className="text-sm font-semibold text-slate-500 underline underline-offset-4 hover:text-slate-800"
              >
                See how it works &darr;
              </a>
            </div>

            {/* social proof pill */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Sparkles className="h-4 w-4 text-teal-500" />
              <span>
                <strong className="text-slate-700">1,200+ jammers</strong> already assembled their crews
              </span>
            </div>
          </div>

          {/* Right: player card cluster */}
          <div className="relative flex items-center justify-center" aria-hidden="true">
            <div className="relative h-[380px] w-full max-w-md">
              {playerCards.map((card, i) => {
                const Icon = card.icon
                return (
                  <div
                    key={card.role}
                    className={`absolute flex flex-col gap-3 rounded-2xl border-2 border-slate-300 bg-white p-4 shadow-[4px_4px_0_#cbd5e1] ${card.rotate}`}
                    style={{
                      width: "200px",
                      top: `${[10, 60, 130, 190][i]}px`,
                      left: `${[20, 150, 30, 170][i]}px`,
                      zIndex: i + 1,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-50`}
                      >
                        <Icon className={`h-5 w-5 text-teal-600`} />
                      </span>
                      <span className="text-sm font-bold leading-tight text-slate-800">
                        {card.role}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                        {card.tag}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        {card.timezone}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Gamepad2 className="h-3 w-3" />
                      <span>{card.jams} jams completed</span>
                    </div>
                  </div>
                )
              })}

              {/* connecting line decoration */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line x1="120" y1="55" x2="200" y2="80" stroke="#14b8a6" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
                <line x1="200" y1="155" x2="130" y2="175" stroke="#14b8a6" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
