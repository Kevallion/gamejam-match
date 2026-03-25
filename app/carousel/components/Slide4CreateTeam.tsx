"use client"

import { Plus, Calendar, Users, Sparkles, Check } from "lucide-react"

export function Slide4CreateTeam() {
  return (
    <div className="w-[1080px] h-[1080px] bg-[#f8fafc] flex overflow-hidden font-sans relative">
      {/* Sidebar */}
      <aside className="w-[56px] bg-white border-r border-slate-200/50 flex flex-col items-center py-4 gap-1 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center mb-3">
          <span className="text-white font-bold text-xs">GJ</span>
        </div>
        <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
          <Plus className="w-4 h-4" />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Form */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200/50 bg-white">
            <h1 className="text-sm font-bold text-slate-900">Launch Your Squad</h1>
            <p className="text-xs text-slate-500 mt-0.5">Create a team listing for an upcoming jam</p>
          </div>

          {/* Form content */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
            {/* Step indicator */}
            <div className="flex gap-1">
              <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center text-xs font-bold">1</div>
              <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center text-xs font-bold">2</div>
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">3</div>
              <span className="text-xs font-semibold text-slate-600 ml-auto">Step 2 of 3</span>
            </div>

            {/* Team basics (collapsed from step 1) */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-semibold text-slate-700">
                <span className="inline-block w-5 h-5 rounded-full bg-teal-500 text-white text-[8px] flex items-center justify-center mr-1.5">✓</span>
                RetroRush • Ludum Dare 57
              </p>
            </div>

            {/* Roles needed (Step 2 focus) */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Select Required Roles</label>
              <div className="flex flex-col gap-2">
                {[
                  { role: "Developer", emoji: "💻", checked: false },
                  { role: "2D Artist", emoji: "🎨", checked: true },
                  { role: "Audio / Music", emoji: "🎵", checked: true },
                  { role: "3D Artist", emoji: "🗿", checked: false },
                  { role: "Game Designer", emoji: "🎯", checked: false },
                ].map((r) => (
                  <div key={r.role} className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${r.checked ? "border-teal-500 bg-teal-500" : "border-slate-300"}`}>
                      {r.checked && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{r.emoji} {r.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Jam date range */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Jam Dates</label>
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-900">Apr 1 — Apr 3, 2026</span>
              </div>
            </div>

            {/* Experience level */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Experience Required</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-900 outline-none">
                <option>Any level</option>
                <option defaultChecked>Junior & above</option>
                <option>Regular & above</option>
              </select>
            </div>

            {/* Engine */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Engine</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-900 outline-none">
                <option>Godot</option>
                <option>Unity</option>
                <option defaultChecked>Unreal Engine</option>
              </select>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-5 py-4 border-t border-slate-200/50 bg-white flex gap-2">
            <button className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-900 font-semibold text-xs hover:bg-slate-50">
              Back
            </button>
            <button className="flex-1 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-semibold text-xs">
              Continue
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="w-[300px] bg-white border-l border-slate-200/50 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Team Preview</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {/* Team card preview */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-3">
              <h4 className="text-xs font-bold text-slate-900 mb-1">RetroRush</h4>
              <p className="text-[9px] text-slate-600 mb-2">Ludum Dare 57 • Godot</p>

              {/* Roles preview */}
              <div className="flex flex-wrap gap-1 mb-3">
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700">🎨 2D Artist</span>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700">🎵 Audio</span>
              </div>

              <div className="flex items-center gap-1 text-[9px] text-slate-600 border-t border-slate-200 pt-2">
                <Users className="w-3 h-3" />
                <span>3/5 members</span>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-slate-700">
                  <span className="font-semibold">Team name</span> set
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-slate-700">
                  <span className="font-semibold">Roles</span> selected
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-slate-700">
                  <span className="font-semibold">Jam dates</span> configured
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded border-2 border-slate-300 flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-slate-500">
                  <span className="font-semibold">Description & perks</span> (Step 3)
                </span>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-auto pt-4 border-t border-slate-100">
              <p className="text-[9px] font-semibold text-slate-700 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-500" />
                Pro Tips
              </p>
              <ul className="text-[9px] text-slate-600 space-y-1">
                <li>• Be clear about role needs</li>
                <li>• Set realistic dates</li>
                <li>• Add a welcoming description</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Slide indicator */}
      <div className="absolute bottom-4 right-5 flex items-center gap-2">
        <span className="text-[9px] font-bold text-slate-400 uppercase">4/5</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 3 ? "bg-teal-500" : "bg-slate-300"}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

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
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-extrabold text-slate-900">Launch Your Squad</h1>
            <p className="text-xs text-slate-500 mt-0.5">Set up your team listing and attract the perfect jammers</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              {[1, 2, 3].map(s => (
                <div key={s} className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${s === 2 ? "bg-teal-500 text-white border-teal-500" : s < 2 ? "bg-teal-500/10 text-teal-700 border-teal-500/20" : "bg-white text-slate-400 border-slate-200"}`}>
                  {s < 2 && <CheckCircle2 className="w-3 h-3" />}
                  Step {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100">
          <div className="h-full bg-teal-500 rounded-full" style={{ width: "66.6%" }} />
        </div>

        {/* Form layout */}
        <div className="flex-1 p-5 flex gap-5 overflow-hidden">
          {/* Left column — form */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4 flex-1 overflow-y-auto">
              {/* Step 2 header */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-slate-900">Step 2 — Team Setup</h2>
                <span className="text-[10px] text-slate-400 font-medium">All fields required</span>
              </div>

              {/* Engine + Language row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Engine</label>
                  <div className="relative">
                    <div className="h-10 px-3 flex items-center justify-between border border-slate-200 rounded-xl bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-teal-500/15 flex items-center justify-center text-[10px]">G</span>
                        Godot
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <p className="text-[10px] text-teal-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Pre-filled from your profile</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Spoken Language</label>
                  <div className="h-10 px-3 flex items-center justify-between border border-slate-200 rounded-xl bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer">
                    <span>English</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Jam Style */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Jam Style / Vibe</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Chill", emoji: "☕", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-300/50" },
                    { label: "Learning", emoji: "📖", color: "text-blue-700", bg: "bg-blue-50 border-blue-300/50" },
                    { label: "Dedicated", emoji: "🔥", color: "text-orange-700", bg: "bg-orange-50 border-orange-300/50", active: true },
                    { label: "Competitive", emoji: "🏆", color: "text-red-700", bg: "bg-slate-50 border-slate-200" },
                  ].map((v) => (
                    <div key={v.label} className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border cursor-pointer ${v.active ? v.bg + " ring-2 ring-orange-400/50" : v.bg + " opacity-60 hover:opacity-100"}`}>
                      <span className="text-lg">{v.emoji}</span>
                      <span className={`text-[10px] font-bold ${v.color}`}>{v.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roles looking for */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Roles You Need</label>
                  <button className="flex items-center gap-1 text-[10px] font-bold text-teal-600 hover:text-teal-700">
                    <Plus className="w-3.5 h-3.5" /> Add Role
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { role: "2D Artist", level: "Advanced / Versatile", roleColor: "bg-pink-500/15 text-pink-700", levelColor: "bg-violet-500/10 text-violet-700", valid: true },
                    { role: "Audio / Music", level: "Any level", roleColor: "bg-violet-500/15 text-violet-700", levelColor: "bg-slate-100 text-slate-500", valid: true },
                    { role: "Select role…", level: "Select level…", roleColor: "bg-slate-100 text-slate-400", levelColor: "bg-slate-100 text-slate-400", valid: false },
                  ].map((r, i) => (
                    <div key={i} className={`flex items-center gap-2 p-2.5 border rounded-xl ${!r.valid ? "border-dashed border-slate-300 bg-slate-50/50" : "border-slate-200 bg-white"}`}>
                      <div className={`text-[10px] font-semibold px-2 py-1 rounded-full ${r.roleColor}`}>{r.role}</div>
                      <span className="text-slate-300 text-xs">·</span>
                      <div className={`text-[10px] font-semibold px-2 py-1 rounded-full ${r.levelColor}`}>{r.level}</div>
                      {r.valid ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 ml-auto" />
                      ) : (
                        <div className="ml-auto flex items-center gap-1 text-[10px] text-amber-600">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Required</span>
                        </div>
                      )}
                      <button className="text-slate-300 hover:text-slate-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Tech Stack</label>
                <div className="flex flex-wrap gap-1.5 p-3 border border-slate-200 rounded-xl bg-slate-50 min-h-[40px]">
                  {["GDScript", "Blender", "Aseprite"].map(t => (
                    <span key={t} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 border border-teal-500/20">
                      {t} <X className="w-2.5 h-2.5 cursor-pointer" />
                    </span>
                  ))}
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer">
                    <Plus className="w-3 h-3" /> Add tool
                  </span>
                </div>
              </div>

              {/* Project Scope */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Project Scope</label>
                <div className="h-10 px-3 flex items-center justify-between border border-slate-200 rounded-xl bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer">
                  <span>Polished prototype — Jam winner aim</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Discord link */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Discord Invite Link <span className="text-slate-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <input
                    readOnly
                    value="https://discord.gg/pixelstorm2026"
                    className="w-full h-10 px-3 pr-9 border border-teal-500/40 rounded-xl bg-white text-xs text-slate-700 outline-none"
                  />
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Right column — calendar + logo uploader + smart match preview */}
          <div className="w-[320px] flex flex-col gap-4 shrink-0">
            {/* Team Logo uploader */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-xs font-extrabold text-slate-900 mb-3">Team Logo</h3>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-teal-500/40 bg-teal-500/5 flex flex-col items-center justify-center cursor-pointer hover:bg-teal-500/10 transition-colors">
                  <Upload className="w-5 h-5 text-teal-500 mb-1" />
                  <span className="text-[9px] text-teal-600 font-bold">Upload</span>
                </div>
                <div className="text-[10px] text-slate-500 leading-relaxed">
                  <p className="font-semibold text-slate-700 mb-1">Add a team logo</p>
                  PNG, JPG or WebP<br />
                  Max 2MB · 256×256px<br />
                  <span className="text-teal-600 font-semibold">Increases visibility by 40%</span>
                </div>
              </div>
            </div>

            {/* Date Range Picker */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <CalendarRange className="w-3.5 h-3.5 text-teal-500" />
                  Jam Date Range
                </h3>
                <span className="text-[10px] font-semibold text-teal-600 border border-teal-500/20 bg-teal-500/5 px-2 py-0.5 rounded-full">Apr 1 – Apr 3</span>
              </div>

              {/* Calendar grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">April 2026</span>
                  <div className="flex gap-1">
                    <button className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-0.5 text-center">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                    <div key={d} className="text-[9px] font-bold text-slate-400 py-1">{d}</div>
                  ))}
                  {calDays.map((day, i) => {
                    const isStart = !day.prev && !day.next && day.d === jamStart
                    const isEnd = !day.prev && !day.next && day.d === jamEnd
                    const inRange = !day.prev && !day.next && day.d >= jamStart && day.d <= jamEnd
                    return (
                      <div
                        key={i}
                        className={`text-[10px] py-1 rounded cursor-pointer font-medium transition-colors
                          ${day.prev || day.next ? "text-slate-300" : ""}
                          ${inRange && !isStart && !isEnd ? "bg-teal-500/10 text-teal-700" : ""}
                          ${isStart || isEnd ? "bg-teal-500 text-white font-bold rounded-full" : ""}
                          ${!inRange && !day.prev && !day.next ? "hover:bg-slate-100 text-slate-700" : ""}
                        `}
                      >
                        {day.d}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-2 text-[10px]">
                <div className="flex-1 border border-teal-500/30 rounded-lg px-2.5 py-1.5 bg-teal-500/5">
                  <p className="text-slate-400 font-medium">Start</p>
                  <p className="font-bold text-teal-700">April 1, 2026</p>
                </div>
                <div className="flex-1 border border-teal-500/30 rounded-lg px-2.5 py-1.5 bg-teal-500/5">
                  <p className="text-slate-400 font-medium">End</p>
                  <p className="font-bold text-teal-700">April 3, 2026</p>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border border-amber-400/30 bg-amber-50 rounded-lg px-2.5 py-2 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Listing stays public until the jam end date. You can extend from the dashboard.</span>
              </div>
            </div>

            {/* Linked jam selector */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-xs font-extrabold text-slate-900 mb-2">Link Itch.io Jam</h3>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input readOnly value="Ludum Dare 57" className="w-full h-8 pl-8 pr-3 border border-teal-500/40 rounded-lg text-xs text-slate-700 bg-teal-500/5 outline-none" />
              </div>
              <div className="flex items-center gap-2 border border-teal-500/30 rounded-xl px-3 py-2 bg-teal-500/5">
                <span className="text-sm">🎮</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-teal-700 truncate">Ludum Dare 57</p>
                  <p className="text-[9px] text-slate-400">itch.io · Apr 1–3, 2026</p>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            {/* Smart match preview */}
            <div className="bg-white rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/5 to-white p-4">
              <h3 className="text-xs font-extrabold text-teal-700 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Smart Match Preview
              </h3>
              <p className="text-[10px] text-slate-500 mb-2">Jammers who match your open roles will be notified:</p>
              <div className="flex items-center gap-2">
                {["NB", "SS", "UW"].map((a, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white ${["bg-pink-500", "bg-violet-500", "bg-emerald-500"][i]}`}>{a}</div>
                ))}
                <span className="text-[10px] text-slate-400 font-medium">+24 more jammers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <button className="text-xs font-bold text-slate-500 hover:text-slate-700">← Back to Step 1</button>
          <button className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors">
            Continue to Step 3 →
          </button>
        </div>
      </main>

      {/* Slide label */}
      <div className="absolute bottom-4 right-5 flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">4 / 5</span>
        <div className="flex gap-1">
          {[0,1,2,3,4].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i===3 ? "bg-teal-500" : "bg-slate-300"}`} />)}
        </div>
      </div>
    </div>
  )
}
