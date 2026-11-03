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
    <Card className="glass-card min-w-0 max-w-full border-lavender/20 bg-lavender/5">
      <CardHeader className="min-w-0 space-y-2 pb-0">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <h3 className="min-w-0 text-sm font-bold text-foreground">Next 5 steps</h3>
          <span className="shrink-0 text-xs font-semibold text-muted-foreground">
            {completed}/{steps.length}
          </span>
        </div>
        <Progress value={progress} className="h-1.5 rounded-full bg-secondary/70" />
      </CardHeader>
      <CardContent className="min-w-0 space-y-2.5 pt-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              "flex min-w-0 flex-col gap-2 rounded-xl border px-3 py-2 min-[480px]:flex-row min-[480px]:flex-wrap min-[480px]:items-center min-[480px]:justify-between min-[480px]:gap-3",
              step.done ? "border-teal/25 bg-teal/10" : "border-border/50 bg-card/40",
            )}
          >
            <div className="flex min-w-0 items-start gap-2 min-[480px]:flex-1">
              {step.done ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal" />
              ) : (
                <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              )}
              <p
                className={cn(
                  "min-w-0 break-words text-sm",
                  step.done ? "text-foreground/90" : "text-muted-foreground",
                )}
              >
                {step.label}
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-8 w-full shrink-0 rounded-lg px-2 text-xs min-[480px]:w-auto">
              <Link href={step.href}>{step.action}</Link>
            </Button>
          </div>
        ))}
        <div className="flex min-w-0 flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
          <Users2 className="size-3.5 shrink-0 text-teal" />
          <span className="min-w-0 break-words">Build trust faster by completing your profile setup.</span>
          <MessageSquareText className="size-3.5 text-lavender" />
          <PenLine className="size-3.5 text-pink" />
          <Link2 className="size-3.5 text-peach" />
        </div>
      </CardContent>
    </Card>
  )
}
