"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { TeamData } from "@/components/dashboard-my-teams"
import { Link2, MessageCircle, Settings2, UserMinus, Users2 } from "lucide-react"

function isExpiringSoon(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false
  const diff = new Date(expiresAt).getTime() - Date.now()
  return diff > 0 && diff <= 1000 * 60 * 60 * 48
}

function squadStatus(team: TeamData): { label: string; className: string } {
  if (isExpiringSoon(team.expiresAt ?? null)) {
    return {
      label: "Expiring",
      className: "border-amber-500/40 bg-amber-500/10 text-amber-500",
    }
  }
  if (team.members >= team.maxMembers) {
    return {
      label: "Ready",
      className: "border-teal/40 bg-teal/15 text-teal",
    }
  }
  return {
    label: "Recruiting",
    className: "border-pink/40 bg-pink/15 text-pink",
  }
}

function SquadCardCompact({
  team,
  onLeave,
}: {
  team: TeamData
  onLeave?: (id: string) => Promise<void> | void
}) {
  const openRoles = Math.max(0, team.maxMembers - team.members)
  const neededRole = team.roles[0]?.label
  const status = squadStatus(team)

  return (
    <Card className="min-w-0 max-w-full border-border/60 bg-card shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">{team.name}</p>
            <p className="truncate text-xs text-muted-foreground">{team.jam || "Upcoming jam"}</p>
          </div>
          <Badge className={`shrink-0 rounded-full border px-2 py-0 text-[11px] font-semibold ${status.className}`}>
            {status.label}
          </Badge>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users2 className="size-3.5 shrink-0 text-teal" aria-hidden />
            {team.members}/{team.maxMembers} members
          </span>
          <span className="min-w-0 truncate">
            {openRoles > 0 ? `Needs ${neededRole || "a jammer"}` : "Roster full"}
          </span>
        </div>

        <p className="min-w-0 truncate text-[11px] text-muted-foreground">
          {[team.engine || "Any engine", team.language || "Any language"].join(" · ")}
        </p>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Button asChild size="sm" className="h-9 max-w-full rounded-lg px-2.5 text-xs">
            <Link href={`/teams/${team.id}`}>
              <MessageCircle className="size-3.5" />
              View squad
            </Link>
          </Button>
          {team.discord_link ? (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-9 max-w-full rounded-lg border-primary/30 px-2.5 text-xs text-primary hover:bg-primary/10 hover:text-primary"
            >
              <a href={team.discord_link} target="_blank" rel="noopener noreferrer">
                <Link2 className="size-3.5" />
                Discord
              </a>
            </Button>
          ) : null}
          {team.isOwner ? (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-9 max-w-full rounded-lg px-2.5 text-xs"
            >
              <Link href={`/teams/${team.id}/manage`}>
                <Settings2 className="size-3.5" />
                Manage
              </Link>
            </Button>
          ) : onLeave ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 max-w-full rounded-lg border-destructive/30 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => void onLeave(team.id)}
            >
              <UserMinus className="size-3.5" />
              Leave
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardSquadsCompact({
  teams,
  onLeave,
}: {
  teams: TeamData[]
  onLeave?: (id: string) => Promise<void> | void
}) {
  if (teams.length === 0) {
    return (
      <Card className="min-w-0 max-w-full border-border/60 bg-card shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-teal/15 text-teal">
            <Users2 className="size-6" aria-hidden />
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">You are not in a squad yet.</p>
          <Button asChild size="sm" className="h-11 rounded-xl bg-teal text-teal-foreground hover:bg-teal/90">
            <Link href="/teams">Browse squads</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2">
      {teams.map((team) => (
        <SquadCardCompact key={team.id} team={team} onLeave={onLeave} />
      ))}
    </div>
  )
}
