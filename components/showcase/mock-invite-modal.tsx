"use client"

import { Mail, Sparkles, Target, MessageSquareText, Send } from "lucide-react"

export function MockInviteModal() {
  return (
    <div className="bg-background">
      {/* Dimmed background content */}
      <div className="px-4 py-6 opacity-20">
        <div className="mx-auto max-w-md">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-xl border border-border/50 bg-card" />
            ))}
          </div>
        </div>
      </div>

      {/* Modal overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-4" style={{ top: "40px" }}>
        <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card shadow-2xl shadow-lavender/10">
          {/* Top accent bar */}
          <div className="h-1 rounded-t-2xl bg-gradient-to-r from-lavender/60 via-pink/40 to-teal/50" />

          {/* Header */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-lavender/15">
                <Mail className="size-3.5 text-lavender" />
              </div>
              <span className="text-sm font-extrabold tracking-tight text-foreground">Invite Jammer</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">Inviting</span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-lavender/15 px-2 py-0.5 text-[9px] font-bold text-lavender">
                <Sparkles className="size-2.5" />
                BeatMaker99
              </span>
              <span className="text-[10px] text-muted-foreground">to</span>
              <span className="rounded-full bg-teal/15 px-2 py-0.5 text-[9px] font-bold text-teal">
                Neon Runners
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 pb-3">
            <div className="flex flex-col gap-3">
              {/* Role selector */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Target className="size-3 text-primary" />
                  <span className="text-[10px] font-bold text-foreground">Role offered</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Developer", emoji: "\uD83D\uDCBB", color: "bg-teal/15 text-teal", selected: false },
                    { label: "Audio", emoji: "\uD83C\uDFB5", color: "bg-lavender/15 text-lavender", selected: true },
                    { label: "Game Designer", emoji: "\uD83C\uDFAF", color: "bg-peach/15 text-peach", selected: false },
                  ].map((role) => (
                    <span
                      key={role.label}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-semibold ${role.color} ${
                        role.selected ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-105" : ""
                      }`}
                    >
                      {role.emoji} {role.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <MessageSquareText className="size-3 text-lavender" />
                  <span className="text-[10px] font-bold text-foreground">Your message</span>
                </div>
                <div className="relative rounded-lg border border-primary/30 bg-secondary/50 p-3 ring-2 ring-primary/20">
                  <p className="text-[10px] leading-relaxed text-foreground">
                    {"Hey! We're building a cyberpunk runner for GMTK and your sound design skills are exactly what we need. Love your chiptune work!"}
                  </p>
                  <span className="absolute bottom-1.5 right-2.5 text-[8px] tabular-nums text-muted-foreground/50">
                    127/500
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-border/60 px-5 py-3">
            <div className="rounded-lg px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
              Cancel
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-primary px-4 py-1.5 text-[10px] font-bold text-primary-foreground shadow-lg shadow-primary/25">
              <Send className="size-3" />
              Send Invite
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
