import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Globe, Cpu, Users, ArrowRight, ShieldCheck } from "lucide-react"

import { JoinTeamModal } from "@/components/join-team-modal"

type RoleBadge = {
  label: string
  emoji: string
  color: string
  key?: string
  filled?: boolean
}

type LevelBadge = {
  label: string
  emoji: string
  color: string
}

export type TeamCardData = {
  id: string
  user_id?: string
  name: string
  jam: string
  engine: string
  language: string
  description: string
  members: number
  maxMembers: number
  roles: RoleBadge[]
  level: LevelBadge
  teamVibe?: { label: string; emoji: string; color: string; badgeColor?: string }
  filledRoleKeys?: string[]
}

export function TeamCard({ team }: { team: TeamCardData }) {
  const filledKeys = team.filledRoleKeys ?? []

  // Count acceptances per role (e.g. 2 artists, 1 acceptance -> only first slot filled)
  const filledCountByKey: Record<string, number> = {}
  for (const key of filledKeys) {
    filledCountByKey[key] = (filledCountByKey[key] ?? 0) + 1
  }

  const consumedByKey: Record<string, number> = {}
  const availableRoles = team.roles.map((role) => {
    const key = role.key ?? role.label.toLowerCase().replace(/\s+/g, "-")
    const filledForRole = filledCountByKey[key] ?? 0
    const consumed = consumedByKey[key] ?? 0
    const filled = consumed < filledForRole
    consumedByKey[key] = consumed + 1
    return {
      key,
      label: role.label,
      emoji: role.emoji,
      color: role.color,
      filled,
    }
  })

  const isSquadFull =
    availableRoles.length > 0 && availableRoles.every((r) => r.filled)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="card-interactive group relative flex flex-col cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
          <CardHeader className="gap-3 pb-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-lg font-bold text-foreground">
                    {team.name}
                  </h3>
                  {team.teamVibe && (
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${team.teamVibe.badgeColor ?? team.teamVibe.color}`}
                      title={team.teamVibe.label}
                    >
                      {team.teamVibe.emoji} {team.teamVibe.label}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm font-medium text-primary">
                  {team.jam}
                </p>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 rounded-full border-border/60 text-xs text-muted-foreground"
              >
                <Users className="mr-1 size-3" />
                {team.members}/{team.maxMembers}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 pt-3 flex-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Cpu className="size-3.5 text-lavender" />
                {team.engine}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe className="size-3.5 text-teal" />
                {team.language}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {team.description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${team.level.color}`}
              >
                {team.level.emoji} {team.level.label}
              </span>
              {availableRoles.map((role, index) => (
                <span
                  key={`${role.key}-${index}`}
                  className={[
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-opacity",
                    role.filled
                      ? "opacity-40 line-through bg-muted text-muted-foreground"
                      : role.color,
                  ].join(" ")}
                  title={role.filled ? `${role.label} — Filled` : `${role.label} — Open`}
                >
                  {role.emoji} {role.label}
                </span>
              ))}
            </div>
          </CardContent>

          <CardFooter>
            {isSquadFull ? (
              <div className="w-full flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/50 px-4 py-2.5 text-sm font-bold text-muted-foreground">
                <ShieldCheck className="size-4 text-primary" />
                SQUAD FULL
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

      <DialogContent className="max-w-lg rounded-2xl border-border/60 bg-card p-0 shadow-2xl shadow-teal/10 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 space-y-1 text-left border-b border-border/60">
          <DialogTitle className="text-xl font-bold text-foreground">
            {team.name}
          </DialogTitle>
          <p className="text-sm font-medium text-primary">{team.jam}</p>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6 py-4">
          <div className="flex flex-col gap-4 pr-4">
            {/* Badges Engine, Language, Level, Jam Style */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1.5 rounded-full border-border/60 bg-lavender/10 px-3 py-1 text-xs font-semibold text-lavender"
              >
                <Cpu className="size-3.5" />
                {team.engine}
              </Badge>
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1.5 rounded-full border-border/60 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal"
              >
                <Globe className="size-3.5" />
                {team.language}
              </Badge>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${team.level.color}`}
              >
                {team.level.emoji} {team.level.label}
              </span>
              {team.teamVibe && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${team.teamVibe.color}`}
                >
                  {team.teamVibe.emoji} {team.teamVibe.label}
                </span>
              )}
            </div>

            {/* Full description */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">
                Description
              </h4>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {team.description}
              </p>
            </div>

            {/* Roles sought */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">
                Roles sought
              </h4>
              <ul className="space-y-2">
                {availableRoles.map((role, index) => (
                  <li
                    key={`${role.key}-${index}`}
                    className={[
                      "flex items-center gap-2 rounded-lg border border-border/40 px-3 py-2 text-sm transition-colors",
                      role.filled
                        ? "bg-muted/50 opacity-60"
                        : "bg-secondary/30",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                        role.filled ? "opacity-40" : role.color,
                      ].join(" ")}
                    >
                      {role.emoji} {role.label}
                    </span>
                    {role.filled && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        Filled
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {availableRoles.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  No role specified
                </p>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer with Apply button */}
        <div className="border-t border-border/60 px-6 py-4 bg-muted/20">
          {isSquadFull ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/50 px-4 py-3 text-sm font-bold text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Team full
            </div>
          ) : (
            <JoinTeamModal
              teamId={team.id}
              teamName={team.name}
              availableRoles={availableRoles}
              ownerUserId={team.user_id}
            >
              <Button className="w-full gap-2 rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/85 hover:gap-3">
                Apply
                <ArrowRight className="size-4" />
              </Button>
            </JoinTeamModal>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
