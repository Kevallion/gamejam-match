"use client"

import {
  Send,
  Paperclip,
  Hash,
  Users,
  Circle,
  CheckCircle2,
  Plus,
  MoreHorizontal,
  Image,
  File,
  Smile,
  ArrowRight,
  Rocket,
  Star,
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
  { icon: "layout", label: "Dashboard" },
  { icon: "book", label: "Resources" },
  { icon: "message", label: "Messages", active: true },
]

const messages = [
  {
    user: "PixelKnight", avatar: "PK", avatarColor: "bg-teal-500", mine: false,
    text: "Hey squad! Welcome to Pixel Storm's space. This is where we coordinate for Ludum Dare 57. Happy Jamming! 🎮",
    time: "9:00 AM", special: true,
  },
  {
    user: "NeonBrush", avatar: "NB", avatarColor: "bg-pink-500", mine: false,
    text: "Looking forward to this! I've already started sketching character concepts. Will drop them in #assets.",
    time: "9:12 AM",
  },
  {
    user: "SoundSculptor", avatar: "SS", avatarColor: "bg-violet-500", mine: false,
    text: "Audio loops ready for review — chiptune main theme draft uploaded 🎵",
    time: "9:45 AM",
    file: { name: "main_theme_v1.mp3", size: "2.1 MB", icon: "🎵" },
  },
  {
    user: "You", avatar: "PK", avatarColor: "bg-teal-500", mine: true,
    text: "Great work everyone! I've pushed the first prototype build. Core gameplay loop is in — platformer with procedural levels.",
    time: "10:03 AM",
  },
  {
    user: "NeonBrush", avatar: "NB", avatarColor: "bg-pink-500", mine: false,
    text: "Love the feel! Movement is super crisp. Added the player spritesheet to the repo.",
    time: "10:15 AM",
    file: { name: "player_sprites_v2.png", size: "512 KB", icon: "🎨" },
  },
]

const taskCols = [
  {
    label: "Backlog", color: "text-slate-500", border: "border-slate-200",
    tasks: [
      { label: "Game over screen", tags: ["Developer"] },
      { label: "Title screen art", tags: ["2D Artist"] },
    ],
  },
  {
    label: "In Progress", color: "text-amber-600", border: "border-amber-300/50",
    tasks: [
      { label: "Level generator logic", tags: ["Developer"], assignee: "PK", bg: "bg-teal-500" },
      { label: "SFX sound design", tags: ["Audio"], assignee: "SS", bg: "bg-violet-500" },
    ],
  },
  {
    label: "Done", color: "text-teal-600", border: "border-teal-300/50",
    tasks: [
      { label: "Player controller", tags: ["Developer"], done: true },
      { label: "Main theme music", tags: ["Audio"], done: true },
      { label: "Color palette chosen", tags: ["2D Artist"], done: true },
    ],
  },
]

const squadMembers = [
  { name: "PixelKnight", role: "Developer", title: "Pixel Knight", avatar: "PK", color: "bg-teal-500", online: true, leader: true },
  { name: "NeonBrush", role: "2D Artist", title: "Pixel Artist", avatar: "NB", color: "bg-pink-500", online: true },
  { name: "SoundSculptor", role: "Audio", title: "Audio Wizard", avatar: "SS", color: "bg-violet-500", online: false },
]

export default function Slide5SquadSpace() {
  return (
    <div className="w-[1080px] h-[1080px] bg-[#f8fafc] flex overflow-hidden font-sans">
      {/* Main sidebar */}
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

      {/* Channels sidebar */}
      <aside className="w-[200px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-teal-500/15 flex items-center justify-center">
              <span className="text-sm">🎮</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 truncate">Pixel Storm</p>
              <p className="text-[9px] text-teal-600 font-semibold">Ludum Dare 57 · Live 🔴</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 py-3 flex flex-col gap-3 overflow-hidden">
          {/* Channels */}
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5">Channels</p>
            {[
              { name: "general", active: true, unread: 0 },
              { name: "assets", active: false, unread: 2 },
              { name: "builds", active: false, unread: 0 },
              { name: "ld57-rules", active: false, unread: 0 },
            ].map((ch) => (
              <div key={ch.name} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer ${ch.active ? "bg-teal-500/10 text-teal-700" : "text-slate-600 hover:bg-slate-50"}`}>
                <Hash className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-medium flex-1 truncate">{ch.name}</span>
                {ch.unread > 0 && (
                  <span className="w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">{ch.unread}</span>
                )}
              </div>
            ))}
          </div>

          {/* Task board link */}
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5">Boards</p>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-600 cursor-pointer hover:bg-slate-50">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x={3} y={3} width={7} height={7} rx={1} /><rect x={14} y={3} width={7} height={7} rx={1} /><rect x={14} y={14} width={7} height={7} rx={1} /><rect x={3} y={14} width={7} height={7} rx={1} /></svg>
              <span className="text-xs font-medium">Task Board</span>
            </div>
          </div>

          {/* File sharing */}
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5">Shared Files</p>
            {[
              { name: "player_sprites_v2.png", size: "512 KB", icon: "🎨" },
              { name: "main_theme_v1.mp3", size: "2.1 MB", icon: "🎵" },
              { name: "prototype_v1.zip", size: "4.8 MB", icon: "📦" },
            ].map((f) => (
              <div key={f.name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 group">
                <span className="text-base shrink-0">{f.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-slate-700 truncate">{f.name}</p>
                  <p className="text-[9px] text-slate-400">{f.size}</p>
                </div>
              </div>
            ))}
            <button className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold text-teal-600 hover:text-teal-700 w-full">
              <Plus className="w-3 h-3" /> Upload File
            </button>
          </div>
        </div>
      </aside>

      {/* Chat main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat header */}
        <div className="px-5 py-3 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900">general</h2>
            <span className="text-[10px] text-slate-400">· Pixel Storm</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="flex -space-x-1.5">
              {squadMembers.map(m => (
                <div key={m.name} className={`w-6 h-6 rounded-full ${m.color} border-2 border-white flex items-center justify-center text-[9px] font-bold text-white`}>{m.avatar}</div>
              ))}
            </div>
            <span className="text-[10px] text-slate-500">3 members</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden px-5 py-3 flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.mine ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full ${msg.avatarColor} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                {msg.avatar}
              </div>
              <div className={`max-w-[75%] flex flex-col gap-1 ${msg.mine ? "items-end" : ""}`}>
                <div className={`flex items-center gap-2 ${msg.mine ? "flex-row-reverse" : ""}`}>
                  <span className="text-xs font-bold text-slate-900">{msg.user}</span>
                  <span className="text-[9px] text-slate-400">{msg.time}</span>
                </div>
                {msg.special ? (
                  <div className="bg-gradient-to-r from-teal-500/10 to-transparent border border-teal-500/20 rounded-xl px-4 py-3">
                    <p className="text-xs text-slate-700 leading-relaxed">{msg.text}</p>
                    <p className="text-[10px] font-bold text-teal-600 mt-2 flex items-center gap-1">
                      <Star className="w-3 h-3" /> Happy Jamming! — PixelKnight, Team Lead
                    </p>
                  </div>
                ) : (
                  <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${msg.mine ? "bg-teal-500 text-white" : "bg-white border border-slate-200 text-slate-700"}`}>
                    {msg.text}
                    {msg.file && (
                      <div className={`mt-2 flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${msg.mine ? "border-white/30 bg-white/10" : "border-slate-200 bg-slate-50"}`}>
                        <span className="text-sm">{msg.file.icon}</span>
                        <div>
                          <p className={`text-[10px] font-semibold ${msg.mine ? "text-white" : "text-slate-700"}`}>{msg.file.name}</p>
                          <p className={`text-[9px] ${msg.mine ? "text-white/70" : "text-slate-400"}`}>{msg.file.size}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
            <button className="text-slate-400 hover:text-slate-600"><Paperclip className="w-4 h-4" /></button>
            <button className="text-slate-400 hover:text-slate-600"><Image className="w-4 h-4" /></button>
            <input readOnly placeholder="Message #general…" className="flex-1 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400" />
            <button className="text-slate-400 hover:text-slate-600"><Smile className="w-4 h-4" /></button>
            <button className="w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center text-white hover:bg-teal-600">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right panel — Task board + Members */}
      <aside className="w-[260px] bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden">
        {/* Task board (mini Kanban) */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-900">Task Board</h3>
            <button className="w-6 h-6 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-600 hover:bg-teal-500/20">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="grid grid-cols-3 gap-2 h-full">
              {taskCols.map((col) => (
                <div key={col.label} className="flex flex-col gap-1.5 min-h-0">
                  <div className={`text-[9px] font-bold uppercase tracking-wider ${col.color} flex items-center gap-1 mb-0.5`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${col.label === "Done" ? "bg-teal-500" : col.label === "In Progress" ? "bg-amber-400" : "bg-slate-300"}`} />
                    {col.label}
                  </div>
                  {col.tasks.map((task, ti) => (
                    <div key={ti} className={`p-2 rounded-lg border text-[9px] ${task.done ? "bg-teal-50 border-teal-200/60" : "bg-white border-slate-200"} cursor-pointer hover:shadow-sm`}>
                      <div className="flex items-start gap-1 mb-1">
                        {task.done ? (
                          <CheckCircle2 className="w-3 h-3 text-teal-500 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-3 h-3 text-slate-300 shrink-0 mt-0.5" />
                        )}
                        <p className={`leading-tight font-medium ${task.done ? "text-teal-700 line-through opacity-70" : "text-slate-700"}`}>{task.label}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        {task.tags.map(t => (
                          <span key={t} className="text-[8px] font-semibold text-slate-400 bg-slate-100 px-1 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                        {(task as any).assignee && (
                          <div className={`w-4 h-4 rounded-full ${(task as any).bg} flex items-center justify-center text-white text-[8px] font-bold`}>
                            {(task as any).assignee}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <button className="text-[9px] text-slate-400 hover:text-teal-600 flex items-center gap-0.5 py-1">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Squad members */}
        <div className="border-t border-slate-100 px-4 py-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Users className="w-3 h-3" /> Squad Members
          </p>
          <div className="flex flex-col gap-2">
            {squadMembers.map((m) => (
              <div key={m.name} className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 px-1.5 py-1 rounded-lg">
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full ${m.color} flex items-center justify-center text-white text-[10px] font-bold`}>{m.avatar}</div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${m.online ? "bg-green-400" : "bg-slate-300"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-800 truncate">{m.name}</p>
                    {m.leader && <span className="text-[8px] font-bold bg-teal-500/10 text-teal-700 px-1 py-0.5 rounded-full border border-teal-500/20">Lead</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{m.role} · {m.title}</p>
                </div>
                <div className={`w-2 h-2 rounded-full shrink-0 ${m.online ? "bg-green-400" : "bg-slate-300"}`} />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Slide label */}
      <div className="absolute bottom-4 right-5 flex items-center gap-2 z-10">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">5 / 5</span>
        <div className="flex gap-1">
          {[0,1,2,3,4].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i===4 ? "bg-teal-500" : "bg-slate-300"}`} />)}
        </div>
      </div>
    </div>
  )
}
