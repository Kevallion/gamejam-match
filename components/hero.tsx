"use client"

import { Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-16 lg:px-6 lg:pt-24 lg:pb-12">
      <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
        <div className="absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-0 top-1/2 size-[400px] -translate-y-1/2 rounded-full bg-accent/20 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="size-4" />
          Browse teams looking for members
        </div>

        <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Find Your Game Jam <span className="text-primary">Squad</span>
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
          Connect with developers, artists, and designers. Build amazing games together in your next jam.
        </p>

        <div className="mt-8">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/30"
          >
            <Link href="/create-team">
              <Users className="size-5" />
              Create a Squad
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
