"use client"

import { LayoutGrid, Sparkles, TrendingUp, Users, Award, MessageSquare, Clock, Plus } from "lucide-react"

export function Slide3Dashboard() {
  return (
    <div className="w-[1080px] h-[1080px] bg-[#f8fafc] flex overflow-hidden font-sans relative">
      {/* Sidebar */}
      <aside className="w-[56px] bg-white border-r border-slate-200/50 flex flex-col items-center py-4 gap-1 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center mb-3">
          <span className="text-white font-bold text-xs">GJ</span>
        </div>
        <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
          <LayoutGrid className="w-4 h-4" />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200/50 bg-white">
          <h1 className="text-sm font-bold text-slate-900">Your Matchmaking Hub</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage teams, track applications & build your player profile</p>
        </div>

        {/* Bento Grid */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="grid grid-cols-4 gap-3 h-full" style={{ gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(3, 1fr)" }}>
            {/* Profile Views */}
            <div className="bg-white rounded-xl border border-slate-200/50 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Profile Views</span>
                <TrendingUp className="w-4 h-4 text-teal-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">1,247</div>
              <p className="text-[10px] text-slate-500 mt-1">+12% this week</p>
            </div>

            {/* Applications */}
            <div className="bg-white rounded-xl border border-slate-200/50 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Applications</span>
                <MessageSquare className="w-4 h-4 text-pink-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">34</div>
              <p className="text-[10px] text-slate-500 mt-1">7 pending</p>
            </div>

            {/* XP Earned */}
            <div className="bg-white rounded-xl border border-slate-200/50 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">XP Earned</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">2,450</div>
              <p className="text-[10px] text-slate-500 mt-1">→ Level 12</p>
            </div>

            {/* Active Jams */}
            <div className="bg-white rounded-xl border border-slate-200/50 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Active Jams</span>
                <Sparkles className="w-4 h-4 text-violet-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">3</div>
              <p className="text-[10px] text-slate-500 mt-1">2 live now</p>
            </div>

            {/* My Teams Section - spans 2x2 */}
            <div className="col-span-2 row-span-2 bg-white rounded-xl border border-slate-200/50 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900">My Teams</h3>
                <button className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center hover:bg-teal-500/20">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {[
                  { name: "RetroRush", jam: "LD57", members: "3/5", status: "🔴 Live" },
                  { name: "CreativeFlow", jam: "IndieSpirits", members: "2/8", status: "3 days" },
                  { name: "PixelDreams", jam: "GGJ26", members: "4/6", status: "Live" },
                ].map((t) => (
                  <div key={t.name} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-slate-900 truncate">{t.name}</p>
                      <p className="text-[9px] text-slate-500">{t.jam}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-semibold text-slate-600">{t.members}</span>
                      <span className="text-[9px] font-semibold text-slate-500">{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kudos & Badges */}
            <div className="col-span-2 row-span-2 bg-white rounded-xl border border-slate-200/50 p-4 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-900">Your Kudos & Badges</h3>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-600">Technical 💻</span>
                  <span className="text-[10px] font-bold text-slate-900">8</span>
                </div>
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-teal-500 rounded-full" />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] font-semibold text-slate-600">Creative ✨</span>
                  <span className="text-[10px] font-bold text-slate-900">12</span>
                </div>
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-pink-500 rounded-full" />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] font-semibold text-slate-600">Leadership 🤝</span>
                  <span className="text-[10px] font-bold text-slate-900">3</span>
                </div>
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-amber-500 rounded-full" />
                </div>
              </div>

              {/* Achievement Pills */}
              <div className="flex flex-wrap gap-1 mt-auto">
                <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700">👑 Veteran</span>
                <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-violet-100 text-violet-700">⚡ Advanced</span>
                <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-teal-100 text-teal-700">✨ Code Wizard</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Slide indicator */}
      <div className="absolute bottom-4 right-5 flex items-center gap-2">
        <span className="text-[9px] font-bold text-slate-400 uppercase">3/5</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 2 ? "bg-teal-500" : "bg-slate-300"}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

