"use client"

import Link from "next/link"
import { CircleCheck, Circle, Compass, Hand, Inbox, Link2, MessageSquareText, Plus } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type DashboardNextStep = {
  id: string
  label: string
  done: boolean
  href: string
  action: string
  icon: typeof Plus
}

export function DashboardNextSteps({
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
}) {
  const steps: DashboardNextStep[] = [
    {
      id: "team",
      label: "Create or join a squad",
      done: hasTeam,
      href: hasTeam ? "/teams" : "/create-team",
      action: hasTeam ? "Browse squads" : "Create a Squad",
      icon: hasTeam ? Compass : Plus,
    },
    {
      id: "availability",
      label: "Publish your availability post",
      done: hasAvailability,
      href: "/create-profile",
      action: "Post Availability",
      icon: Hand,
    },
    {
      id: "discord",
      label: "Add your Discord username",
      done: hasDiscord,
      href: "/dashboard?tab=settings",
      action: "Open settings",
      icon: MessageSquareText,
    },
    {
      id: "portfolio",
      label: "Add your portfolio link",
      done: hasPortfolio,
      href: "/dashboard?tab=settings",
      action: "Update profile",
      icon: Link2,
    },
    {
      id: "inbox",
      label: "Review your inbox activity",
      done: hasInboxActivity,
      href: "/dashboard?tab=inbox",
      action: "Open inbox",
      icon: Inbox,
    },
  ]

  const completed = steps.filter((step) => step.done).length
  if (completed >= steps.length) return null

  const progress = Math.round((completed / steps.length) * 100)

  return (
    <Card className="glass-card min-w-0 max-w-full border-lavender/20 bg-lavender/5">
      <CardHeader className="min-w-0 space-y-2 pb-0">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <h3 className="min-w-0 text-sm font-bold text-foreground">Get started</h3>
          <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
            {completed}/{steps.length}
          </span>
        </div>
        <Progress value={progress} className="h-1.5 rounded-full bg-secondary/70" />
        <p className="text-xs text-muted-foreground">
          Pick a path: create a squad or post availability — then finish your profile.
        </p>
      </CardHeader>
      <CardContent className="min-w-0 pt-4">
        <div className="grid min-w-0 gap-2 md:grid-cols-2">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <Link
                key={step.id}
                href={step.href}
                className={cn(
                  "flex min-h-11 min-w-0 items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                  step.done
                    ? "border-teal/25 bg-teal/10"
                    : "border-border/50 bg-card/40 hover:border-lavender/40 hover:bg-lavender/5",
                )}
              >
                {step.done ? (
                  <CircleCheck className="size-4 shrink-0 text-teal" aria-hidden />
                ) : (
                  <Circle className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                )}
                <span
                  className={cn(
                    "min-w-0 flex-1 text-sm font-medium leading-snug",
                    step.done ? "text-foreground/90" : "text-foreground",
                  )}
                >
                  {step.label}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
                  <Icon className="size-3.5" aria-hidden />
                  <span className="hidden sm:inline">{step.action}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
