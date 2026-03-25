"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Slide1FindMembers } from "./components/Slide1FindMembers"
import { Slide2DiscoverTeams } from "./components/Slide2DiscoverTeams"
import { Slide3Dashboard } from "./components/Slide3Dashboard"
import { Slide4CreateTeam } from "./components/Slide4CreateTeam"
import { Slide5SquadSpace } from "./components/Slide5SquadSpace"

const slides = [
  {
    component: Slide1FindMembers,
    label: "Find Members",
  },
  {
    component: Slide2DiscoverTeams,
    label: "Discover Teams",
  },
  {
    component: Slide3Dashboard,
    label: "Dashboard",
  },
  {
    component: Slide4CreateTeam,
    label: "Create Team",
  },
  {
    component: Slide5SquadSpace,
    label: "Squad Space",
  },
]

export default function CarouselPage() {
  const [current, setCurrent] = useState(0)
  const Slide = slides[current].component

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6 p-6 overflow-hidden">
      {/* Slide viewer */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setCurrent((p) => (p - 1 + slides.length) % slides.length)}
          className="w-10 h-10 rounded-full bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700">
          <Slide />
        </div>

        <button
          onClick={() => setCurrent((p) => (p + 1) % slides.length)}
          className="w-10 h-10 rounded-full bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-8">
        <span className="text-sm font-bold text-slate-300">
          {slides[current].label}
        </span>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === current ? "bg-teal-500 w-6" : "bg-slate-600 hover:bg-slate-500"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

