"use client"

import { UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative px-4 pb-8 pt-16 lg:px-6 lg:pb-12 lg:pt-24">
      <div className="relative mx-auto max-w-2xl text-center">
        <h1 className="text-balance font-display text-4xl font-extrabold tracking-tight text-foreground">
          Find your game jam squad
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
          Connect with developers, artists, and designers. Build amazing games together in your next jam.
        </p>

        <div className="mt-8">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-lg border-2 border-foreground bg-primary px-8 text-base font-bold text-primary-foreground shadow-[3px_3px_0_0_var(--neo-shadow)] transition-transform hover:-translate-y-0.5 motion-reduce:transform-none"
          >
            <Link href="/create-team">
              <UsersRound className="size-5" />
              Create a Squad
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
