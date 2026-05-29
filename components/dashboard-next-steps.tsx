"use client"

import Link from "next/link"
import { CheckCircle2, Circle, Link2, MessageSquareText, PenLine, Users2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DashboardNextStep = {
  id: string
  label: string
  done: boolean
  href: string
  action: string
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
      href: "/teams",
      action: "Browse squads",
    },
    {
      id: "availability",
      label: "Publish your availability post",
      done: hasAvailability,
      href: "/create-profile",
      action: "Post availability",
    },
    {
      id: "discord",
      label: "Add your Discord username",
      done: hasDiscord,
      href: "/dashboard?tab=settings",
      action: "Open settings",
    },
    {
      id: "portfolio",
      label: "Add your portfolio link",
      done: hasPortfolio,
      href: "/dashboard?tab=settings",
      action: "Update profile",
    },
    {
      id: "inbox",
      label: "Review your inbox activity",
      done: hasInboxActivity,
      href: "/dashboard?tab=inbox",
      action: "Open inbox",
    },
  ]

  const completed = steps.filter((step) => step.done).length
  const progress = Math.round((completed / steps.length) * 100)

  return (
    <Card className="glass-card border-lavender/20 bg-lavender/5">
      <CardHeader className="space-y-2 pb-0">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-foreground">Next 5 steps</h3>
          <span className="text-xs font-semibold text-muted-foreground">
            {completed}/{steps.length}
          </span>
        </div>
        <Progress value={progress} className="h-1.5 rounded-full bg-secondary/70" />
      </CardHeader>
      <CardContent className="space-y-2.5 pt-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border px-3 py-2",
              step.done ? "border-teal/25 bg-teal/10" : "border-border/50 bg-card/40",
            )}
          >
            <div className="flex items-center gap-2">
              {step.done ? (
                <CheckCircle2 className="size-4 text-teal" />
              ) : (
                <Circle className="size-4 text-muted-foreground" />
              )}
              <p
                className={cn(
                  "text-sm",
                  step.done ? "text-foreground/90" : "text-muted-foreground",
                )}
              >
                {step.label}
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg px-2 text-xs">
              <Link href={step.href}>{step.action}</Link>
            </Button>
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
          <Users2 className="size-3.5 text-teal" />
          <span>Build trust faster by completing your profile setup.</span>
          <MessageSquareText className="size-3.5 text-lavender" />
          <PenLine className="size-3.5 text-pink" />
          <Link2 className="size-3.5 text-peach" />
        </div>
      </CardContent>
    </Card>
  )
}
