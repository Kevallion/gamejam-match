"use client"

import Link from "next/link"
import { ArrowRight, Plus, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function DashboardEmptyState() {
  return (
    <section className="min-w-0 space-y-3" aria-labelledby="choose-your-path-heading">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Find your people</p>
        <h3 id="choose-your-path-heading" className="text-base font-bold text-foreground">
          Choose your path
        </h3>
      </div>
      <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="min-w-0 border border-teal/30 bg-card shadow-sm">
          <CardContent className="flex min-h-[200px] min-w-0 flex-col items-start justify-between gap-4 p-6">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-teal/15 text-teal">
              <Search className="size-6" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <h4 className="text-lg font-bold tracking-tight text-foreground">I&apos;m looking for a team</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Browse open squads that match your skills.
              </p>
            </div>
            <Button asChild className="w-full bg-teal text-teal-foreground hover:bg-teal/90 sm:w-auto">
              <Link href="/teams">
                Find a squad
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="min-w-0 border border-pink/30 bg-card shadow-sm">
          <CardContent className="flex min-h-[200px] min-w-0 flex-col items-start justify-between gap-4 p-6">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-pink/15 text-pink">
              <Plus className="size-6" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <h4 className="text-lg font-bold tracking-tight text-foreground">I want to create a team</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Start a squad and invite your dream crew.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full border-pink/40 text-pink hover:bg-pink/10 hover:text-pink sm:w-auto"
            >
              <Link href="/create-team">
                Create a squad
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
