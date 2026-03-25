"use client"

import { Users, Cpu, Globe, Calendar, ArrowRight, Sparkles, MessageSquareText } from "lucide-react"
import { ROLE_STYLES } from "@/lib/constants"

const teams = [
  {
    id: "1",
    name: "RetroRush",
    jam: "Ludum Dare 57",
    engine: "Godot",
    language: "English",
    members: 3,
    maxMembers: 5,
    rolesNeeded: ["2d-artist", "audio"],
    description: "16-bit adventure game with cozy vibes and chiptune soundtrack",
    jamStartDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    jamEndDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "2",
    name: "PixelDreams",
    jam: "Global Game Jam 2026",
    engine: "Unity",
    language: "Spanish",
    members: 4,
    maxMembers: 6,
    rolesNeeded: ["developer"],
    description: "Top-down puzzle action game. Looking for strong programmer",
    jamStartDate: new Date(Date.now() - 3600000).toISOString(),
    jamEndDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "3",
    name: "CreativeFlow",
    jam: "Indie Spirits Jam 2026",
    engine: "Unreal",
    language: "French",
    members: 2,
    maxMembers: 8,
    rolesNeeded: ["developer", "3d-artist", "game-design"],
    description: "Story-driven 3D experience. First-time jammers welcome!",
    jamStartDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    jamEndDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    createdAt: new Date(Date.now()).toISOString(),
  },
  {
    id: "4",
    name: "SonicLegends",
    jam: "Speedrun Game Jam",
    engine: "GameMaker",
    language: "English",
    members: 5,
    maxMembers: 5,
    rolesNeeded: [],
    description: "Fast-paced platformer. Team is FULL!",
    jamStartDate: new Date(Date.now() - 3600000).toISOString(),
    jamEndDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "5",
    name: "ArtisticVisions",
    jam: "Pixel Art Showcase",
    engine: "Custom",
    language: "Portuguese",
    members: 1,
    maxMembers: 4,
    rolesNeeded: ["2d-artist", "developer", "audio"],
    description: "Beautiful pixel art game with experimental mechanics",
    jamStartDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    jamEndDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "6",
    name: "VirtualReality",
    jam: "XR Game Jam 2026",
    engine: "Unreal",
    language: "English",
    members: 2,
    maxMembers: 6,
    rolesNeeded: ["developer", "ui-ux"],
    description: "VR/AR experience. Experience with 3D math helpful.",
    jamStartDate: new Date(Date.now() + 86400000 * 6).toISOString(),
    jamEndDate: new Date(Date.now() + 86400000 * 8).toISOString(),
    createdAt: new Date(Date.now()).toISOString(),
  },
]

function getJamStatusBadge(startDate: string, endDate: string, createdAt: string) {
  const now = Date.now()
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()

  if (now > end) {
    return { label: "Jam Ended", color: "bg-slate-100 text-slate-600", badge: "border-slate-300" }
  }

  if (now < start) {
    const daysUntil = Math.ceil((start - now) / (1000 * 60 * 60 * 24))
    const label = daysUntil === 1 ? "Starts in 1 day" : `Starts in ${daysUntil} days`
    return { label, color: "bg-sky-100 text-sky-700", badge: "border-sky-300" }
  }

  return { label: "Live Now 🔴", color: "bg-red-100 text-red-700 animate-pulse", badge: "border-red-300" }
}

export function Slide2DiscoverTeams() {
  return (
    <div className="w-[1080px] h-[1080px] bg-[#f8fafc] flex overflow-hidden font-sans relative">
      {/* Sidebar */}
      <aside className="w-[56px] bg-white border-r border-slate-200/50 flex flex-col items-center py-4 gap-1 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center mb-3">
          <span className="text-white font-bold text-xs">GJ</span>
        </div>
        <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
          <Users className="w-4 h-4" />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200/50 bg-white flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-slate-900">Discover Open Teams</h1>
            <p className="text-xs text-slate-500 mt-0.5">Browse live jam squads looking for your role</p>
          </div>
          <div className="flex items-center gap-1.5 bg-teal-500/10 text-teal-700 rounded-lg px-3 py-1.5 text-xs font-semibold border border-teal-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            {teams.filter((t) => t.members < t.maxMembers).length} Available
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="grid grid-cols-3 gap-3 h-full" style={{ gridTemplateRows: "repeat(2, 1fr)" }}>
            {teams.map((t) => {
              const status = getJamStatusBadge(t.jamStartDate, t.jamEndDate, t.createdAt)
              const isFull = t.members >= t.maxMembers
              return (
                <div
                  key={t.id}
                  className={`bg-white rounded-xl border ${isFull ? "border-slate-200/30 opacity-75" : "border-slate-200/50"} p-3.5 flex flex-col gap-2.5 hover:border-teal-300 hover:shadow-md transition-all`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-slate-900 truncate">{t.name}</h3>
                      <p className="text-[10px] text-slate-500">{t.jam}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-[9px] font-semibold whitespace-nowrap ${status.color}`}>
                      {status.label}
                    </div>
                  </div>

                  {/* Tech stack */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-600">
                    <Cpu className="w-3 h-3 text-slate-400" />
                    <span>{t.engine}</span>
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span>{t.language}</span>
                  </div>

                  {/* Roles needed */}
                  <div className="flex flex-wrap gap-1">
                    {t.rolesNeeded.length > 0 ? (
                      t.rolesNeeded.slice(0, 3).map((role) => {
                        const style = ROLE_STYLES[role]
                        return (
                          <span
                            key={role}
                            className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border border-teal-200 ${style.color}`}
                          >
                            {style.emoji}
                            <span className="max-w-[60px] truncate">{style.label}</span>
                          </span>
                        )
                      })
                    ) : (
                      <span className="text-[9px] text-slate-500 italic">Team full</span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-[10px] text-slate-600 leading-tight line-clamp-2 flex-1">{t.description}</p>

                  {/* Team info */}
                  <div className="flex items-center justify-between text-[10px] text-slate-600 px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>
                        {t.members}/{t.maxMembers} members
                      </span>
                    </div>
                    <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 transition-all"
                        style={{ width: `${(t.members / t.maxMembers) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  {!isFull ? (
                    <button className="w-full flex items-center justify-center gap-1 bg-teal-500 hover:bg-teal-600 text-white text-[9px] font-bold py-1.5 rounded-lg transition-colors">
                      Apply <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <button className="w-full flex items-center justify-center gap-1 bg-slate-200 text-slate-600 text-[9px] font-bold py-1.5 rounded-lg cursor-not-allowed">
                      <MessageSquareText className="w-3 h-3" />
                      Message Team
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* Slide indicator */}
      <div className="absolute bottom-4 right-5 flex items-center gap-2">
        <span className="text-[9px] font-bold text-slate-400 uppercase">2/5</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 1 ? "bg-teal-500" : "bg-slate-300"}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
