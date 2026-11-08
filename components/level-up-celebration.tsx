"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { subscribeLevelUp } from "@/lib/level-up-bus"

const CONFETTI = [
  { left: "8%", delay: "0ms", color: "bg-teal", duration: "900ms" },
  { left: "18%", delay: "80ms", color: "bg-peach", duration: "1100ms" },
  { left: "28%", delay: "40ms", color: "bg-pink", duration: "1000ms" },
  { left: "40%", delay: "140ms", color: "bg-lavender", duration: "1200ms" },
  { left: "52%", delay: "20ms", color: "bg-mint", duration: "980ms" },
  { left: "63%", delay: "110ms", color: "bg-teal", duration: "1150ms" },
  { left: "74%", delay: "60ms", color: "bg-peach", duration: "1050ms" },
  { left: "84%", delay: "160ms", color: "bg-pink", duration: "1250ms" },
  { left: "12%", delay: "200ms", color: "bg-lavender", duration: "1080ms" },
  { left: "46%", delay: "180ms", color: "bg-mint", duration: "1120ms" },
  { left: "70%", delay: "220ms", color: "bg-teal", duration: "990ms" },
  { left: "90%", delay: "90ms", color: "bg-peach", duration: "1180ms" },
] as const

type CelebrationState = {
  open: boolean
  level: number | null
  queue: number[]
}

export function LevelUpCelebration() {
  const [state, setState] = useState<CelebrationState>({ open: false, level: null, queue: [] })

  useEffect(() => {
    return subscribeLevelUp((nextLevel) => {
      setState((prev) => {
        if (!prev.open || prev.level == null) {
          return { open: true, level: nextLevel, queue: prev.queue.filter((level) => level !== nextLevel) }
        }
        if (prev.level === nextLevel || prev.queue.includes(nextLevel)) return prev
        return { ...prev, queue: [...prev.queue, nextLevel] }
      })
    })
  }, [])

  const dismiss = () => {
    setState((prev) => {
      const [nextLevel, ...queue] = prev.queue
      if (nextLevel == null) return { ...prev, open: false, queue: [] }
      return { open: true, level: nextLevel, queue }
    })
  }

  return (
    <Dialog open={state.open} onOpenChange={(open) => { if (!open) dismiss() }}>
      <DialogContent
        className="level-up-dialog max-w-sm overflow-hidden rounded-2xl border border-border/60 bg-card p-0 shadow-2xl shadow-teal/10"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden" aria-hidden>
          {CONFETTI.map((piece, index) => (
            <span
              key={`${piece.left}-${index}`}
              className={`level-up-confetti-piece ${piece.color}`}
              style={{
                left: piece.left,
                animationDelay: piece.delay,
                animationDuration: piece.duration,
              }}
            />
          ))}
        </div>
        <div className="relative flex flex-col items-center gap-3 px-6 pb-6 pt-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-peach/40 bg-peach/15 px-3 py-1 text-xs font-bold text-peach">
            <Sparkles className="size-3.5" aria-hidden />
            Level up
          </span>
          <DialogTitle className="text-3xl font-extrabold tracking-tight text-foreground">
            Level {state.level}
          </DialogTitle>
          <DialogDescription className="max-w-xs text-sm text-muted-foreground">
            You reached level {state.level}. Nice work — your jammer rank just went up.
          </DialogDescription>
          <Button
            type="button"
            className="mt-2 w-full rounded-xl bg-teal text-teal-foreground hover:bg-teal/90"
            onClick={dismiss}
          >
            Keep jamming
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
