"use client"

import { Search, UsersRound, ArrowRight } from "lucide-react"
import { IconTile } from "@/components/ui/app-icon"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function DashboardEmptyState() {
  return (
    <div className="flex w-full min-w-0 max-w-6xl flex-col items-stretch gap-8 py-8 text-left">
      <Badge
        variant="outline"
        className="h-auto w-fit max-w-full shrink whitespace-normal border-teal/30 bg-teal/10 px-4 py-2 text-left text-base font-medium leading-snug text-teal"
      >
        Step 1: Select your path to discover teams and developers
      </Badge>

      <div className="grid w-full min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="card-interactive group relative min-w-0 overflow-hidden border border-border bg-card shadow-[3px_3px_0_0_var(--neo-shadow)]">
          <CardContent className="relative flex flex-col items-stretch gap-6 p-8 text-left sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-3">
              <IconTile
                icon={Search}
                tone="teal"
                className="ring-4 ring-teal/10 transition-transform duration-200 motion-reduce:transition-none motion-reduce:transform-none group-hover:scale-105"
              />
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                I&apos;m looking for a team
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Post your availability so teams can invite you directly.
              </p>
            </div>
            <Button asChild className="w-full shrink-0 gap-2 bg-teal text-teal-foreground hover:bg-teal/90 sm:w-auto">
              <Link href="/create-profile">
                Post Availability
                <ArrowRight className="size-4 transition-transform motion-reduce:transition-none group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-interactive group relative min-w-0 overflow-hidden border border-border bg-card shadow-[3px_3px_0_0_var(--neo-shadow)]">
          <CardContent className="relative flex flex-col items-stretch gap-6 p-8 text-left sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-3">
              <IconTile
                icon={UsersRound}
                tone="pink"
                className="ring-4 ring-pink/10 transition-transform duration-200 motion-reduce:transition-none motion-reduce:transform-none group-hover:scale-105"
              />
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                I want to create a team
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Start a squad and recruit available developers and artists.
              </p>
            </div>
            <Button asChild variant="outline" className="w-full shrink-0 gap-2 border-pink/30 text-pink hover:border-pink/50 hover:bg-pink/10 hover:text-pink sm:w-auto">
              <Link href="/create-team">
                Create a Squad
                <ArrowRight className="size-4 transition-transform motion-reduce:transition-none group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
