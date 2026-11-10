"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AppIcon } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

type DashboardNextStep = {
  id: string
  label: string
  done: boolean
  href: string
  action: string
  icon: LucideIcon
}

export function DashboardNextSteps({
  hasTeam,
  hasAvailability,
  hasDiscord,
  hasPortfolio,
  hasInboxActivity,
  showSquadEmptyRow = false,
}: {
  hasTeam: boolean
  hasAvailability: boolean
  hasDiscord: boolean
  hasPortfolio: boolean
  hasInboxActivity: boolean
  /** When true, show the no-squad row even if all checklist tasks are done. */
  showSquadEmptyRow?: boolean
}) {
  const steps: DashboardNextStep[] = [
    {
      id: "team",
      label: "Create or join a squad",
      done: hasTeam,
      href: hasTeam ? "/teams" : "/create-team",
      action: hasTeam ? "Browse squads" : "Create a Squad",
      icon: hasTeam ? ICON.squad : ICON.create,
    },
    {
      id: "availability",
      label: "Publish your availability post",
      done: hasAvailability,
      href: "/create-profile",
      action: "Post Availability",
      icon: ICON.available,
    },
    {
      id: "discord",
      label: "Add your Discord username",
      done: hasDiscord,
      href: "/dashboard?tab=settings",
      action: "Open settings",
      icon: ICON.note,
    },
    {
      id: "portfolio",
      label: "Add your portfolio link",
      done: hasPortfolio,
      href: "/dashboard?tab=settings",
      action: "Update profile",
      icon: ICON.link,
    },
    {
      id: "inbox",
      label: "Review your inbox activity",
      done: hasInboxActivity,
      href: "/dashboard?tab=inbox",
      action: "Open inbox",
      icon: ICON.applications,
    },
  ]

  const completed = steps.filter((step) => step.done).length
  const allDone = completed >= steps.length
  if (allDone && !showSquadEmptyRow) return null

  const progress = Math.round((completed / steps.length) * 100)

  return (
    <Card className="min-w-0 max-w-full border-lavender/20 bg-lavender/5">
      {!allDone ? (
        <CardHeader className="min-w-0 space-y-2 p-4 pb-0">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <h3 className="min-w-0 text-sm font-bold text-foreground">Get started</h3>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">
              {completed}/{steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-1.5 rounded-full bg-secondary/70" />
        </CardHeader>
      ) : null}
      <CardContent className={cn("min-w-0 p-4", !allDone && "pt-2")}>
        {!allDone ? (
          <ul className="divide-y divide-border/40">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <li key={step.id}>
                  <Link
                    href={step.href}
                    className="flex h-10 items-center gap-3 rounded-lg px-1 hover:bg-lavender/5"
                  >
                    {step.done ? (
                      <AppIcon icon={ICON.done} size="sm" tone="teal" />
                    ) : (
                      <span
                        className="size-4 shrink-0 rounded-full border-2 border-muted-foreground/50"
                        aria-hidden
                      />
                    )}
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-sm font-medium",
                        step.done ? "text-foreground/90" : "text-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary">
                      <AppIcon icon={Icon} size="sm" tone="primary" />
                      <span className="hidden sm:inline">{step.action}</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : null}

        {showSquadEmptyRow ? (
          <div
            className={cn(
              "flex h-14 items-center gap-3 px-1",
              !allDone && "mt-2 border-t border-border/40",
            )}
          >
            <span className="hidden size-8 shrink-0 items-center justify-center rounded-lg bg-teal/15 text-teal sm:flex">
              <AppIcon icon={ICON.squad} size="sm" tone="teal" />
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-muted-foreground">
              You are not in a squad yet
            </p>
            <Link
              href="/teams"
              className="inline-flex h-9 shrink-0 items-center rounded-lg bg-teal px-3 text-sm font-semibold text-teal-foreground hover:bg-teal/90"
            >
              Browse squads
            </Link>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
