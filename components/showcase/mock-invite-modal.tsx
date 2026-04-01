"use client"

import { Mail, Sparkles, Target, MessageSquareText, Send, Star, Trophy, Check, Zap } from "lucide-react"

export function MockInviteModal() {
  return (
    <div className="bg-background">
      {/* Dimmed background content */}
      <div className="px-4 py-6 opacity-15 blur-[2px]">
        <div className="mx-auto max-w-md">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-xl border border-border/50 bg-card" />
            ))}
          </div>
        </div>
      </div>

      {/* Modal overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-4" style={{ top: "30px" }}>
        <div className="w-full max-w-sm rounded-2xl border-2 border-lavender/40 bg-card shadow-2xl shadow-lavender/20">
          {/* Top accent bar */}
          <div className="h-1.5 rounded-t-2xl bg-gradient-to-r from-lavender via-pink to-teal" />

          {/* Header */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-lavender/15">
                  <Mail className="size-4 text-lavender" />
                </div>
                <span className="text-sm font-extrabold tracking-tight text-foreground">Invite Jammer</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[8px] font-bold text-success">
                <Zap className="size-2.5" />
                +25 XP
              </span>
            </div>

            {/* Target user card */}
            <div className="rounded-xl border border-border/50 bg-secondary/30 p-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-lavender/40 to-pink/30 text-[11px] font-bold text-foreground ring-2 ring-lavender/20">
                    BM
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-success" />
                  <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[7px] font-black text-white border border-card">
                    12
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[11px] text-foreground">BeatMaker99</span>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[7px] font-bold text-amber-500">
                      <Trophy className="size-2" />
                      Veteran
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="rounded-full bg-lavender/15 px-1.5 py-0.5 text-[8px] font-semibold text-lavender">
                      🎵 Audio
                    </span>
                    <span className="text-[8px] text-muted-foreground">8 jams completed</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-muted-foreground">
              <span>Inviting to</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-teal/15 px-2 py-0.5 font-bold text-teal">
                <Sparkles className="size-2.5" />
                Neon Runners
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 pb-3">
            <div className="flex flex-col gap-4">
              {/* Role selector */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <Target className="size-3.5 text-primary" />
                  <span className="text-[10px] font-bold text-foreground">Role offered</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Developer", emoji: "💻", color: "bg-teal/15 text-teal border-teal/30", selected: false },
                    { label: "Audio", emoji: "🎵", color: "bg-lavender/15 text-lavender border-lavender/30", selected: true },
                    { label: "Game Designer", emoji: "🎯", color: "bg-peach/15 text-peach border-peach/30", selected: false },
                  ].map((role) => (
                    <span
                      key={role.label}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[9px] font-semibold transition-all ${role.color} ${
                        role.selected 
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-105 shadow-lg border-primary bg-primary/10" 
                          : "hover:scale-102"
                      }`}
                    >
                      {role.selected && <Check className="size-3" />}
                      {role.emoji} {role.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MessageSquareText className="size-3.5 text-lavender" />
                    <span className="text-[10px] font-bold text-foreground">Your message</span>
                  </div>
                  <span className="text-[8px] text-success font-medium">Great message! ✨</span>
                </div>
                <div className="relative overflow-hidden rounded-xl border-2 border-primary/40 bg-secondary/30 p-3 ring-4 ring-primary/10">
                  {/* Typing indicator bar */}
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary via-lavender to-teal" />
                  
                  <p className="text-[10px] leading-relaxed text-foreground pl-2">
                    {"Hey! We're building a cyberpunk runner for GMTK and your sound design skills are exactly what we need. Love your chiptune work!"}
                    <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-primary rounded-full" />
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30 pl-2">
                    <span className="text-[8px] text-muted-foreground">Tip: Mention specific work you admire</span>
                    <span className="text-[8px] tabular-nums text-primary font-medium">
                      127/500
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border/60 px-5 py-4">
            <div className="rounded-lg px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
              Cancel
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-[11px] font-bold text-primary-foreground shadow-xl shadow-primary/30 ring-2 ring-primary/30 transition-all hover:scale-105 cursor-pointer">
              <Send className="size-3.5" />
              Send Invite
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
