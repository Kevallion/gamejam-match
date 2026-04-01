"use client"

import Image from "next/image"
import { Coffee, Code2 } from "lucide-react"

import makerAvatar from "@/app/avataaar.png"

const DOT_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%2394a3b8' fill-opacity='0.35'/%3E%3C/svg%3E")`

export function LandingMaker() {
  return (
    <section
      className="relative overflow-hidden px-4 py-20 lg:px-8 lg:py-28"
      style={{ backgroundImage: DOT_PATTERN, backgroundColor: "var(--background)" }}
    >
      {/* Top divider */}
      <div className="mx-auto mb-16 max-w-6xl">
        <div className="h-0.5 w-full border-t-2 border-dashed border-slate-300" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-16">

          {/* ── Left: photo placeholder ── */}
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            {/* Photo frame */}
            <div className="relative">
              {/* Offset shadow layer */}
              <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-full bg-teal/20" />
              <div className="relative size-52 overflow-hidden rounded-full border-2 border-dotted border-foreground bg-card shadow-none">
                <Image
                  src={makerAvatar}
                  alt="Wisllor"
                  fill
                  className="object-cover object-top"
                  sizes="208px"
                  priority
                />
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-3 py-1 text-xs font-bold text-foreground shadow-[2px_2px_0px_0px_var(--neo-shadow)]">
              <span className="text-teal">✦</span>
              Meet the Maker
            </div>

            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Hello, I&apos;m{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-teal">Wisllor</span>
                <span className="absolute inset-x-0 bottom-0 h-3 -z-0 bg-teal/10 rounded" />
              </span>
              , the founder.
            </h2>

            {/* Story */}
            <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                I&apos;ve participated in several game jams, and I realized that finding a team online
                isn&apos;t that simple. Everything is decentralized, you have to post across multiple
                forums and scattered Discord communities.
              </p>
              <p>
                So, I decided to create GameJamCrew to centralize the search, help matching profiles
                connect faster, and focus on creating games.
              </p>
              <p className="font-semibold text-foreground">
                No VC money, no corporate hidden agenda. Just a passion for game dev.
              </p>
              <p>See you on the next one!</p>
            </div>

            {/* Signature */}
            <div className="mt-6 inline-flex items-center gap-3 rounded-xl border-2 border-foreground bg-card px-5 py-3 shadow-[3px_3px_0px_0px_var(--neo-shadow)]">
              <span className="text-2xl">⚔️</span>
              <p className="font-extrabold text-foreground">— Happy Jamming!</p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom divider */}
      <div className="mx-auto mt-16 max-w-6xl">
        <div className="h-0.5 w-full border-t-2 border-dashed border-slate-300" />
      </div>
    </section>
  )
}
