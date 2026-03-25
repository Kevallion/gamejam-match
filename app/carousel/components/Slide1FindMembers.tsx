"use client"

import {
  Search,
  Users,
  Cpu,
  Globe,
  Calendar,
  Star,
  ArrowRight,
  Filter,
  ChevronDown,
  MapPin,
  Sparkles,
  CheckCircle2,
} from "lucide-react"

const members = [
  {
    name: "PixelKnight",
    title: "Pixel Knight",
    level: 12,
    role: { label: "Developer", emoji: "💻", color: "bg-teal-500/15 text-teal-700 border-teal-500/30" },
    level2: { label: "Senior / Specialist", emoji: "🎯", color: "bg-orange-500/10 text-orange-600" },
    engine: "Godot",
    lang: "English",
    availability: "Apr 1 – Apr 3",
    bio: "Godot & GDScript wizard. 12 jam wins. Love procedural generation and retro aesthetics.",
    kudos: [{ emoji: "🤝", n: 14 }, { emoji: "💡", n: 9 }, { emoji: "🔥", n: 7 }],
    avatar: "PK",
    avatarColor: "bg-teal-500",
  },
  {
    name: "NeonBrush",
    title: "Pixel Artist",
    level: 8,
    role: { label: "2D Artist", emoji: "🎨", color: "bg-pink-500/15 text-pink-700 border-pink-500/30" },
    level2: { label: "Advanced / Versatile", emoji: "⚡", color: "bg-violet-500/10 text-violet-600" },
    engine: "Unity",
    lang: "French",
    availability: "Apr 1 – Apr 3",
    bio: "Specializing in pixel art and UI illustrations. Strong animator — 6+ jam games shipped.",
    kudos: [{ emoji: "🎨", n: 22 }, { emoji: "💡", n: 11 }],
    avatar: "NB",
    avatarColor: "bg-pink-500",
  },
  {
    name: "SoundSculptor",
    title: "Audio Wizard",
    level: 5,
    role: { label: "Audio / Music", emoji: "🎵", color: "bg-violet-500/15 text-violet-700 border-violet-500/30" },
    level2: { label: "Regular Jammer", emoji: "🎮", color: "bg-blue-500/10 text-blue-600" },
    engine: "GameMaker",
    lang: "Spanish",
    availability: "Mar 28 – Apr 3",
    bio: "Chiptune & ambient composer. Fast turnaround. Tools: LMMS, FamiTracker.",
    kudos: [{ emoji: "🎵", n: 18 }, { emoji: "🤝", n: 5 }],
    avatar: "SS",
    avatarColor: "bg-violet-500",
  },
  {
    name: "GameArchitect",
    title: "Design Lead",
    level: 15,
    role: { label: "Game Designer", emoji: "🎯", color: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
    level2: { label: "Veteran", emoji: "👑", color: "bg-amber-500/10 text-amber-600" },
    engine: "Unreal Engine",
    lang: "English",
    availability: "Apr 1 – Apr 3",
    bio: "10 years indie dev. Led 3 published jam titles. Obsessed with game feel and player psychology.",
    kudos: [{ emoji: "🔥", n: 31 }, { emoji: "💡", n: 19 }, { emoji: "🎯", n: 12 }],
    avatar: "GA",
    avatarColor: "bg-amber-500",
  },
  {
    name: "VoxelCrafter",
    title: "3D Generalist",
    level: 6,
    role: { label: "3D Artist", emoji: "🗿", color: "bg-orange-500/15 text-orange-700 border-orange-500/30" },
    level2: { label: "Junior / Student", emoji: "📚", color: "bg-emerald-500/10 text-emerald-600" },
    engine: "Godot",
    lang: "English",
    availability: "Apr 2 – Apr 3",
    bio: "Low-poly 3D modeler & rigger. Blender pro. Passionate about stylized art pipelines.",
    kudos: [{ emoji: "🎨", n: 7 }, { emoji: "💡", n: 3 }],
    avatar: "VC",
    avatarColor: "bg-orange-500",
  },
  {
    name: "UIWizard",
    title: "Interface Guru",
    level: 9,
    role: { label: "UI / UX", emoji: "✨", color: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
    level2: { label: "Advanced / Versatile", emoji: "⚡", color: "bg-violet-500/10 text-violet-600" },
    engine: "Unity",
    lang: "Portuguese",
    availability: "Apr 1 – Apr 3",
    bio: "Crafting intuitive jam UIs. React + Figma daily driver. UX patterns for game menus.",
    kudos: [{ emoji: "✨", n: 14 }, { emoji: "🤝", n: 8 }],
    avatar: "UW",
    avatarColor: "bg-emerald-500",
  },
]

const navItems = [
  { icon: "compass", label: "Explore" },
  { icon: "users", label: "Members", active: true },
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

export default function Slide1FindMembers() {
  return (
    <div className="w-[1080px] h-[1080px] bg-[#f8fafc] flex overflow-hidden font-sans relative">
      {/* Sidebar */}
      <aside className="w-[64px] bg-white border-r border-slate-200 flex flex-col items-center py-5 gap-1 shrink-0">
        {/* Logo */}
        <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center mb-4">
          <span className="text-white font-extrabold text-sm">GJ</span>
        </div>
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${item.active ? "bg-teal-500/10" : "hover:bg-slate-100"}`}
            title={item.label}
          >
            <NavIcon type={item.icon} active={item.active} />
          </div>
        ))}
      </aside>

      {/* Filter sidebar */}
      <aside className="w-[210px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Filters</div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              readOnly
              placeholder="Search jammers…"
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400 outline-none"
            />
          </div>

          {/* Role filter */}
          <div className="mb-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Role</div>
            <div className="flex flex-col gap-1">
              {[
                { label: "Developer", color: "bg-teal-500/10 text-teal-700", active: true },
                { label: "2D Artist", color: "bg-pink-500/10 text-pink-700" },
                { label: "Audio / Music", color: "bg-violet-500/10 text-violet-700" },
                { label: "Game Designer", color: "bg-amber-500/10 text-amber-700" },
                { label: "3D Artist", color: "bg-orange-500/10 text-orange-700" },
              ].map((r) => (
                <div key={r.label} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${r.active ? r.color + " ring-1 ring-teal-500/30" : "text-slate-600 hover:bg-slate-50"}`}>
                  {r.active && <CheckCircle2 className="w-3 h-3 text-teal-600 shrink-0" />}
                  <span>{r.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="mb-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Availability</div>
            <div className="flex flex-col gap-1">
              {[
                { label: "Available Now", active: true },
                { label: "This Week" },
                { label: "Next Week" },
              ].map((a) => (
                <div key={a.label} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${a.active ? "bg-teal-500/10 text-teal-700 ring-1 ring-teal-500/30" : "text-slate-600 hover:bg-slate-50"}`}>
                  {a.active && <CheckCircle2 className="w-3 h-3 text-teal-600 shrink-0" />}
                  {a.label}
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Experience</div>
            <div className="flex flex-col gap-1">
              {[
                { label: "Beginner / Learner", emoji: "🌱" },
                { label: "Junior / Student", emoji: "📚" },
                { label: "Regular Jammer", emoji: "🎮" },
                { label: "Senior / Specialist", emoji: "🎯", active: true },
              ].map((e) => (
                <div key={e.label} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${e.active ? "bg-teal-500/10 text-teal-700 ring-1 ring-teal-500/30" : "text-slate-600 hover:bg-slate-50"}`}>
                  <span>{e.emoji}</span>
                  <span className="truncate">{e.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="px-4 py-3 mt-auto border-t border-slate-100">
          <p className="text-xs text-slate-500">Showing <span className="font-bold text-slate-800">248</span> available jammers</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-extrabold text-slate-900">Find Your Perfect Teammate</h1>
            <p className="text-xs text-slate-500 mt-0.5">Discover talented game jammers ready for their next challenge</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-teal-500/10 text-teal-700 rounded-lg px-3 py-1.5 text-xs font-semibold border border-teal-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Match On
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="grid grid-cols-3 gap-3 h-full" style={{ gridTemplateRows: "repeat(2, 1fr)" }}>
            {members.map((m) => (
              <div key={m.name} className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-col gap-2 hover:border-teal-500/40 hover:shadow-md hover:shadow-teal-500/5 transition-all cursor-pointer">
                {/* Avatar + Name */}
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full ${m.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {m.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900 truncate">{m.name}</span>
                      <span className="shrink-0 text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">Lv.{m.level}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{m.title}</span>
                  </div>
                </div>

                {/* Role + Level badges */}
                <div className="flex flex-wrap gap-1">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${m.role.color}`}>
                    {m.role.emoji} {m.role.label}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.level2.color}`}>
                    {m.level2.emoji} {m.level2.label}
                  </span>
                </div>

                {/* Kudos */}
                <div className="flex gap-1">
                  {m.kudos.map((k) => (
                    <span key={k.emoji} className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                      {k.emoji} {k.n}
                    </span>
                  ))}
                </div>

                {/* Engine + Language */}
                <div className="flex items-center gap-2.5 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-violet-400" />{m.engine}</span>
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-teal-500" />{m.lang}</span>
                </div>

                {/* Availability */}
                <div className="flex items-center gap-1 text-[10px] text-slate-500 border border-slate-200 rounded-lg px-2 py-1 bg-slate-50">
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span className="truncate">Available: {m.availability}</span>
                </div>

                {/* Bio */}
                <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 flex-1">{m.bio}</p>

                {/* CTA */}
                <button className="w-full flex items-center justify-center gap-1.5 bg-teal-500 hover:bg-teal-600 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors mt-auto">
                  Apply to Team <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Slide label overlay */}
      <div className="absolute bottom-4 right-5 flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">1 / 5</span>
        <div className="flex gap-1">
          {[0,1,2,3,4].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i===0 ? "bg-teal-500" : "bg-slate-300"}`} />)}
        </div>
      </div>
    </div>
  )
}
