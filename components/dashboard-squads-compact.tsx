"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppIcon } from "@/components/ui/app-icon"
import { UserAvatar } from "@/components/user-avatar"
import type { TeamData } from "@/components/dashboard-my-teams"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"

function isExpiringSoon(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false
  const diff = new Date(expiresAt).getTime() - Date.now()
  return diff > 0 && diff <= 1000 * 60 * 60 * 48
}

function squadStatus(team: TeamData): { label: string; className: string } {
  if (isExpiringSoon(team.expiresAt ?? null)) {
    return {
      label: "Expiring",
      className: "border-peach/40 bg-peach/10 text-peach",
    }
  }
  if (team.members >= team.maxMembers) {
    return {
      label: "Ready",
      className: "border-mint/40 bg-mint/15 text-mint",
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
  accent,
}: {
  team: TeamData
  onLeave?: (id: string) => Promise<void> | void
  accent: "teal" | "pink"
}) {
  const openRoles = Math.max(0, team.maxMembers - team.members)
  const status = squadStatus(team)
  const readiness =
    team.maxMembers > 0 ? Math.min(100, Math.round((team.members / team.maxMembers) * 100)) : 0
  const visibleMembers = Math.max(1, Math.min(3, team.members))
  const extraCount = Math.max(0, team.members - visibleMembers)

  return (
    <Card className="card-interactive min-w-0 max-w-full overflow-hidden border-border/60 bg-card shadow-sm">
      <div className={cn("h-1", accent === "pink" ? "bg-pink" : "bg-teal")} aria-hidden />
      <CardContent className="space-y-3 p-4 sm:p-5">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-foreground">{team.name}</p>
            <p className="truncate text-xs font-medium text-teal">{team.jam || "Upcoming jam"}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            <Badge
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                team.isOwner ? "border-pink/40 bg-pink/15 text-pink" : "border-mint/40 bg-mint/15 text-mint",
              )}
            >
              {team.isOwner ? "Captain" : "Member"}
            </Badge>
            <Badge className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", status.className)}>
              {status.label}
            </Badge>
          </div>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-1">
            <AppIcon icon={ICON.squad} size="xs" tone="teal" />
            {team.members}/{team.maxMembers}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-1">
            <AppIcon icon={ICON.engine} size="xs" tone="lavender" />
            {team.engine || "Any"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-1">
            <AppIcon icon={ICON.language} size="xs" tone="teal" />
            {team.language || "Any"}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Jam readiness</span>
            <span className="tabular-nums">{readiness}%</span>
          </div>
          <Progress value={readiness} className="h-1.5 bg-muted/80" />
        </div>

        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div className="flex items-center -space-x-2">
            {Array.from({ length: visibleMembers }).map((_, index) => (
              <UserAvatar
                key={`${team.id}-member-${index}`}
                src={null}
                fallbackName={`${team.name} ${index + 1}`}
                size="xs"
                className="size-7 border border-background ring-1 ring-border/40"
              />
            ))}
            {extraCount > 0 ? (
              <span className="ml-1 inline-flex size-7 items-center justify-center rounded-full border border-border/50 bg-secondary text-[11px] font-semibold text-muted-foreground">
                +{extraCount}
              </span>
            ) : null}
          </div>
          <p className="text-xs font-medium text-peach">
            {openRoles > 0 ? `${openRoles} open role${openRoles === 1 ? "" : "s"}` : "Roster full"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button asChild className="h-11 min-w-[92px] rounded-xl px-4 text-sm">
            <Link href={team.isOwner ? `/teams/${team.id}/manage` : `/teams/${team.id}`}>
              {team.isOwner ? "Manage" : "Open"}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11 rounded-xl"
                aria-label="More squad actions"
              >
                <AppIcon icon={ICON.more} size="md" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem asChild>
                <Link href={`/teams/${team.id}`}>View squad</Link>
              </DropdownMenuItem>
              {team.discord_link ? (
                <DropdownMenuItem asChild>
                  <a href={team.discord_link} target="_blank" rel="noopener noreferrer">
                    Discord
                  </a>
                </DropdownMenuItem>
              ) : null}
              {!team.isOwner && onLeave ? (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => void onLeave(team.id)}
                >
                  Leave squad
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
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
    // Empty squad CTA lives in Get started (Home). Avoid a duplicate empty card.
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-foreground">My squads</h3>
        <Link href="/teams" className="text-sm font-semibold text-teal hover:underline">
          See all
        </Link>
      </div>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        {teams.map((team, index) => (
          <SquadCardCompact
            key={team.id}
            team={team}
            onLeave={onLeave}
            accent={index % 2 === 0 ? "teal" : "pink"}
          />
        ))}
      </div>
    </div>
  )
}
