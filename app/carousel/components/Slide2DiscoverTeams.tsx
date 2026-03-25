"use client"

import {
  Search,
  Cpu,
  Globe,
  Users,
  ArrowRight,
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  X,
  Shield,
  Calendar,
  Link2,
} from "lucide-react"

const jamStatusMap = {
  live: { label: "Live Now 🔴", cls: "border-red-400/40 bg-red-50 text-red-600 font-semibold" },
  upcoming: (days: number) => ({ label: `Starts in ${days} days`, cls: "border-sky-400/30 bg-sky-50 text-sky-700" }),
  pending: { label: "Dates to be confirmed", cls: "border-amber-400/40 bg-amber-50 text-amber-700 font-medium" },
  ended: { label: "Jam Ended", cls: "border-slate-300 bg-slate-50 text-slate-500" },
}

const teams = [
  {
    name: "Pixel Storm",
    jam: "Ludum Dare 57",
    engine: "Godot",
    lang: "English",
    members: 2,
    max: 4,
    status: jamStatusMap.live,
    vibe: { label: "Competitive", emoji: "🏆", color: "bg-red-500/10 text-red-600" },
    level: { label: "Senior / Specialist", emoji: "🎯", color: "bg-orange-500/10 text-orange-600" },
    roles: [
      { label: "Developer", emoji: "💻", color: "bg-teal-500/15 text-teal-700" },
      { label: "2D Artist", emoji: "🎨", color: "bg-pink-500/15 text-pink-700" },
    ],
    recommended: true,
    spotsLeft: 1,
  },
  {
    name: "NeonCraft",
    jam: "GMTK 2026",
    engine: "Unity",
    lang: "French",
    members: 1,
    max: 3,
    status: jamStatusMap.upcoming(3),
    vibe: { label: "Dedicated", emoji: "🔥", color: "bg-orange-500/10 text-orange-600" },
    level: { label: "Regular Jammer", emoji: "🎮", color: "bg-blue-500/10 text-blue-600" },
    roles: [
      { label: "2D Artist", emoji: "🎨", color: "bg-pink-500/15 text-pink-700" },
      { label: "Audio", emoji: "🎵", color: "bg-violet-500/15 text-violet-700" },
    ],
    recommended: false,
    spotsLeft: 2,
  },
  {
    name: "ChillPixels",
    jam: "Brackeys Game Jam",
    engine: "GameMaker",
    lang: "English",
    members: 2,
    max: 3,
    status: jamStatusMap.pending,
    vibe: { label: "Chill & Relaxed", emoji: "☕", color: "bg-emerald-500/10 text-emerald-600" },
    level: { label: "Beginner / Learner", emoji: "🌱", color: "bg-sky-400/15 text-sky-600" },
    roles: [{ label: "Developer", emoji: "💻", color: "bg-teal-500/15 text-teal-700" }],
    recommended: false,
    spotsLeft: 1,
  },
  {
    name: "RetroFusion",
    jam: "Godot Wild Jam 78",
    engine: "Godot",
    lang: "Spanish",
    members: 3,
    max: 5,
    status: jamStatusMap.upcoming(7),
    vibe: { label: "Learning", emoji: "📖", color: "bg-blue-500/10 text-blue-600" },
    level: { label: "Junior / Student", emoji: "📚", color: "bg-emerald-500/10 text-emerald-600" },
    roles: [
      { label: "3D Artist", emoji: "🗿", color: "bg-orange-500/15 text-orange-700" },
      { label: "Audio", emoji: "🎵", color: "bg-violet-500/15 text-violet-700" },
    ],
    recommended: false,
    spotsLeft: 2,
  },
  {
    name: "VoxelBrigade",
    jam: "Mini Jam 170",
    engine: "Unreal Engine",
    lang: "English",
    members: 2,
    max: 4,
    status: jamStatusMap.live,
    vibe: { label: "Dedicated", emoji: "🔥", color: "bg-orange-500/10 text-orange-600" },
    level: { label: "Advanced / Versatile", emoji: "⚡", color: "bg-violet-500/10 text-violet-600" },
    roles: [
      { label: "Developer", emoji: "💻", color: "bg-teal-500/15 text-teal-700" },
      { label: "Game Designer", emoji: "🎯", color: "bg-amber-500/15 text-amber-700" },
    ],
    recommended: false,
    spotsLeft: 2,
  },
  {
    name: "StarlightDevs",
    jam: "GMTK 2026",
    engine: "Unity",
    lang: "Portuguese",
    members: 1,
    max: 4,
    status: jamStatusMap.upcoming(3),
    vibe: { label: "Competitive", emoji: "🏆", color: "bg-red-500/10 text-red-600" },
    level: { label: "Senior / Specialist", emoji: "🎯", color: "bg-orange-500/10 text-orange-600" },
    roles: [
      { label: "2D Artist", emoji: "🎨", color: "bg-pink-500/15 text-pink-700" },
      { label: "Audio", emoji: "🎵", color: "bg-violet-500/15 text-violet-700" },
      { label: "UI / UX", emoji: "✨", color: "bg-emerald-500/15 text-emerald-700" },
    ],
    recommended: false,
    spotsLeft: 3,
  },
]

const navItems = [
  { icon: "compass", label: "Explore", active: true },
  { icon: "users", label: "Members" },
  { icon: "layout", label: "Dashboard" },
  { icon: "book", label: "Resources" },
  { icon: "message", label: "Messages" },
]

function NavIcon({ type, active }: { type: string; active?: boolean }) {
  const cls = `w-5 h-5 ${active ? "text-teal-600" : "text-slate-400"}`
  if (type === "compass") return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx={12} cy={12} r={10} /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
  if (type === "users") return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx={9} cy={7} r={4} /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  if (type === "layout") return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x={3} y={3} width={7} height={7} rx={1} /><rect x={14} y={3} width={7} height={7} rx={1} /><rect x={14} y={14} width={7} height={7} rx={1} /><rect x={3} y={14} width={7} height={7} rx={1} /></svg>
  if (type === "book") return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
  if (type === "message") return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
  return null
}

// The Sheet (slide-over) showing details for "Pixel Storm"
function SheetPanel() {
  const team = teams[0]
  return (
    <div className="w-[280px] bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden shadow-xl">
      {/* Sheet header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-base font-extrabold text-slate-900">{team.name}</h2>
              <span className="text-[9px] font-bold border border-teal-500/30 bg-teal-500/10 text-teal-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                Perfect Match
              </span>
            </div>
            <p className="text-xs font-semibold text-teal-600">{team.jam}</p>
          </div>
          <button className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Jam status */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold mt-2 ${team.status.cls}`}>
          {team.status.label}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200 bg-violet-500/10 text-violet-700">
            <Cpu className="w-3 h-3" />{team.engine}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200 bg-teal-500/10 text-teal-700">
            <Globe className="w-3 h-3" />{team.lang}
          </span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${team.level.color}`}>
            {team.level.emoji} {team.level.label}
          </span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${team.vibe.color}`}>
            {team.vibe.emoji} {team.vibe.label}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border border-slate-200 text-slate-500">
            <Users className="w-3 h-3" />{team.members}/{team.max} members
          </span>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Veteran team going all-in on Ludum Dare 57. We aim for top 10 in Gameplay. No excuses, just shipping polished games. Discord-first communication.
          </p>
        </div>

        {/* Roles */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Roles Sought</h4>
          <div className="flex flex-col gap-1.5">
            {[
              { label: "Developer", emoji: "💻", color: "bg-teal-500/15 text-teal-700", filled: false },
              { label: "2D Artist", emoji: "🎨", color: "bg-pink-500/15 text-pink-700", filled: true },
              { label: "Audio", emoji: "🎵", color: "bg-violet-500/15 text-violet-700", filled: false },
            ].map((r) => (
              <div key={r.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${r.filled ? "border-slate-200 bg-slate-50 opacity-60" : "border-slate-200 bg-white"}`}>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${r.filled ? "bg-slate-200 text-slate-500" : r.color}`}>
                  {r.emoji} {r.label}
                </span>
                {r.filled && <span className="ml-auto text-[9px] text-slate-400 font-medium">Filled</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Owner */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Team Leader</h4>
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
            <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">PK</div>
            <div>
              <p className="text-xs font-bold text-slate-800">PixelKnight</p>
              <p className="text-[9px] text-slate-400">View profile</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sheet footer CTA */}
      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
        <button className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
          Apply to Pixel Storm <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function Slide2DiscoverTeams() {
  return (
    <div className="w-[1080px] h-[1080px] bg-[#f8fafc] flex overflow-hidden font-sans relative">
      {/* Sidebar */}
      <aside className="w-[64px] bg-white border-r border-slate-200 flex flex-col items-center py-5 gap-1 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center mb-4">
          <span className="text-white font-extrabold text-sm">GJ</span>
        </div>
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer ${item.active ? "bg-teal-500/10" : "hover:bg-slate-100"}`}
            title={item.label}
          >
            <NavIcon type={item.icon} active={item.active} />
          </div>
        ))}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="px-5 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-extrabold text-slate-900">Discover Live Teams</h1>
            <p className="text-xs text-slate-500 mt-0.5">Browse squads recruiting for upcoming & live game jams</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input readOnly placeholder="Search teams, jams…" className="h-8 pl-8 pr-3 w-48 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none" />
            </div>
            {/* Filter chips */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-700 border border-teal-500/20">Godot</span>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 border border-red-500/20 flex items-center gap-1">
                🔴 Live Now
              </span>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">All levels</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Team grid */}
          <div className="flex-1 p-4 overflow-hidden">
            <div className="grid grid-cols-3 gap-3 h-full" style={{ gridTemplateRows: "repeat(2, 1fr)" }}>
              {teams.map((team, idx) => (
                <article
                  key={team.name}
                  className={`bg-white rounded-xl border p-4 flex flex-col cursor-pointer transition-all hover:shadow-md ${
                    team.recommended
                      ? "border-teal-400/50 shadow-sm shadow-teal-500/10 bg-gradient-to-br from-white to-teal-50/50"
                      : "border-slate-200 hover:border-teal-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900">{team.name}</h3>
                        {team.recommended && (
                          <span className="text-[9px] font-bold bg-teal-500/10 text-teal-700 border border-teal-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />Match
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-teal-600 mt-0.5">{team.jam}</p>
                    </div>
                  </div>

                  {/* Jam status badge */}
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold mb-2.5 w-fit ${team.status.cls}`}>
                    {team.status.label}
                  </div>

                  {/* Roles + level */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${team.level.color}`}>
                      {team.level.emoji} {team.level.label}
                    </span>
                    {team.roles.map((r) => (
                      <span key={r.label} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.color}`}>
                        {r.emoji} {r.label}
                      </span>
                    ))}
                  </div>

                  {/* Engine / Language / Members */}
                  <div className="mt-auto border-t border-slate-100 pt-2.5 flex items-center justify-between text-[10px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-violet-400" />{team.engine}</span>
                      <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-teal-500" />{team.lang}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {team.spotsLeft === 1 && (
                        <span className="text-orange-500 flex items-center gap-0.5"><Flame className="w-3 h-3" />1 left</span>
                      )}
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{team.members}/{team.max}</span>
                    </div>
                  </div>

                  <div className="mt-2 pointer-events-none opacity-0 group-hover:opacity-100 text-[10px] text-teal-600 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> View details
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Sheet panel */}
          <SheetPanel />
        </div>
      </div>

      {/* Slide label */}
      <div className="absolute bottom-4 right-5 flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2 / 5</span>
        <div className="flex gap-1">
          {[0,1,2,3,4].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i===1 ? "bg-teal-500" : "bg-slate-300"}`} />)}
        </div>
      </div>
    </div>
  )
}
