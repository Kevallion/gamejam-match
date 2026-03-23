"use client"

import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { LandingHero } from "@/components/landing/landing-hero"
import { cn } from "@/lib/utils"

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

export function LandingHome() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <LandingHero />
        <LandingBelowFold />
      </main>
    </div>
  )
}
