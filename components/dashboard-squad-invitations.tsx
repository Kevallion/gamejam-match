"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TagIcon } from "@/components/tag-icon"
import { ROLE_STYLES } from "@/lib/constants"
import { Check, X, Mail, Gamepad2 } from "lucide-react"
import { IconTile } from "@/components/ui/app-icon"

export type InvitationData = {
  id: string
  team_id: string
  squadName: string
  gameName?: string | null
  discordLink: string | null
  targetRole?: string | null
  captainMessage?: string | null
  engineLabel?: string | null
  jamTitle?: string | null
  description?: string | null
  teamVibe?: string | null
  experienceRequired?: string | null
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
          {invitations.length} pending
        </Badge>
      </div>

      {invitations.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 rounded-2xl border-border/50 border-dashed bg-card/50 px-6 py-14 text-center">
          <IconTile icon={Mail} tone="muted" />
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
            const roleKey = (inv.targetRole ?? "").trim().toLowerCase()
            const roleValue = roleKey ? (ROLE_STYLES[roleKey] ? roleKey : "other") : ""

            return (
              <Card
                key={inv.id}
                id={`inbox-request-${inv.id}`}
                className="group relative overflow-hidden rounded-2xl border-border/50 bg-card transition-all duration-300 hover:border-lavender/30 hover:shadow-lg hover:shadow-lavender/5 scroll-mt-24"
              >
                {/* Subtle top accent line */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-lavender/60 via-pink/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <CardContent className="flex flex-col gap-4 px-6 py-5 sm:px-8 sm:py-6">
                  {inv.captainMessage?.trim() ? (
                    <div className="rounded-xl border border-lavender/25 bg-secondary/40 px-4 py-3">
                      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-lavender">
                        <Mail className="size-3.5" aria-hidden />
                        Message from the captain
                      </p>
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {inv.captainMessage.trim()}
                      </p>
                    </div>
                  ) : null}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Squad info */}
                    <div className="flex items-center gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-lavender/10 ring-2 ring-lavender/20 transition-all duration-300 group-hover:ring-lavender/40">
                        <Mail className="size-5 text-lavender" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-base font-bold text-foreground">
                          {inv.squadName}
                        </h3>

                        {/* Role + Game enrichis */}
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          {roleValue ? (
                            <TagIcon kind="role" value={roleValue} size="xs" showLabel withTooltip={false} />
                          ) : null}
                          {inv.gameName && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-peach/10 px-2.5 py-0.5 text-xs font-semibold text-peach">
                              <Gamepad2 className="size-3" />
                              {inv.gameName}
                            </span>
                          )}
                          {inv.engineLabel && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-semibold text-teal">
                              {inv.engineLabel}
                            </span>
                          )}
                          {inv.jamTitle && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-mint/15 px-2.5 py-0.5 text-xs font-semibold text-mint">
                              {inv.jamTitle}
                            </span>
                          )}
                          {!roleValue && !inv.gameName && !inv.engineLabel && !inv.jamTitle && (
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
                  {(inv.description?.trim() || inv.teamVibe?.trim() || inv.experienceRequired?.trim()) && (
                    <div className="space-y-2 border-t border-border/40 pt-4 text-sm text-muted-foreground">
                      {inv.description?.trim() ? (
                        <p>
                          <span className="font-semibold text-foreground">Pitch: </span>
                          {inv.description.trim()}
                        </p>
                      ) : null}
                      {inv.teamVibe?.trim() ? (
                        <p>
                          <span className="font-semibold text-foreground">Vibe: </span>
                          {inv.teamVibe.trim()}
                        </p>
                      ) : null}
                      {inv.experienceRequired?.trim() ? (
                        <p>
                          <span className="font-semibold text-foreground">Looking for: </span>
                          {inv.experienceRequired.trim()}
                        </p>
                      ) : null}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}
