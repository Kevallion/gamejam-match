"use client"

import { useState } from "react"
import { OptimizedAvatar } from "@/components/optimized-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Calendar,
  Cpu,
  Mail,
  Globe,
  ExternalLink,
  Loader2,
  ChevronDown,
  Users,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquareText,
  Target,
} from "lucide-react"
import { format, parseISO, isPast, addDays, isBefore } from "date-fns"
import { toast } from "sonner"

export type JammerCardData = {
  id: string
  username: string
  avatarUrl: string
  role: {
    label: string
    emoji: string
    color: string
  }
  level: {
    label: string
    emoji: string
    color: string
  }
  jamStyle?: {
    label: string
    emoji: string
    color: string
  }
  engine: string
  bio: string
  language: string
  portfolio_link?: string
  availability?: string
}

export type SquadOption = {
  id: string
  team_name: string
  game_name?: string
  needed_roles?: { key: string; label: string; emoji: string; color: string }[]
}

/** Parse availability string ("yyyy-MM-dd to yyyy-MM-dd" or "yyyy-MM-dd") into readable display + whether to show warning (past/near expiry) */
function parseAvailability(availability: string | undefined): { label: string; isWarning: boolean } | null {
  if (!availability || availability === "Not specified" || !availability.trim()) return null
  const trimmed = availability.trim()
  const parts = trimmed.split(/\s+to\s+/i).map((s) => s.trim())
  const fromStr = parts[0]
  const toStr = parts[1]
  try {
    const fromDate = parseISO(fromStr)
    const fromLabel = format(fromDate, "MMM d")
    const endDate = toStr ? parseISO(toStr) : fromDate
    const endLabel = toStr ? format(endDate, "MMM d") : fromLabel
    const now = new Date()
    const sevenDaysFromNow = addDays(now, 7)
    const isPastOrExpired = isPast(endDate)
    const nearExpiry = !isPast(endDate) && isBefore(endDate, sevenDaysFromNow)
    return {
      label: toStr ? `${fromLabel} – ${endLabel}` : fromLabel,
      isWarning: isPastOrExpired || nearExpiry,
    }
  } catch {
    return { label: trimmed, isWarning: false }
  }
}

interface JammerCardProps {
  player: JammerCardData
  mySquads: SquadOption[]
}

export function JammerCard({ player, mySquads }: JammerCardProps) {
  const [selectedSquad, setSelectedSquad] = useState<SquadOption | null>(null)
  const [selectedRoleIdx, setSelectedRoleIdx] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sentSquadIds, setSentSquadIds] = useState<Set<string>>(new Set())
  const [statusMsg, setStatusMsg] = useState<{ type: "error" | "success"; text: string } | null>(null)

  const maxChars = 500

  const squadRoles = selectedSquad?.needed_roles ?? []
  const selectedRole = selectedRoleIdx !== null ? squadRoles[selectedRoleIdx] ?? null : null

  function openInviteDialog(squad: SquadOption) {
    setSelectedSquad(squad)
    setSelectedRoleIdx(null)
    setMessage("")
    setStatusMsg(null)
    setDialogOpen(true)
  }

  function handleDialogClose(open: boolean) {
    if (!open && !loading) {
      setDialogOpen(false)
      setSelectedSquad(null)
      setSelectedRoleIdx(null)
      setMessage("")
      setStatusMsg(null)
    }
  }

  async function handleSendInvite() {
    if (!selectedRole) {
      setStatusMsg({ type: "error", text: "Please select the role you're inviting this jammer for." })
      return
    }
    if (!message.trim()) {
      setStatusMsg({ type: "error", text: "Please write a short message for this jammer." })
      return
    }
    if (!selectedSquad) return

    setLoading(true)
    setStatusMsg(null)

    try {
      const { error } = await supabase.from("join_requests").insert({
        team_id: selectedSquad.id,
        sender_id: player.id,
        sender_name: player.username,
        message: message.trim(),
        status: "pending",
        type: "invitation",
        target_role: selectedRole.key,
      })

      if (error) throw error

      setSentSquadIds((prev) => new Set(prev).add(selectedSquad.id))
      setStatusMsg({ type: "success", text: `Invite sent for the role of ${selectedRole.label}!` })

      toast.success(`Invitation sent to ${player.username}!`, {
        description: `Proposed role: ${selectedRole.label} in ${selectedSquad.team_name}.`,
      })

      setTimeout(() => {
        setDialogOpen(false)
        setSelectedSquad(null)
        setSelectedRoleIdx(null)
        setMessage("")
        setStatusMsg(null)
      }, 2000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred. Please try again."
      setStatusMsg({ type: "error", text: msg })
      toast.error("Could not send the invitation.", { description: msg })
    } finally {
      setLoading(false)
    }
  }

  const allSent = mySquads.length > 0 && mySquads.every((s) => sentSquadIds.has(s.id))
  const availabilityInfo = parseAvailability(player.availability)

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Card className="card-interactive group relative flex flex-col cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
            <CardContent className="flex flex-1 flex-col gap-4 pt-6">
              {/* Avatar + Username */}
              <div className="flex items-center gap-3.5">
                <OptimizedAvatar
                  src={player.avatarUrl}
                  alt={player.username}
                  size="md"
                  fallback={player.username
                    .split(/[\s_]+/)
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-bold text-foreground">
                    {player.username}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Globe className="size-3.5 text-teal" />
                    {player.language}
                  </div>
                </div>
              </div>

              {/* Role + Level + Jam Style badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${player.role.color}`}
                >
                  {player.role.emoji} {player.role.label}
                </Badge>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${player.level.color}`}
                >
                  {player.level.emoji} {player.level.label}
                </span>
                {player.jamStyle && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${player.jamStyle.color}`}
                    title={player.jamStyle.label}
                  >
                    {player.jamStyle.emoji} {player.jamStyle.label}
                  </span>
                )}
              </div>

              {/* Engine */}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Cpu className="size-3.5 text-lavender" />
                {player.engine}
              </div>

              {/* Availability */}
              {availabilityInfo && (
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium",
                    availabilityInfo.isWarning
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      : "border-border/60 bg-muted/50 text-muted-foreground",
                  )}
                >
                  <Calendar className="size-3.5 shrink-0" />
                  <span>Available: {availabilityInfo.label}</span>
                </div>
              )}

              {/* Bio */}
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {player.bio}
              </p>
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
              {mySquads.length === 0 ? (
                <div className="w-full rounded-xl border border-dashed border-border/60 px-3 py-2.5 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="size-3.5" />
                    <span>Create a team to invite this jammer</span>
                  </div>
                </div>
              ) : (
                <div className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary">
                  <ArrowRight className="size-4" />
                  View details
                </div>
              )}
            </CardFooter>
          </Card>
        </DialogTrigger>

        {/* Profile Details Modal */}
        <DialogContent className="max-w-lg rounded-2xl border-border/60 bg-card p-0 shadow-2xl shadow-lavender/10 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 space-y-1 text-left border-b border-border/60">
            <div className="flex items-center gap-4">
              <OptimizedAvatar
                src={player.avatarUrl}
                alt={player.username}
                size="lg"
                fallback={player.username
                  .split(/[\s_]+/)
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              />
              <div>
                <DialogTitle className="text-xl font-bold text-foreground">
                  {player.username}
                </DialogTitle>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <Globe className="size-3.5 text-teal" />
                  {player.language}
                </div>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] px-6 py-4">
            <div className="flex flex-col gap-4 pr-4">
              {/* Badges Role, Level, Jam Style, Engine */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`rounded-full border-border/60 px-3 py-1 text-xs font-semibold ${player.role.color}`}
                >
                  {player.role.emoji} {player.role.label}
                </Badge>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${player.level.color}`}
                >
                  {player.level.emoji} {player.level.label}
                </span>
                {player.jamStyle && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${player.jamStyle.color}`}
                  >
                    {player.jamStyle.emoji} {player.jamStyle.label}
                  </span>
                )}
                <Badge
                  variant="outline"
                  className="inline-flex items-center gap-1.5 rounded-full border-border/60 bg-lavender/10 px-3 py-1 text-xs font-semibold text-lavender"
                >
                  <Cpu className="size-3.5" />
                  {player.engine}
                </Badge>
              </div>

              {/* Availability */}
              {availabilityInfo && (
                <div
                  className={cn(
                    "inline-flex w-fit items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium",
                    availabilityInfo.isWarning
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      : "border-border/60 bg-muted/50 text-muted-foreground",
                  )}
                >
                  <Calendar className="size-3.5 shrink-0" />
                  <span>Available: {availabilityInfo.label}</span>
                </div>
              )}

              {/* Full bio */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-foreground">
                  About
                </h4>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {player.bio}
                </p>
              </div>

              {/* Portfolio */}
              {player.portfolio_link && (
                <a
                  href={player.portfolio_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <ExternalLink className="size-4" />
                  View portfolio
                </a>
              )}
            </div>
          </ScrollArea>

          {/* Pied de page avec Inviter */}
          <div className="border-t border-border/60 px-6 py-4 bg-muted/20">
            {mySquads.length === 0 ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 px-4 py-3 text-sm text-muted-foreground">
                <Users className="size-4" />
                Create a team to invite this jammer
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      disabled={allSent}
                      className="w-full gap-2 rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/85"
                    >
                      <Mail className="size-4" />
                      {allSent ? "All invitations sent ✓" : "Invite to my team"}
                      {!allSent && <ChevronDown className="size-3.5 ml-auto" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Choose a team
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {mySquads.map((squad) => {
                      const sent = sentSquadIds.has(squad.id)
                      return (
                        <DropdownMenuItem
                          key={squad.id}
                          disabled={sent}
                          onSelect={() => openInviteDialog(squad)}
                          className="cursor-pointer"
                        >
                          {sent && <span className="mr-2">✓</span>}
                          {squad.team_name}
                          {sent && (
                            <span className="ml-auto text-xs text-muted-foreground">Sent</span>
                          )}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl border-border/60 bg-card p-0 shadow-2xl shadow-lavender/10">

          {/* Header */}
          <div className="relative overflow-hidden rounded-t-2xl px-6 pt-6 pb-4">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-lavender/60 via-pink/40 to-teal/50" />

            <DialogHeader className="space-y-2.5 text-left">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-lavender/15">
                  <Mail className="size-4 text-lavender" />
                </div>
                <DialogTitle className="text-lg font-extrabold tracking-tight text-foreground">
                  Invite Jammer
                </DialogTitle>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Inviting</span>
                <Badge className="rounded-full border-0 bg-lavender/15 px-2.5 py-0.5 text-xs font-bold text-lavender">
                  <Sparkles className="mr-1 size-3" />
                  {player.username}
                </Badge>
                <span className="text-sm text-muted-foreground">to</span>
                <Badge className="rounded-full border-0 bg-teal/15 px-2.5 py-0.5 text-xs font-bold text-teal">
                  {selectedSquad?.team_name}
                </Badge>
                {selectedSquad?.game_name && (
                  <>
                    <span className="text-sm text-muted-foreground">for</span>
                    <Badge className="rounded-full border-0 bg-peach/15 px-2.5 py-0.5 text-xs font-bold text-peach">
                      {selectedSquad.game_name}
                    </Badge>
                  </>
                )}
              </div>

              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Specify the role you need and write a message to convince this jammer.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Body */}
          <div className="px-6 pb-2">
            <div className="flex flex-col gap-4">

              {/* Role selector */}
              {squadRoles.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Target className="size-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">Role offered</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {squadRoles.map((role, idx) => {
                      const isSelected = selectedRoleIdx === idx
                      return (
                        <button
                          key={`${role.key}-${idx}`}
                          type="button"
                          disabled={loading || statusMsg?.type === "success"}
                          onClick={() => setSelectedRoleIdx(idx)}
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                            isSelected
                              ? `ring-2 ring-offset-2 ring-offset-card ring-primary ${role.color} scale-105`
                              : `${role.color} hover:scale-105`,
                          ].join(" ")}
                        >
                          {role.emoji} {role.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Motivation message */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="size-4 text-lavender" />
                  <label htmlFor="invite-message" className="text-sm font-bold text-foreground">
                    Your message
                  </label>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Tell them about your project and what makes your squad exciting to join.
                </p>

                <div className="relative">
                  <Textarea
                    id="invite-message"
                    placeholder="Hey! We're building a platformer for the GMTK Jam and we'd love to have you on board as our..."
                    value={message}
                    onChange={(e) => {
                      if (e.target.value.length <= maxChars) setMessage(e.target.value)
                    }}
                    className="min-h-[120px] resize-none rounded-xl border-border/60 bg-secondary/50 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 transition-colors focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
                    disabled={loading || statusMsg?.type === "success"}
                  />
                  <span className="absolute right-3 bottom-2.5 text-xs tabular-nums text-muted-foreground/50">
                    {message.length}/{maxChars}
                  </span>
                </div>
              </div>

              {/* Status message */}
              {statusMsg && (
                <div
                  aria-live="polite"
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                    statusMsg.type === "error" ? "status-error" : "status-success"
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
              onClick={() => handleDialogClose(false)}
              disabled={loading}
              className="rounded-xl text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInvite}
              disabled={loading || statusMsg?.type === "success" || message.length === 0 || !selectedRole}
              className="gap-2 rounded-xl bg-primary font-bold text-primary-foreground transition-all hover:bg-primary/85 disabled:opacity-50 sm:h-11"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : statusMsg?.type === "success" ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <Send className="size-4" />
              )}
              {statusMsg?.type === "success" ? "Sent!" : "Send Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Backward-compatible aliases
export { JammerCard as PlayerCard }
export type { JammerCardData as PlayerCardData }
export type { SquadOption as TeamOption }
