"use client"

import { Sparkles, Users, Sword } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Dot-pattern background (same as landing-hero)
const DOT_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%2394a3b8' fill-opacity='0.35'/%3E%3C/svg%3E")`

export function Hero() {
  return (
    <section
      className="relative overflow-hidden px-4 pb-8 pt-16 lg:px-6 lg:pt-24 lg:pb-12"
      style={{ backgroundImage: DOT_PATTERN, backgroundColor: "var(--background)" }}
    >
      <div className="relative mx-auto max-w-2xl text-center">
        {/* Neo-brutalist badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-4 py-1.5 text-sm font-bold text-foreground shadow-[3px_3px_0px_0px_var(--neo-shadow)]">
          <Sword className="size-4 text-teal" />
          Browse teams looking for members
        </div>

        <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Find Your Game Jam <span className="text-teal">Squad</span>
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
          Connect with developers, artists, and designers. Build amazing games together in your next jam.
        </p>

        <div className="mt-8">
          <Button
            asChild
            size="lg"
            className="h-14 min-w-[220px] rounded-lg border-2 border-foreground bg-teal px-8 text-base font-extrabold text-white shadow-[4px_4px_0px_0px_var(--neo-shadow)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--neo-shadow)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_var(--neo-shadow)]"
          >
            <Link href="/create-team">
              <Users className="mr-2 size-5" />
              Create a Squad
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
