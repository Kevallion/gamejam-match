"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, X, Mail, Sparkles, Swords, Target, Gamepad2 } from "lucide-react"

const ROLE_STYLES: Record<string, { label: string; emoji: string; color: string }> = {
  developer: { label: "Developer", emoji: "💻", color: "bg-teal/15 text-teal" },
  "2d-artist": { label: "2D Artist", emoji: "🎨", color: "bg-pink/15 text-pink" },
  "3d-artist": { label: "3D Artist", emoji: "🗿", color: "bg-peach/15 text-peach" },
  audio: { label: "Audio", emoji: "🎵", color: "bg-lavender/15 text-lavender" },
  voice_actor: { label: "Voice Actor", emoji: "🎙️", color: "bg-lavender/15 text-lavender" },
  writer: { label: "Writer", emoji: "✍️", color: "bg-pink/15 text-pink" },
  "game-design": { label: "Game Designer", emoji: "🎯", color: "bg-peach/15 text-peach" },
  "ui-ux": { label: "UI / UX", emoji: "✨", color: "bg-mint/15 text-mint" },
  qa: { label: "QA / Playtester", emoji: "🐛", color: "bg-peach/15 text-peach" },
}

export type InvitationData = {
  id: string
  team_id: string
  squadName: string
  gameName?: string | null
  discordLink: string | null
  targetRole?: string | null
}

interface DashboardSquadInvitationsProps {
  invitations: InvitationData[]
  onAccept: (invitation: InvitationData) => void
  onDecline: (id: string) => void
}

export function DashboardSquadInvitations({
  invitations,
  onAccept,
  onDecline,
}: DashboardSquadInvitationsProps) {
  return (
    <section>
      {/* Section header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-lavender/15">
            <Mail className="size-5 text-lavender" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">
              Squad Invitations
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Squads that want you on their roster
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="rounded-full bg-lavender/15 px-3.5 py-1.5 text-sm font-bold text-lavender"
        >
          <Sparkles className="mr-1.5 size-3.5" />
          {invitations.length} pending
        </Badge>
      </div>

      {invitations.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 rounded-2xl border-border/50 border-dashed bg-card/50 px-6 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-secondary/80">
            <Mail className="size-7 text-muted-foreground/60" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              No squad invitations yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep building your profile — squads will find you!
            </p>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {invitations.map((inv) => {
            const roleStyle = inv.targetRole
              ? (ROLE_STYLES[inv.targetRole] ?? { label: inv.targetRole, emoji: "🎭", color: "bg-muted text-muted-foreground" })
              : null

            return (
              <Card
                key={inv.id}
                className="group relative overflow-hidden rounded-2xl border-border/50 bg-card transition-all duration-300 hover:border-lavender/30 hover:shadow-lg hover:shadow-lavender/5"
              >
                {/* Subtle top accent line */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-lavender/60 via-pink/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <CardContent className="flex flex-col gap-4 px-6 py-5 sm:px-8 sm:py-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Squad info */}
                    <div className="flex items-center gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-lavender/10 ring-2 ring-lavender/20 transition-all duration-300 group-hover:ring-lavender/40">
                        <Swords className="size-5 text-lavender" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-base font-bold text-foreground">
                          {inv.squadName}
                        </h3>

                        {/* Role + Game enrichis */}
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          {roleStyle && (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleStyle.color}`}>
                              <Target className="size-3" />
                              {roleStyle.emoji} {roleStyle.label}
                            </span>
                          )}
                          {inv.gameName && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-peach/10 px-2.5 py-0.5 text-xs font-semibold text-peach">
                              <Gamepad2 className="size-3" />
                              {inv.gameName}
                            </span>
                          )}
                          {!roleStyle && !inv.gameName && (
                            <span>You&apos;ve been invited to join this squad</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex shrink-0 items-center gap-3">
                      <Button
                        onClick={() => onAccept(inv)}
                        className="gap-2 rounded-xl bg-green-600 px-5 text-white shadow-md shadow-green-500/20 transition-all hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/30"
                      >
                        <Check className="size-4" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => onDecline(inv.id)}
                        className="gap-2 rounded-xl border-red-500/50 px-5 text-red-600 transition-all hover:border-red-500 hover:bg-red-500/10 hover:text-red-700"
                      >
                        <X className="size-4" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}
