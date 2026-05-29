"use client"

import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { LandingHero } from "@/components/landing/landing-hero"
import { cn } from "@/lib/utils"

export type LandingFeaturedTeam = {
  id: string
  name: string
  jam: string
  openRoles: number
}

export type LandingSocialProofStats = {
  activeTeams: number
  completedTeams: number
  activeJammers: number
}

export type LandingUpcomingJam = {
  id: string
  title: string
  url: string | null
  startsAt: string
}

function BelowFoldSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("w-full space-y-1", className)}
      aria-hidden
    >
      <div className="h-[min(520px,85vh)] animate-pulse rounded-none bg-muted/25" />
      <div className="h-80 animate-pulse bg-muted/20" />
      <div className="h-96 animate-pulse bg-muted/25" />
      <div className="h-72 animate-pulse bg-muted/20" />
    </div>
  )
}

const LandingBelowFold = dynamic(
  () =>
    import("@/components/landing/landing-below-fold").then((m) => ({
      default: m.LandingBelowFold,
    })),
  {
    ssr: true,
    loading: () => <BelowFoldSkeleton />,
  },
)

export function LandingHome({
  featuredTeams = [],
  socialProofStats,
  upcomingJams = [],
}: {
  featuredTeams?: LandingFeaturedTeam[]
  socialProofStats: LandingSocialProofStats
  upcomingJams?: LandingUpcomingJam[]
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <LandingHero
          featuredTeams={featuredTeams}
          socialProofStats={socialProofStats}
          upcomingJams={upcomingJams}
        />
        <LandingBelowFold />
      </main>
    </div>
  )
}
