"use client"

import { JammerCard, type JammerCardData, type SquadOption } from "@/components/player-card"
import { cn } from "@/lib/utils"

type DirectoryCardProps = {
  player: JammerCardData
  mySquads: SquadOption[]
  className?: string
}

/** Find Members card: JammerCard dressed with the validated Bento / Settings card recipe. */
export function DirectoryCard({ player, mySquads, className }: DirectoryCardProps) {
  return (
    <JammerCard
      player={player}
      mySquads={mySquads}
      cardClassName={cn(
        "rounded-2xl border border-border bg-card text-card-foreground shadow-[3px_3px_0_0_var(--neo-shadow)]",
        className,
      )}
    />
  )
}
