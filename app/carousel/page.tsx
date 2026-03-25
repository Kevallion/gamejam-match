"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"
import Slide1FindMembers from "./components/Slide1FindMembers"
import Slide2DiscoverTeams from "./components/Slide2DiscoverTeams"
import Slide3Dashboard from "./components/Slide3Dashboard"
import Slide4CreateTeam from "./components/Slide4CreateTeam"
import Slide5SquadSpace from "./components/Slide5SquadSpace"

const slides = [
  {
    component: Slide1FindMembers,
    title: "Find Your Perfect Teammate",
    subtitle: "The Member Search",
    number: 1,
  },
  {
    component: Slide2DiscoverTeams,
    title: "Discover Live Teams",
    subtitle: "The Team Search with Jam Calendar",
    number: 2,
  },
  {
    component: Slide3Dashboard,
    title: "Your Matchmaking Hub",
    subtitle: "The Dashboard — Bento Grid",
    number: 3,
  },
  {
    component: Slide4CreateTeam,
    title: "Launch Your Squad",
    subtitle: "Team Creation Wizard",
    number: 4,
  },
  {
    component: Slide5SquadSpace,
    title: "Collaboration Zone",
    subtitle: "The Squad Space",
    number: 5,
  },
]

export default function CarouselPage() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((c) => Math.max(0, c - 1))
  const next = () => setCurrent((c) => Math.min(slides.length - 1, c + 1))

  const ActiveSlide = slides[current].component

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center gap-6 p-6 font-sans">
      {/* Header */}
      <div className="text-center max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          GameJamCrew — LinkedIn Carousel Preview
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2 text-balance">
          {slides[current].title}
        </h1>
        <p className="text-slate-400 text-sm">{slides[current].subtitle}</p>
      </div>

      {/* Slide viewer */}
      <div className="relative flex items-center gap-6">
        <button
          onClick={prev}
          disabled={current === 0}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all border border-white/20 backdrop-blur"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* The 1080x1080 slide — scaled to fit in viewport */}
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10"
          style={{
            width: "min(1080px, calc(100vw - 220px))",
            aspectRatio: "1 / 1",
          }}
        >
          <div
            style={{
              width: 1080,
              height: 1080,
              transformOrigin: "top left",
              transform: `scale(calc(min(1080px, calc(100vw - 220px)) / 1080))`,
            }}
          >
            <ActiveSlide />
          </div>
        </div>

        <button
          onClick={next}
          disabled={current === slides.length - 1}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all border border-white/20 backdrop-blur"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Dot navigation */}
      <div className="flex items-center gap-3">
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`flex flex-col items-center gap-1.5 group`}
          >
            <div className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? "bg-teal-400 scale-125" : "bg-slate-600 hover:bg-slate-400"}`} />
            <span className={`text-[10px] font-medium transition-colors ${i === current ? "text-teal-300" : "text-slate-600 group-hover:text-slate-400"}`}>
              {i + 1}
            </span>
          </button>
        ))}
      </div>

      {/* Slide thumbnails */}
      <div className="flex gap-3 flex-wrap justify-center max-w-3xl">
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`flex flex-col items-center gap-2 group`}
          >
            <div className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              i === current
                ? "bg-teal-500/20 border-teal-500/50 text-teal-200"
                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200"
            }`}>
              <span className="text-[10px] font-bold opacity-60 mr-2">{i + 1}</span>
              {s.title}
            </div>
          </button>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-slate-600 text-xs text-center">
        1080×1080px LinkedIn carousel — 5 slides · GameJamCrew · Built with Next.js & shadcn/ui
      </p>
    </div>
  )
}
