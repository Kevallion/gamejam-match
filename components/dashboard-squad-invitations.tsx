"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, X, Mail, Sparkles, Swords } from "lucide-react"

export type InvitationData = {
  id: string
  team_id: string
  squadName: string
  discordLink: string | null
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
          {invitations.map((inv) => (
            <Card
              key={inv.id}
              className="group relative overflow-hidden rounded-2xl border-border/50 bg-card transition-all duration-300 hover:border-lavender/30 hover:shadow-lg hover:shadow-lavender/5"
            >
              {/* Subtle top accent line */}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-lavender/60 via-pink/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <CardContent className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
                {/* Squad info */}
                <div className="flex items-center gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-lavender/10 ring-2 ring-lavender/20 transition-all duration-300 group-hover:ring-lavender/40">
                    <Swords className="size-5 text-lavender" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {inv.squadName}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      You&apos;ve been invited to join this squad
                    </p>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
