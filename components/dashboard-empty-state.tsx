"use client"

import { Search, Users, Sparkles, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function DashboardEmptyState() {
  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Gamification Badge */}
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="border-teal/30 bg-teal/10 px-4 py-1.5 text-sm font-medium text-teal"
        >
          <Sparkles className="mr-1.5 size-3.5" />
          Step 1: Select your path to discover teams and developers
        </Badge>
      </div>

      {/* Two Cards Container */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card 1: Looking for a Team */}
        <Card className="card-interactive group relative overflow-hidden border-2 border-teal/20 bg-gradient-to-br from-card via-card to-teal/5">
          {/* Decorative glow effect */}
          <div className="pointer-events-none absolute -right-20 -top-20 size-40 rounded-full bg-teal/10 blur-3xl transition-all duration-500 group-hover:bg-teal/20" />
          
          <CardContent className="relative flex flex-col items-center gap-6 p-8 text-center">
            {/* Icon Container */}
            <div className="flex size-16 items-center justify-center rounded-2xl bg-teal/15 text-teal ring-4 ring-teal/10 transition-transform duration-300 group-hover:scale-110">
              <Search className="size-8" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              I&apos;m looking for a team
            </h3>

            {/* Description */}
            <p className="text-sm leading-relaxed text-muted-foreground">
              Post your availability so teams can invite you directly.
            </p>

            {/* Primary CTA Button */}
            <Button asChild className="mt-2 w-full gap-2 bg-teal text-teal-foreground hover:bg-teal/90">
              <Link href="/create-profile">
                Post Availability
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: Looking for Members */}
        <Card className="card-interactive group relative overflow-hidden border-2 border-pink/20 bg-gradient-to-br from-card via-card to-pink/5">
          {/* Decorative glow effect */}
          <div className="pointer-events-none absolute -right-20 -top-20 size-40 rounded-full bg-pink/10 blur-3xl transition-all duration-500 group-hover:bg-pink/20" />
          
          <CardContent className="relative flex flex-col items-center gap-6 p-8 text-center">
            {/* Icon Container */}
            <div className="flex size-16 items-center justify-center rounded-2xl bg-pink/15 text-pink ring-4 ring-pink/10 transition-transform duration-300 group-hover:scale-110">
              <Users className="size-8" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              I want to create a team
            </h3>

            {/* Description */}
            <p className="text-sm leading-relaxed text-muted-foreground">
              Start a squad and recruit available developers and artists.
            </p>

            {/* Secondary/Outline CTA Button */}
            <Button asChild variant="outline" className="mt-2 w-full gap-2 border-pink/30 text-pink hover:border-pink/50 hover:bg-pink/10 hover:text-pink">
              <Link href="/create-team">
                Create a Team
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
