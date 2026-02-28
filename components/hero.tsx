"use client"

import { Search, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function Hero() {
  const [query, setQuery] = useState("")

  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-16 lg:px-6 lg:pt-24 lg:pb-12">
      {/* Decorative background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-0 top-1/2 size-[400px] -translate-y-1/2 rounded-full bg-pink/20 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="size-4" />
          Over 200 teams looking for members right now
        </div>

        <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Find your perfect{" "}
          <span className="text-primary">Game Jam</span>{" "}
          Team
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
          Connect with talented devs, artists, and audio wizards. Form your
          dream team and build something amazing together.
        </p>

        <div className="relative mx-auto mt-10 max-w-xl">
          <div className="absolute inset-0 -m-1 rounded-[1.25rem] bg-primary/20 blur-md" />
          <div className="relative flex items-center overflow-hidden rounded-2xl border-2 border-primary/30 bg-card shadow-lg shadow-primary/5">
            <Search className="ml-5 size-5 shrink-0 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search teams, jams, or roles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-14 border-0 bg-transparent px-4 text-base shadow-none ring-0 placeholder:text-muted-foreground focus-visible:ring-0"
            />
            <button className="mr-2 shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/85">
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
