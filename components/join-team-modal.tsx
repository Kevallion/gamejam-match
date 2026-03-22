"use client"

import { useState, useEffect, useRef } from "react"
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
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
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
  Target,
  Lock,
} from "lucide-react"
import { toast } from "sonner"
import { track } from "@vercel/analytics"
import { notifyOwnerNewApplication } from "@/app/actions/team-actions"
import { useIsMobile } from "@/hooks/use-mobile"

const MOTIVATION_MAX_CHARS = 500

function buildDefaultMotivation(role: string | null, engine: string | null): string {
  const r = role?.trim() || null
  const e = engine?.trim() || null
  if (r && e) {
    return `Hi! I'm a ${r} using ${e}. Your project looks awesome and I'd love to join the squad for this jam!`
  }
  if (r) {
    return `Hi! I'm a ${r}. Your project looks awesome and I'd love to join the squad for this jam!`
  }
  if (e) {
    return `Hi! I'm using ${e}. Your project looks awesome and I'd love to join the squad for this jam!`
  }
  return "Hi! I'm really interested in your project and I'd love to join the squad for this jam!"
}

function clampMotivation(text: string): string {
  return text.length > MOTIVATION_MAX_CHARS ? text.slice(0, MOTIVATION_MAX_CHARS) : text
}

export type ApplicantProfileDefaults = {
  default_role?: string | null
  default_engine?: string | null
}

type RoleOption = {
  key: string
  label: string
  emoji: string
  color: string
  filled?: boolean
}

interface JoinTeamModalProps {
  teamId: string
  teamName: string
  availableRoles: RoleOption[]
  ownerUserId?: string
  /** If set, used to pre-fill the motivation text without fetching `profiles`. Omit to load defaults when the modal opens. */
  applicantProfile?: ApplicantProfileDefaults
  /** True when opened from the smart-match / recommended section (TeamCard). */
  isRecommended?: boolean
  children: React.ReactNode
}

export function JoinTeamModal({
  teamId,
  teamName,
  availableRoles,
  ownerUserId,
  applicantProfile,
  isRecommended = false,
  children,
}: JoinTeamModalProps) {
  const [selectedRoleIdx, setSelectedRoleIdx] = useState<number | null>(null)
  const selectedRole = selectedRoleIdx !== null ? availableRoles[selectedRoleIdx] ?? null : null
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [isOwnTeam, setIsOwnTeam] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{
    type: "error" | "success"
    text: string
  } | null>(null)
  const isMobile = useIsMobile()
  const userEditedMessageRef = useRef(false)

  useEffect(() => {
    if (open && ownerUserId) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsOwnTeam(session?.user?.id === ownerUserId)
      })
    } else {
      setIsOwnTeam(false)
    }
  }, [open, ownerUserId])

  useEffect(() => {
    if (!open) return

    let cancelled = false

    const applyFromValues = (role: string | null, engine: string | null) => {
      if (cancelled) return
      setMessage(clampMotivation(buildDefaultMotivation(role, engine)))
    }

    if (applicantProfile !== undefined) {
      if (!userEditedMessageRef.current) {
        applyFromValues(
          applicantProfile.default_role?.trim() || null,
          applicantProfile.default_engine?.trim() || null,
        )
      }
      return () => {
        cancelled = true
      }
    }

    if (!userEditedMessageRef.current) {
      applyFromValues(null, null)
    }

    ;(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (cancelled || userEditedMessageRef.current) return
      if (!session?.user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("default_role, default_engine")
        .eq("id", session.user.id)
        .maybeSingle()

      if (cancelled || userEditedMessageRef.current) return
      applyFromValues(
        profile?.default_role?.trim() || null,
        profile?.default_engine?.trim() || null,
      )
    })()

    return () => {
      cancelled = true
    }
  }, [open, applicantProfile])

  const charCount = message.length
  const maxChars = MOTIVATION_MAX_CHARS
  const openRoles = availableRoles.filter((r) => !r.filled)

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setSelectedRoleIdx(null)
      setMessage("")
      setStatusMsg(null)
      userEditedMessageRef.current = false
    } else {
      userEditedMessageRef.current = false
    }
  }

  const handleSendRequest = async () => {
    if (!selectedRole) {
      setStatusMsg({ type: "error", text: "Please select a role you're applying for." })
      return
    }
    if (!message.trim()) {
      setStatusMsg({ type: "error", text: "Please write a short motivation message." })
      return
    }

    setLoading(true)
    setStatusMsg(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setStatusMsg({ type: "error", text: "You must be logged in to apply." })
        setLoading(false)
        return
      }

      if (ownerUserId && session.user.id === ownerUserId) {
        setStatusMsg({ type: "error", text: "You cannot join your own team." })
        setLoading(false)
        return
      }

      // Prefer profile username, then Discord metadata
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", session.user.id)
        .single()
      const meta = session.user.user_metadata as Record<string, string> | undefined
      const senderName =
        profile?.username?.trim() ||
        meta?.full_name ||
        meta?.name ||
        meta?.user_name ||
        meta?.username ||
        "A Jammer"

      const { error } = await supabase.from("join_requests").insert({
        team_id: teamId,
        sender_id: session.user.id,
        sender_name: senderName,
        message: message.trim(),
        status: "pending",
        type: "application",
        target_role: selectedRole.key,
      })

      if (error) throw error

      track("Applied to Team", {
        smart_match: isRecommended ? "true" : "false",
        prefilled_template: userEditedMessageRef.current ? "false" : "true",
      })

      // Notification e-mail au propriétaire de l'équipe (asynchrone, non bloquant)
      if (ownerUserId) {
        void notifyOwnerNewApplication(ownerUserId, senderName, teamName)
      }

      setStatusMsg({
        type: "success",
        text: `Application sent for the role of ${selectedRole.label}!`,
      })

      toast.success(`Application sent for the role of ${selectedRole.label}!`, {
        description: `You applied to join ${teamName}.`,
      })

      setTimeout(() => {
        handleOpen(false)
      }, 2000)
    } catch (err: unknown) {
      const isFkError = err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "23503"
      const msg = isFkError
        ? "This team may have been removed. Please refresh the page."
        : (err instanceof Error ? err.message : (err as { message?: string }).message ?? "An error occurred. Please try again.")
      setStatusMsg({ type: "error", text: msg })
      toast.error("Could not send the application.", { description: msg })
    } finally {
      setLoading(false)
    }
  }

  const content = (
    <>
      {/* Header */}
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
            <span className="text-sm text-muted-foreground">Applying to</span>
            <Badge className="rounded-full border-0 bg-teal/15 px-2.5 py-0.5 text-xs font-bold text-teal">
              <Sparkles className="mr-1 size-3" />
              {teamName}
            </Badge>
          </div>

          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            Select the role you want to fill, then introduce yourself.
          </DialogDescription>
        </DialogHeader>
      </div>

      {/* Body */}
      <div className="px-6 pb-2">
        <div className="flex flex-col gap-4">

          {isOwnTeam && (
            <div
              aria-live="polite"
              className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-sm font-medium text-amber-700 dark:text-amber-400"
            >
              <AlertCircle className="size-4 shrink-0" />
              <p className="leading-snug">You cannot join your own team.</p>
            </div>
          )}

          {/* Role selector */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Choose a role</span>
            </div>

            {availableRoles.length === 0 ? (
              <p className="text-xs text-muted-foreground">This team hasn&apos;t listed any roles.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableRoles.map((role, idx) => {
                  const isSelected = selectedRoleIdx === idx
                  return (
                    <button
                      key={`${role.key}-${idx}`}
                      type="button"
                      disabled={role.filled || loading || statusMsg?.type === "success"}
                      onClick={() => !role.filled && setSelectedRoleIdx(idx)}
                      className={[
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                        role.filled
                          ? "cursor-not-allowed opacity-40 line-through bg-muted text-muted-foreground"
                          : isSelected
                          ? `ring-2 ring-offset-2 ring-offset-card ring-primary ${role.color} scale-105`
                          : `${role.color} hover:scale-105 cursor-pointer`,
                      ].join(" ")}
                    >
                      {role.filled && <Lock className="size-3" />}
                      {role.emoji} {role.label}
                      {role.filled && <span className="ml-0.5 text-[10px]">Filled</span>}
                    </button>
                  )
                })}
              </div>
            )}

            {openRoles.length === 0 && availableRoles.length > 0 && (
              <p className="text-xs font-semibold text-muted-foreground">
                All roles are already filled for this team.
              </p>
            )}
          </div>

          {/* Motivation message */}
          <div className="flex flex-col gap-2 pb-2">
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
                  userEditedMessageRef.current = true
                  if (e.target.value.length <= maxChars) setMessage(e.target.value)
                }}
                className="min-h-[120px] resize-none rounded-xl border-border/60 bg-secondary/50 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 transition-colors focus-visible:border-teal/40 focus-visible:ring-2 focus-visible:ring-teal/20 focus-visible:ring-offset-0"
                disabled={loading || statusMsg?.type === "success" || isOwnTeam}
              />
              <span className="absolute right-3 bottom-2.5 text-xs tabular-nums text-muted-foreground/50">
                {charCount}/{maxChars}
              </span>
            </div>
          </div>

          {/* Status */}
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
          onClick={() => handleOpen(false)}
          disabled={loading}
          className="rounded-xl text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSendRequest}
          disabled={
            loading ||
            statusMsg?.type === "success" ||
            !selectedRole ||
            charCount === 0 ||
            openRoles.length === 0 ||
            isOwnTeam
          }
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
    </>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="w-full rounded-t-3xl border-border/60 bg-card p-0 shadow-2xl shadow-teal/10">
          {content}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl border-border/60 bg-card p-0 shadow-2xl shadow-teal/10">
        {content}
      </DialogContent>
    </Dialog>
  )
}
