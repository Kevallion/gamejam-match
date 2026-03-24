"use client"

import { Sparkles, Users, Gamepad2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-6 pt-12 md:pb-8 md:pt-16 lg:px-6 lg:pt-20 lg:pb-10">
      {/* Background gradient effects */}
      <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
        <div className="absolute left-1/2 top-0 size-[500px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/25 blur-[100px]" />
        <div className="absolute right-0 top-1/2 size-[300px] -translate-y-1/2 rounded-full bg-accent/20 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        {/* Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary md:mb-5 md:px-4 md:py-1.5 md:text-sm">
          <Gamepad2 className="size-3.5 md:size-4" />
          <span>Find your next game jam team</span>
        </div>

        {/* Heading */}
        <h1 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl">
          Find Your Game Jam{" "}
          <span className="bg-gradient-to-r from-primary via-teal to-primary bg-clip-text text-transparent">
            Squad
          </span>
        </h1>

        {/* Subheading */}
        <p className="mx-auto mt-3 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground md:mt-4 md:text-base lg:text-lg">
          Connect with developers, artists, and designers. Build amazing games together.
        </p>

        {/* CTA */}
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:mt-8">
          <Button
            asChild
            size="lg"
            className="h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 md:h-12 md:px-8 md:text-base"
          >
            <Link href="/create-team">
              <Users className="size-4 md:size-5" />
              Create a Squad
            </Link>
          </Button>
          <span className="text-xs text-muted-foreground">
            or browse teams below
          </span>
        </div>
      </div>
    </section>
  )
}
