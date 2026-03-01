import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Globe, Cpu, Users, ArrowRight } from "lucide-react"

// ON IMPORTE LE NOUVEAU COMPOSANT ICI
import { JoinTeamModal } from "@/components/join-team-modal"

type RoleBadge = {
  label: string
  emoji: string
  color: string
}

type LevelBadge = {
  label: string
  emoji: string
  color: string
}

export type TeamCardData = {
  id: number
  name: string
  jam: string
  engine: string
  language: string
  description: string
  members: number
  maxMembers: number
  roles: RoleBadge[]
  level: LevelBadge
}

export function TeamCard({ team }: { team: TeamCardData }) {
  return (
    <Card className="group relative rounded-2xl border-border/50 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
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

      <CardContent className="gap-4 pt-3">
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

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {team.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${team.level.color}`}
          >
            {team.level.emoji} {team.level.label}
          </span>
          {team.roles.map((role) => (
            <span
              key={role.label}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${role.color}`}
            >
              {role.emoji} {role.label}
            </span>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        {/* ET ON ENTOURE LE BOUTON AVEC LE MODAL ICI */}
        <JoinTeamModal teamId={team.id} teamName={team.name}>
          <Button className="w-full gap-2 rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/85 hover:gap-3">
            Join Team
            <ArrowRight className="size-4" />
          </Button>
        </JoinTeamModal>
      </CardFooter>
    </Card>
  )
}