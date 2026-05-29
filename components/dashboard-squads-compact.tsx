"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserAvatar } from "@/components/user-avatar"
import type { TeamData } from "@/components/dashboard-my-teams"
import { Cpu, Globe, Link2, MessageCircle, Settings2, Sparkles, UserMinus, Users2 } from "lucide-react"

function isExpiringSoon(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false
  const diff = new Date(expiresAt).getTime() - Date.now()
  return diff > 0 && diff <= 1000 * 60 * 60 * 48
}

function SquadCardCompact({
  team,
  onLeave,
}: {
  team: TeamData
  onLeave?: (id: string) => Promise<void> | void
}) {
  const visibleMembers = Math.max(1, Math.min(3, team.members))
  const extraCount = Math.max(0, team.members - visibleMembers)
  const expiringSoon = isExpiringSoon(team.expiresAt ?? null)

  return (
    <Card className="border-border/40 bg-card/70 shadow-sm backdrop-blur-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{team.name}</p>
            <p className="truncate text-xs text-primary">{team.jam || "Upcoming jam"}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {expiringSoon ? (
              <Badge className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0 text-[10px] font-semibold text-amber-500">
                Expiring soon
              </Badge>
            ) : null}
            <Badge
              variant="outline"
              className="rounded-full border-border/50 px-2 py-0 text-[10px] text-muted-foreground"
            >
              {team.members}/{team.maxMembers}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Cpu className="size-3 text-lavender" />
            {team.engine || "Any engine"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Globe className="size-3 text-teal" />
            {team.language || "Any language"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Sparkles className="size-3 text-peach" />
            {team.teamVibe?.trim() || team.level.label}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center -space-x-2">
            {Array.from({ length: visibleMembers }).map((_, index) => (
              <UserAvatar
                key={`${team.id}-member-${index}`}
                src={null}
                fallbackName={`${team.name} ${index + 1}`}
                size="xs"
                className="size-6 border border-background ring-1 ring-border/40"
              />
            ))}
            {extraCount > 0 ? (
              <span className="ml-1 inline-flex size-6 items-center justify-center rounded-full border border-border/50 bg-secondary text-[10px] font-semibold text-muted-foreground">
                +{extraCount}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Users2 className="size-3" />
            Open roles: {Math.max(0, team.maxMembers - team.members)}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" className="h-7 cursor-pointer rounded-lg px-2.5 text-xs">
            <Link href={`/teams/${team.id}`}>
              <MessageCircle className="size-3.5" />
              Open
            </Link>
          </Button>
          {team.discord_link ? (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-7 cursor-pointer rounded-lg border-primary/30 px-2.5 text-xs text-primary hover:bg-primary/10 hover:text-primary"
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
              className="h-7 cursor-pointer rounded-lg px-2.5 text-xs"
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
              className="h-7 cursor-pointer rounded-lg border-destructive/30 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
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
      <Card className="border-border/40 bg-card/70 shadow-sm backdrop-blur-sm">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-sm text-muted-foreground">No squads yet. Create one or join a team to get started.</p>
          <Button asChild size="sm" className="h-8 cursor-pointer rounded-lg">
            <Link href="/create-team">Create Team</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {teams.map((team) => (
        <SquadCardCompact key={team.id} team={team} onLeave={onLeave} />
      ))}
    </div>
  )
}
