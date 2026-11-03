"use client"

import Link from "next/link"
import { Check, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type DashboardNextStep = {
  id: string
  label: string
  done: boolean
  href: string
}

export function buildDashboardNextSteps({
  hasTeam,
  hasAvailability,
  hasDiscord,
  hasPortfolio,
  hasInboxActivity,
}: {
  hasTeam: boolean
  hasAvailability: boolean
  hasDiscord: boolean
  hasPortfolio: boolean
  hasInboxActivity: boolean
}): DashboardNextStep[] {
  return [
    { id: "team", label: "Join a squad", done: hasTeam, href: "/teams" },
    { id: "availability", label: "Post availability", done: hasAvailability, href: "/create-profile" },
    { id: "discord", label: "Add Discord", done: hasDiscord, href: "/dashboard?tab=settings" },
    { id: "portfolio", label: "Add portfolio", done: hasPortfolio, href: "/dashboard?tab=settings" },
    { id: "inbox", label: "Review inbox", done: hasInboxActivity, href: "/dashboard?tab=inbox" },
  ]
}

export function DashboardNextSteps(props: {
  hasTeam: boolean
  hasAvailability: boolean
  hasDiscord: boolean
  hasPortfolio: boolean
  hasInboxActivity: boolean
}) {
  const steps = buildDashboardNextSteps(props)
  const completed = steps.filter((step) => step.done).length

  return (
    <Card className="min-w-0 max-w-full border-border/60 bg-card shadow-sm">
      <CardHeader className="min-w-0 space-y-1 pb-0">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Keep moving</p>
            <h3 className="text-base font-bold text-foreground">Next steps</h3>
          </div>
          <span className="shrink-0 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-500">
            {completed}/{steps.length} complete
          </span>
        </div>
      </CardHeader>
      <CardContent className="min-w-0 pt-4">
        <ol className="grid min-w-0 gap-2 sm:grid-cols-2">
          {steps.map((step, index) => (
            <li key={step.id} className="min-w-0">
              <Link
                href={step.href}
                className={cn(
                  "flex min-h-11 min-w-0 items-center gap-3 rounded-xl border px-3 py-2 transition-colors motion-reduce:transition-none",
                  step.done
                    ? "border-teal/30 bg-teal/10 text-foreground"
                    : "border-border/60 bg-background/40 text-foreground hover:border-teal/40",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    step.done ? "bg-teal text-teal-foreground" : "bg-secondary text-muted-foreground",
                  )}
                  aria-hidden
                >
                  {step.done ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium">{step.label}</span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
