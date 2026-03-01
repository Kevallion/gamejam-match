import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
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
  name: string
  jam: string
  engine: string
  language: string
  description: string
  members: number
  maxMembers: number
  roles: RoleBadge[]
  level: LevelBadge
  filledRoleKeys?: string[]
}

export function TeamCard({ team }: { team: TeamCardData }) {
  const filledKeys = team.filledRoleKeys ?? []

  const availableRoles = team.roles.map((role) => ({
    key: role.key ?? role.label.toLowerCase().replace(/\s+/g, "-"),
    label: role.label,
    emoji: role.emoji,
    color: role.color,
    filled: filledKeys.includes(role.key ?? role.label.toLowerCase().replace(/\s+/g, "-")),
  }))

  const isSquadFull =
    availableRoles.length > 0 && availableRoles.every((r) => r.filled)

  return (
    <Card className="card-interactive group relative flex flex-col">
      <CardHeader className="gap-3 pb-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-foreground">
              {team.name}
            </h3>
            <p className="mt-0.5 text-sm font-medium text-primary">
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
          <JoinTeamModal
            teamId={team.id}
            teamName={team.name}
            availableRoles={availableRoles}
          >
            <Button className="w-full gap-2 rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/85 hover:gap-3">
              Join Team
              <ArrowRight className="size-4" />
            </Button>
          </JoinTeamModal>
        )}
      </CardFooter>
    </Card>
  )
}
