import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Cpu, Mail, Globe } from "lucide-react"

export type PlayerCardData = {
  id: number
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
}

export function PlayerCard({ player }: { player: PlayerCardData }) {
  return (
    <Card className="group relative flex flex-col rounded-2xl border-border/50 bg-card transition-all duration-300 hover:border-lavender/30 hover:shadow-lg hover:shadow-lavender/5">
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

        {/* Role badge */}
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

      <CardFooter>
        <Button className="w-full gap-2 rounded-xl bg-lavender text-lavender-foreground transition-all hover:bg-lavender/85 hover:gap-3">
          <Mail className="size-4" />
          Invite to Team
        </Button>
      </CardFooter>
    </Card>
  )
}
