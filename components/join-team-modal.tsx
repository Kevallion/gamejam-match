"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Send,
  Rocket,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquareText,
} from "lucide-react"

interface JoinTeamModalProps {
  teamId: string | number
  teamName: string
  children: React.ReactNode
}

export function JoinTeamModal({ teamId, teamName, children }: JoinTeamModalProps) {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{
    type: "error" | "success"
    text: string
  } | null>(null)

  const charCount = message.length
  const maxChars = 500

  const handleSendRequest = async () => {
    if (!message.trim()) {
      setStatusMsg({
        type: "error",
        text: "Please write a small motivation message.",
      })
      return
    }

    setLoading(true)
    setStatusMsg(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setStatusMsg({
          type: "error",
          text: "You must be logged in to apply.",
        })
        setLoading(false)
        return
      }

      // Envoi réel à Supabase
      const { error } = await supabase.from("join_requests").insert({
        team_id: teamId,
        sender_id: session.user.id,
        sender_name: session.user.user_metadata?.username || "A Jammer",
        message: message.trim(),
        status: "pending",
      })

      if (error) throw error

      setStatusMsg({
        type: "success",
        text: "Application sent successfully!",
      })
      
      // Fermeture automatique après 2 secondes
      setTimeout(() => {
        setOpen(false)
        setMessage("")
        setStatusMsg(null)
      }, 2000)

    } catch (error: any) {
      setStatusMsg({
        type: "error",
        text: "An error occurred. Try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl border-border/60 bg-card p-0 shadow-2xl shadow-teal/10">
        
        {/* Header with subtle glow bar */}
        <div className="relative overflow-hidden rounded-t-2xl px-6 pt-6 pb-4">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal/60 via-lavender/40 to-pink/50" />

          <DialogHeader className="space-y-2.5 text-left">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-teal/15">
                <Rocket className="size-4.5 text-teal" />
              </div>
              <DialogTitle className="text-lg font-extrabold tracking-tight text-foreground">
                Join Team
              </DialogTitle>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Applying to
              </span>
              <Badge className="rounded-full border-0 bg-teal/15 px-2.5 py-0.5 text-xs font-bold text-teal">
                <Sparkles className="mr-1 size-3" />
                {teamName}
              </Badge>
            </div>

            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              Introduce yourself and share what you can bring to this team for the jam.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 pb-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <MessageSquareText className="size-4 text-lavender" />
              <label htmlFor="join-message" className="text-sm font-bold text-foreground">
                Motivation message
              </label>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Mention your skills, your experience with game jams and what excites you about this project.
            </p>

            <div className="relative">
              <Textarea
                id="join-message"
                placeholder="Hi! I'm a 3D artist and I'd love to help with environment design, props and lighting..."
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= maxChars) {
                    setMessage(e.target.value)
                  }
                }}
                className="min-h-[140px] resize-none rounded-xl border-border/60 bg-secondary/50 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 transition-colors focus-visible:border-teal/40 focus-visible:ring-2 focus-visible:ring-teal/20 focus-visible:ring-offset-0"
                disabled={loading || statusMsg?.type === "success"}
              />
              <span className="absolute right-3 bottom-2.5 text-xs tabular-nums text-muted-foreground/50">
                {charCount}/{maxChars}
              </span>
            </div>

            {/* Status message */}
            {statusMsg && (
              <div
                aria-live="polite"
                className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium ${
                  statusMsg.type === "error"
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-teal/30 bg-teal/10 text-teal"
                }`}
              >
                {statusMsg.type === "error" ? (
                  <AlertCircle className="size-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="size-4 shrink-0" />
                )}
                <p className="leading-snug">{statusMsg.text}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="gap-2 px-6 pt-2 pb-8 flex-row justify-end">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="rounded-xl text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendRequest}
            disabled={loading || statusMsg?.type === "success" || charCount === 0}
            className="gap-2 rounded-xl bg-primary font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 sm:h-11"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : statusMsg?.type === "success" ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <Send className="size-4" />
            )}
            {statusMsg?.type === "success" ? "Sent!" : "Send Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}