"use client"

import { MessageCircle, FileText, CheckSquare, Users, AlertCircle } from "lucide-react"

export function Slide5SquadSpace() {
  return (
    <div className="w-[1080px] h-[1080px] bg-[#f8fafc] flex overflow-hidden font-sans relative">
      {/* Sidebar */}
      <aside className="w-[56px] bg-white border-r border-slate-200/50 flex flex-col items-center py-4 gap-1 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center mb-3">
          <span className="text-white font-bold text-xs">GJ</span>
        </div>
        <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
          <MessageCircle className="w-4 h-4" />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Channels sidebar */}
        <aside className="w-[160px] bg-white border-r border-slate-200/50 flex flex-col overflow-hidden">
          <div className="px-3 py-3 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-700">RetroRush</p>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1">
            {[
              { name: "#general", emoji: "💬", active: true },
              { name: "#assets", emoji: "🎨" },
              { name: "#builds", emoji: "🔨" },
              { name: "#ld57-rules", emoji: "📋" },
            ].map((ch) => (
              <button
                key={ch.name}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                  ch.active ? "bg-teal-500/10 text-teal-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{ch.emoji}</span>
                <span className="truncate">{ch.name}</span>
              </button>
            ))}
          </div>
          <div className="px-3 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Uploads</p>
            <div className="flex flex-col gap-1">
              {["Assets.zip", "Build_v2.exe", "Music_loops.zip"].map((f) => (
                <div key={f} className="flex items-center gap-2 p-1.5 bg-white rounded border border-slate-200 hover:border-teal-300">
                  <FileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="text-[9px] text-slate-600 truncate">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200/50 bg-white flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-900">#general</h2>
              <p className="text-[9px] text-slate-500">Squad coordination & quick questions</p>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-[9px] font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {/* Welcome message */}
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-red-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                GA
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-slate-900">GameArchitect</span>
                  <span className="text-[9px] text-slate-500">today 11:42 AM</span>
                </div>
                <p className="text-[10px] text-slate-700 leading-tight">
                  🎮 Welcome to the squad! This is our command center for LD57. Let&apos;s ship something amazing together. No crunch, just good vibes!
                </p>
              </div>
            </div>

            {/* Assets message with attachments */}
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                NB
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-slate-900">NeonBrush</span>
                  <span className="text-[9px] text-slate-500">today 2:15 PM</span>
                </div>
                <p className="text-[10px] text-slate-700 mb-2">
                  Uploaded the sprite sheets and tileset. Check the Assets channel!
                </p>
                <div className="flex gap-1 flex-wrap">
                  {["sprites.png", "tileset_16x16.aseprite"].map((f) => (
                    <div key={f} className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded border border-slate-200 text-[9px] text-slate-700">
                      <FileText className="w-3 h-3" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status update */}
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                PK
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-slate-900">PixelKnight</span>
                  <span className="text-[9px] text-slate-500">today 5:30 PM</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-teal-50 rounded-lg border border-teal-200 text-[10px] text-teal-700 font-semibold">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  Core loop merged. Playtesting at 7 PM tonight!
                </div>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-slate-200/50 bg-white flex gap-2">
            <input readOnly placeholder="Send message..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400" />
            <button className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-semibold text-xs">
              Send
            </button>
          </div>
        </div>

        {/* Right sidebar - Kanban */}
        <aside className="w-[220px] bg-white border-l border-slate-200/50 flex flex-col overflow-hidden">
          <div className="px-3 py-3 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-700">Task Board</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {/* Kanban columns preview */}
            {[
              { title: "📋 Backlog", tasks: ["Cutscenes", "Main menu UI"] },
              { title: "🔨 In Progress", tasks: ["Level 2", "Boss mechanics"] },
              { title: "✅ Done", tasks: ["Core loop", "Asset pipeline"] },
            ].map((col) => (
              <div key={col.title} className="flex flex-col gap-1.5">
                <p className="text-[10px] font-bold text-slate-700">{col.title}</p>
                {col.tasks.map((task) => (
                  <div key={task} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[9px] text-slate-700 font-semibold">
                    {task}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Squad members */}
          <div className="px-3 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Squad (3)
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                { name: "PixelKnight", status: "🟢 Online" },
                { name: "NeonBrush", status: "🟢 Online" },
                { name: "SoundSculptor", status: "🟡 Away" },
              ].map((m) => (
                <div key={m.name} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                  <span className="text-[9px] font-semibold text-slate-900 truncate">{m.name}</span>
                  <span className="text-[8px] text-slate-500 whitespace-nowrap">{m.status}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Slide indicator */}
      <div className="absolute bottom-4 right-5 flex items-center gap-2">
        <span className="text-[9px] font-bold text-slate-400 uppercase">5/5</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 4 ? "bg-teal-500" : "bg-slate-300"}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

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
