"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
} from "@/components/ui/dialog"
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
import {
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
  engine: string
  bio: string
  language: string
  portfolio_link?: string
}

export type SquadOption = {
  id: string
  team_name: string
  game_name?: string
  needed_roles?: { key: string; label: string; emoji: string; color: string }[]
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

      toast.success(`Invitation envoyée à ${player.username} !`, {
        description: `Rôle proposé : ${selectedRole.label} dans ${selectedSquad.team_name}.`,
      })

      setTimeout(() => {
        setDialogOpen(false)
        setSelectedSquad(null)
        setSelectedRoleIdx(null)
        setMessage("")
        setStatusMsg(null)
      }, 2000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue. Réessaie."
      setStatusMsg({ type: "error", text: msg })
      toast.error("Impossible d'envoyer l'invitation.", { description: msg })
    } finally {
      setLoading(false)
    }
  }

  const allSent = mySquads.length > 0 && mySquads.every((s) => sentSquadIds.has(s.id))

  return (
    <>
      <Card className="card-interactive group relative flex flex-col">
        <CardContent className="flex flex-1 flex-col gap-4 pt-6">
          {/* Avatar + Username */}
          <div className="flex items-center gap-3.5">
            <Avatar className="size-12 ring-2 ring-border/60">
              <AvatarImage src={player.avatarUrl} alt={player.username} />
              <AvatarFallback className="bg-secondary text-sm font-bold text-secondary-foreground">
                {player.username
                  .split(/[\s_]+/)
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
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

          {/* Role + Level badges */}
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
          </div>

          {/* Engine */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Cpu className="size-3.5 text-lavender" />
            {player.engine}
          </div>

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
                <span>Create a squad to invite this jammer</span>
              </div>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={allSent}
                  className="w-full gap-2 rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/85"
                >
                  <Mail className="size-4" />
                  {allSent ? "All invites sent ✓" : "Invite to Squad"}
                  {!allSent && <ChevronDown className="size-3.5 ml-auto" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Pick a squad
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
          )}

          {player.portfolio_link && (
            <a
              href={player.portfolio_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <ExternalLink className="size-3.5" />
              View Portfolio
            </a>
          )}
        </CardFooter>
      </Card>

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
