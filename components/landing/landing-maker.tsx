"use client"

import { Coffee, Code2 } from "lucide-react"

const DOT_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%2394a3b8' fill-opacity='0.35'/%3E%3C/svg%3E")`

export function LandingMaker() {
  return (
    <section
      className="relative overflow-hidden px-4 py-20 md:px-6 lg:px-8 lg:py-28 border-t-2 border-b-2 border-dashed border-slate-300"
      style={{ backgroundImage: DOT_PATTERN, backgroundColor: "var(--background)" }}
    >
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-16">

          {/* ── Left: photo placeholder ── */}
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            {/* Photo frame */}
            <div className="relative">
              {/* Offset shadow layer */}
              <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl border-2 border-foreground bg-teal/20" />
              <div className="relative flex size-52 items-center justify-center rounded-2xl border-2 border-foreground bg-card shadow-none overflow-hidden">
                {/* Placeholder avatar illustration */}
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <div className="flex size-20 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-muted text-4xl">
                    🧑‍💻
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">Your photo here</p>
                </div>
              </div>
            </div>

            {/* Caption */}
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span>Made with</span>
              <Coffee className="size-4 text-peach" />
              <span>and</span>
              <Code2 className="size-4 text-teal" />
              <span>by a fellow jammer.</span>
            </p>
          </div>

          {/* ── Right: text ── */}
          <div className="flex-1 max-w-xl">
            {/* Section label chip */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-3 py-1 text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_var(--neo-shadow)]">
              <span className="text-teal">✦</span>
              Meet the Maker
            </div>

            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Hey, I&apos;m{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-teal">[Your Name].</span>
                <span className="absolute inset-x-0 bottom-0 h-3 -z-0 bg-teal/10 rounded" />
              </span>{" "}
              I built this.
            </h2>

            {/* Story */}
            <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-700">
              <p>
                {"I've done my share of intense game jams. I got tired of dead teams, abandoned forums, and ghosting mid-project, so I built GameJamCrew to help us connect and actually finish our games."}
              </p>
              <p className="font-semibold text-slate-900">
                No VC money, no corporate hidden agenda. Just a passion for game dev.
              </p>
              <p>See you on the next one!</p>
            </div>

            {/* Signature */}
            <div className="mt-6 inline-flex items-center gap-3 rounded-xl border-2 border-foreground bg-card px-5 py-3 shadow-[3px_3px_0px_0px_var(--neo-shadow)]">
              <span className="text-2xl">⚔️</span>
              <p className="font-extrabold text-slate-900">— Happy Jamming!</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
