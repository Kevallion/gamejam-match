"use client"

import {
  Bell,
  Eye,
  Users,
  Rocket,
  Sparkles,
  Clock,
  MessageCircle,
  Settings,
  Cpu,
  ArrowRight,
  Trophy,
  Star,
  TrendingUp,
  CheckCircle2,
  Circle,
} from "lucide-react"

function NavIcon({ type, active }: { type: string; active?: boolean }) {
  const cls = `w-5 h-5 ${active ? "text-teal-600" : "text-slate-400"}`
  if (type === "compass") return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx={12} cy={12} r={10} /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
  if (type === "users") return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx={9} cy={7} r={4} /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  if (type === "layout") return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x={3} y={3} width={7} height={7} rx={1} /><rect x={14} y={3} width={7} height={7} rx={1} /><rect x={14} y={14} width={7} height={7} rx={1} /><rect x={3} y={14} width={7} height={7} rx={1} /></svg>
  if (type === "book") return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
  if (type === "message") return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
  return null
}

const navItems = [
  { icon: "compass", label: "Explore" },
  { icon: "users", label: "Members" },
  { icon: "layout", label: "Dashboard", active: true },
  { icon: "book", label: "Resources" },
  { icon: "message", label: "Messages" },
]

export default function Slide3Dashboard() {
  return (
    <div className="w-[1080px] h-[1080px] bg-[#f8fafc] flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-[64px] bg-white border-r border-slate-200 flex flex-col items-center py-5 gap-1 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center mb-4">
          <span className="text-white font-extrabold text-sm">GJ</span>
        </div>
        {navItems.map((item) => (
          <div key={item.label} className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer ${item.active ? "bg-teal-500/10" : "hover:bg-slate-100"}`}>
            <NavIcon type={item.icon} active={item.active} />
          </div>
        ))}
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900">Your Matchmaking Hub</h1>
              <span className="text-[10px] font-bold bg-teal-500/10 text-teal-700 border border-teal-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                3 Active Jams
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Welcome back, PixelKnight — Lv.12 · Pixel Knight</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">4</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">PK</div>
          </div>
        </div>

        {/* Bento grid */}
        <div className="flex-1 p-5 overflow-hidden">
          <div className="grid grid-cols-12 grid-rows-6 gap-3 h-full">

            {/* Quick Stats row — top strip */}
            {[
              { icon: <Eye className="w-4 h-4 text-teal-600" />, label: "Profile Views", value: "847", delta: "+12%", bg: "bg-teal-500/5 border-teal-500/20" },
              { icon: <Users className="w-4 h-4 text-blue-600" />, label: "Applications Rcvd", value: "34", delta: "+8", bg: "bg-blue-500/5 border-blue-500/20" },
              { icon: <Rocket className="w-4 h-4 text-violet-600" />, label: "Active Jams", value: "3", delta: "Live", bg: "bg-violet-500/5 border-violet-500/20" },
              { icon: <Star className="w-4 h-4 text-amber-600" />, label: "Total XP", value: "4,200", delta: "+350 today", bg: "bg-amber-500/5 border-amber-500/20" },
            ].map((stat, i) => (
              <div key={stat.label} className={`col-span-3 row-span-1 bg-white rounded-xl border ${stat.bg} p-3 flex items-center gap-3`}>
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 font-medium truncate">{stat.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-extrabold text-slate-900">{stat.value}</span>
                    <span className="text-[10px] text-teal-600 font-semibold">{stat.delta}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* My Teams - large */}
            <div className="col-span-7 row-span-3 bg-white rounded-xl border border-slate-200 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-extrabold text-slate-900">My Teams</h2>
                <button className="flex items-center gap-1 text-[10px] font-bold bg-teal-500 text-white px-2.5 py-1 rounded-lg">
                  <Rocket className="w-3 h-3" /> New Team
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5 flex-1">
                {[
                  {
                    name: "Pixel Storm",
                    jam: "Ludum Dare 57",
                    engine: "Godot",
                    role: "Leader",
                    status: { label: "Live Now 🔴", cls: "text-red-600 bg-red-50 border-red-400/30" },
                    members: "2/4",
                    countdown: null,
                    matches: 3,
                  },
                  {
                    name: "NeonCraft",
                    jam: "GMTK 2026",
                    engine: "Unity",
                    role: "Member",
                    status: { label: "Starts in 3 days", cls: "text-sky-700 bg-sky-50 border-sky-400/30" },
                    members: "3/4",
                    countdown: "3d 12h",
                    matches: null,
                  },
                  {
                    name: "RetroFusion",
                    jam: "Brackeys Jam",
                    engine: "GameMaker",
                    role: "Leader",
                    status: { label: "Dates to be confirmed", cls: "text-amber-700 bg-amber-50 border-amber-400/30" },
                    members: "2/3",
                    countdown: null,
                    matches: 2,
                  },
                ].map((t) => (
                  <div key={t.name} className="border border-slate-200 rounded-xl p-3 flex flex-col gap-1.5 hover:border-teal-500/30 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">{t.name}</h3>
                        <p className="text-[10px] text-teal-600 font-medium">{t.jam}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${t.role === "Leader" ? "bg-teal-500/10 text-teal-700 border-teal-500/20" : "bg-slate-100 text-slate-500 border-slate-200"}`}>{t.role}</span>
                    </div>
                    <div className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border w-fit ${t.status.cls}`}>{t.status.label}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><Cpu className="w-2.5 h-2.5" />{t.engine}</span>
                      <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" />{t.members}</span>
                    </div>
                    {t.matches && (
                      <div className="text-[9px] font-bold text-teal-600 flex items-center gap-0.5 border border-teal-500/20 rounded-lg px-2 py-1 bg-teal-500/5">
                        <Sparkles className="w-2.5 h-2.5" />{t.matches} Matches Found
                      </div>
                    )}
                    <div className="flex gap-1 mt-auto">
                      <button className="flex-1 flex items-center justify-center gap-1 border border-teal-500/30 text-teal-700 text-[9px] font-bold py-1 rounded-lg">
                        <MessageCircle className="w-2.5 h-2.5" /> Squad
                      </button>
                      {t.role === "Leader" && (
                        <button className="flex-1 flex items-center justify-center gap-1 border border-slate-200 text-slate-600 text-[9px] font-bold py-1 rounded-lg">
                          <Settings className="w-2.5 h-2.5" /> Manage
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {/* Add team placeholder */}
                <div className="border border-dashed border-slate-300 rounded-xl p-3 flex flex-col items-center justify-center gap-1 text-slate-400 cursor-pointer hover:border-teal-500/40 hover:text-teal-500 transition-colors">
                  <Rocket className="w-5 h-5" />
                  <span className="text-[10px] font-semibold">Create new team</span>
                </div>
              </div>
            </div>

            {/* Kudos / Badges */}
            <div className="col-span-5 row-span-3 bg-white rounded-xl border border-slate-200 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-extrabold text-slate-900">Kudos & Badges</h2>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              {/* Level progress */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-teal-500/10 border-2 border-teal-500/30 flex items-center justify-center shrink-0">
                  <span className="text-lg font-extrabold text-teal-700">12</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800">Pixel Knight</span>
                    <span className="text-slate-400 text-[10px]">4,200 / 5,000 XP</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: "84%" }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">800 XP to Lv.13 · Pixel Veteran</p>
                </div>
              </div>

              {/* Kudos */}
              <div className="mb-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Endorsements Received</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { emoji: "🤝", label: "Teamwork", n: 28, color: "bg-teal-500/10 text-teal-700" },
                    { emoji: "💡", label: "Creativity", n: 19, color: "bg-blue-500/10 text-blue-700" },
                    { emoji: "🔥", label: "Consistency", n: 15, color: "bg-orange-500/10 text-orange-700" },
                    { emoji: "🎯", label: "Leadership", n: 12, color: "bg-violet-500/10 text-violet-700" },
                  ].map((k) => (
                    <div key={k.label} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${k.color}`}>
                      <span className="text-sm">{k.emoji}</span>
                      <div>
                        <p className="text-[9px] font-bold text-current opacity-80">{k.label}</p>
                        <p className="text-xs font-extrabold">{k.n}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievement badges */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Achievements</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { emoji: "🏆", label: "Top Finisher", color: "bg-amber-50 border-amber-300/50 text-amber-700" },
                    { emoji: "👥", label: "Squad Builder", color: "bg-teal-50 border-teal-300/50 text-teal-700" },
                    { emoji: "⚡", label: "Fast Shipper", color: "bg-violet-50 border-violet-300/50 text-violet-700" },
                    { emoji: "🌟", label: "5-Star Team", color: "bg-sky-50 border-sky-300/50 text-sky-700" },
                    { emoji: "🔥", label: "Streak x7", color: "bg-orange-50 border-orange-300/50 text-orange-700" },
                  ].map((b) => (
                    <span key={b.label} className={`text-[9px] font-bold px-2 py-1 rounded-full border ${b.color} flex items-center gap-1`}>
                      {b.emoji} {b.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Notifications inbox */}
            <div className="col-span-7 row-span-2 bg-white rounded-xl border border-slate-200 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  Inbox / Notifications
                  <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">4 new</span>
                </h2>
              </div>
              <div className="flex flex-col gap-1.5 flex-1 overflow-hidden">
                {[
                  { text: "NeonBrush applied to join Pixel Storm as 2D Artist", time: "2m ago", unread: true, color: "bg-teal-500" },
                  { text: "Pixel Storm: GMTK 2026 starts in 3 days — jam countdown ticking!", time: "1h ago", unread: true, color: "bg-sky-500" },
                  { text: "VoxelCrafter endorsed you for Teamwork (+1 kudos)", time: "3h ago", unread: true, color: "bg-amber-500" },
                  { text: "SoundSculptor accepted your squad invite for RetroFusion", time: "5h ago", unread: false, color: "bg-violet-500" },
                  { text: "You leveled up! Lv.11 → Lv.12 · Pixel Knight title unlocked", time: "1d ago", unread: false, color: "bg-emerald-500" },
                ].map((n, i) => (
                  <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${n.unread ? "bg-teal-500/5 border border-teal-500/10" : "hover:bg-slate-50"} cursor-pointer`}>
                    {n.unread ? (
                      <div className={`w-2 h-2 rounded-full ${n.color} shrink-0`} />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-200 shrink-0" />
                    )}
                    <p className={`text-[11px] flex-1 truncate ${n.unread ? "font-semibold text-slate-800" : "text-slate-500"}`}>{n.text}</p>
                    <span className="text-[9px] text-slate-400 shrink-0">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended teams */}
            <div className="col-span-5 row-span-2 bg-white rounded-xl border border-slate-200 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-extrabold text-slate-900">Recommended Teams</h2>
                <Sparkles className="w-4 h-4 text-teal-500" />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {[
                  { name: "VoxelBrigade", jam: "Mini Jam 170", role: "💻 Developer", status: "Live 🔴", statusCls: "text-red-600" },
                  { name: "StarlightDevs", jam: "GMTK 2026", role: "💻 Developer", status: "Starts in 3d", statusCls: "text-sky-600" },
                  { name: "ChillPixels", jam: "Brackeys Jam", role: "💻 Developer", status: "Dates TBC", statusCls: "text-amber-600" },
                ].map((t) => (
                  <div key={t.name} className="flex items-center gap-2.5 px-3 py-2 border border-slate-200 rounded-xl hover:border-teal-500/30 cursor-pointer group transition-colors">
                    <div className="w-7 h-7 rounded-full bg-teal-500/15 flex items-center justify-center shrink-0">
                      <span className="text-xs">🎮</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{t.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{t.jam}</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[9px] font-semibold bg-teal-500/10 text-teal-700 px-1.5 py-0.5 rounded-full">{t.role}</span>
                      <span className={`text-[9px] font-medium ${t.statusCls}`}>{t.status}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-500 shrink-0 transition-colors" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Slide label */}
      <div className="absolute bottom-4 right-5 flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">3 / 5</span>
        <div className="flex gap-1">
          {[0,1,2,3,4].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i===2 ? "bg-teal-500" : "bg-slate-300"}`} />)}
        </div>
      </div>
    </div>
  )
}
