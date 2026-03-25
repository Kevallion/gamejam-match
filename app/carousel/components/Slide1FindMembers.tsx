"use client"

import { Search, Cpu, Globe, Calendar, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"
import { ROLE_STYLES } from "@/lib/constants"

const members = [
  {
    name: "PixelKnight",
    level: 12,
    xp: 3600,
    role: "developer",
    experience: "senior",
    engine: "Godot",
    lang: "English",
    availability: "Apr 1 – Apr 3",
    bio: "Godot & GDScript wizard. 12 jam wins.",
    kudos: { technical: 8, creative: 3 },
  },
  {
    name: "NeonBrush",
    level: 8,
    xp: 1600,
    role: "2d-artist",
    experience: "advanced",
    engine: "Krita",
    lang: "French",
    availability: "Apr 1 – Apr 3",
    bio: "Pixel artist & animator. 6+ jam games.",
    kudos: { creative: 12, technical: 2 },
  },
  {
    name: "SoundSculptor",
    level: 5,
    xp: 625,
    role: "audio",
    experience: "regular",
    engine: "Reaper",
    lang: "Spanish",
    availability: "Mar 28 – Apr 3",
    bio: "Chiptune & ambient composer.",
    kudos: { creative: 6, leadership: 2 },
  },
  {
    name: "GameArchitect",
    level: 15,
    xp: 5625,
    role: "game-design",
    experience: "veteran",
    engine: "Unreal",
    lang: "English",
    availability: "Apr 1 – Apr 3",
    bio: "10 years indie. Led 3 published titles.",
    kudos: { leadership: 8, creative: 5, technical: 3 },
  },
  {
    name: "VoxelCrafter",
    level: 6,
    xp: 900,
    role: "3d-artist",
    experience: "junior",
    engine: "Blender",
    lang: "English",
    availability: "Apr 2 – Apr 3",
    bio: "Low-poly 3D modeler & rigger.",
    kudos: { creative: 5, technical: 2 },
  },
  {
    name: "UIWizard",
    level: 9,
    xp: 2025,
    role: "ui-ux",
    experience: "advanced",
    engine: "Figma",
    lang: "Portuguese",
    availability: "Apr 1 – Apr 3",
    bio: "Intuitive jam UIs. Figma pro.",
    kudos: { creative: 8, technical: 4 },
  },
]

const EXPERIENCE_STYLES: Record<string, { label: string; emoji: string; color: string }> = {
  beginner: { label: "Beginner", emoji: "🌱", color: "bg-sky-500/10 text-sky-700" },
  junior: { label: "Junior", emoji: "📚", color: "bg-emerald-500/10 text-emerald-700" },
  regular: { label: "Regular", emoji: "🎮", color: "bg-blue-500/10 text-blue-700" },
  advanced: { label: "Advanced", emoji: "⚡", color: "bg-violet-500/10 text-violet-700" },
  senior: { label: "Senior", emoji: "🎯", color: "bg-orange-500/10 text-orange-700" },
  veteran: { label: "Veteran", emoji: "👑", color: "bg-amber-500/10 text-amber-700" },
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function Slide1FindMembers() {
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

      {/* Filter sidebar */}
      <aside className="w-[200px] bg-white border-r border-slate-200/50 flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Filters</div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
            <input
              readOnly
              placeholder="Search…"
              className="w-full h-8 pl-8 pr-3 text-xs rounded-md border border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div className="mb-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Role</div>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Developer", emoji: "💻", active: true },
                { label: "2D Artist", emoji: "🎨" },
                { label: "Audio", emoji: "🎵" },
                { label: "Game Designer", emoji: "🎯" },
              ].map((r) => (
                <div
                  key={r.label}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${r.active ? "bg-teal-500/10 text-teal-700" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  {r.active && <CheckCircle2 className="w-3 h-3 text-teal-600" />}
                  <span>{r.emoji}</span>
                  <span className="truncate">{r.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Experience</div>
            <div className="flex flex-col gap-1">
              {["🌱 Beginner", "📚 Junior", "🎮 Regular", "🎯 Senior"].map((e) => (
                <div key={e} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                  {e.split(" ")[0]}
                  <span className="truncate">{e.split(" ")[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-4 py-3 mt-auto border-t border-slate-100 text-xs text-slate-500">
          <span className="font-semibold text-slate-800">248</span> jammers found
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200/50 bg-white flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-slate-900">Find Your Perfect Teammate</h1>
            <p className="text-xs text-slate-500 mt-0.5">Discover talented jammers ready for their next squad</p>
          </div>
          <div className="flex items-center gap-1.5 bg-teal-500/10 text-teal-700 rounded-lg px-3 py-1.5 text-xs font-semibold border border-teal-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Smart Match
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="grid grid-cols-3 gap-3 h-full" style={{ gridTemplateRows: "repeat(2, 1fr)" }}>
            {members.map((m) => {
              const roleStyle = ROLE_STYLES[m.role] || { label: m.role, emoji: "🎮", color: "" }
              const expStyle = EXPERIENCE_STYLES[m.experience] || { label: m.experience, emoji: "❓", color: "" }
              return (
                <div
                  key={m.name}
                  className="bg-white rounded-xl border border-slate-200/50 p-3.5 flex flex-col gap-2.5 hover:border-teal-300 hover:shadow-md transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {getInitials(m.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">{m.name}</span>
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full shrink-0">
                            Lv.{m.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1">
                    <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-2 py-0.5 rounded-full border border-teal-200 ${roleStyle.color}`}>
                      {roleStyle.emoji}
                      {roleStyle.label}
                    </span>
                    <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-2 py-0.5 rounded-full ${expStyle.color}`}>
                      {expStyle.emoji}
                      {expStyle.label}
                    </span>
                  </div>

                  {/* Kudos */}
                  {Object.values(m.kudos).some((k) => k > 0) && (
                    <div className="flex gap-1 flex-wrap">
                      {m.kudos.technical > 0 && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                          💻 {m.kudos.technical}
                        </span>
                      )}
                      {m.kudos.creative > 0 && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                          ✨ {m.kudos.creative}
                        </span>
                      )}
                      {m.kudos.leadership > 0 && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                          🤝 {m.kudos.leadership}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tech stack */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-600">
                    <Cpu className="w-3 h-3 text-slate-400" />
                    <span>{m.engine}</span>
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span>{m.lang}</span>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center gap-1 text-[9px] text-slate-600 border border-slate-200 rounded-lg px-2 py-1 bg-slate-50">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span className="truncate">{m.availability}</span>
                  </div>

                  {/* Bio */}
                  <p className="text-[10px] text-slate-600 leading-tight line-clamp-2 flex-1">{m.bio}</p>

                  {/* CTA */}
                  <button className="w-full flex items-center justify-center gap-1 bg-teal-500 hover:bg-teal-600 text-white text-[9px] font-bold py-1.5 rounded-lg transition-colors">
                    Invite <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* Slide indicator */}
      <div className="absolute bottom-4 right-5 flex items-center gap-2">
        <span className="text-[9px] font-bold text-slate-400 uppercase">1/5</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-teal-500" : "bg-slate-300"}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Users({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx={9} cy={7} r={4} />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
