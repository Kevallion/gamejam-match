"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SmartRecommendedTeam } from "@/lib/queries"
import { cn } from "@/lib/utils"

type DashboardRecommendedTeamsProps = {
  teams: SmartRecommendedTeam[]
  className?: string
  compact?: boolean
}

export function DashboardRecommendedTeams({ teams, className, compact = false }: DashboardRecommendedTeamsProps) {
  if (teams.length === 0) return null

  return (
    <section
      className={cn(
        "glass-card rounded-2xl border border-border/40 p-4",
        compact ? "md:p-4" : "md:p-6",
        className,
      )}
      aria-labelledby="smart-matchmaking-heading"
    >
      <div className={cn("mb-4 flex items-center gap-3", compact ? "md:mb-4" : "md:mb-5")}>
        <div
          className={cn(
            "flex items-center justify-center rounded-xl bg-teal/15 shadow-[0_0_20px_-8px_var(--color-teal)]",
            compact ? "size-8" : "size-10",
          )}
        >
          <Sparkles className={cn("text-teal", compact ? "size-4" : "size-5")} aria-hidden />
        </div>
        <div>
          <h2
            id="smart-matchmaking-heading"
            className={cn("font-semibold tracking-tight", compact ? "text-sm md:text-base" : "text-lg md:text-xl")}
          >
            Smart Matchmaking
          </h2>
          <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>
            Open squads that need your default role.
          </p>
        </div>
      </div>

      <div className={cn("grid gap-3", compact ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3")}>
        {teams.map((t) => (
          <article
            key={t.id}
            className={cn(
              "flex flex-col justify-between rounded-xl border border-teal/35 bg-background/40",
              compact ? "gap-2.5 p-3" : "gap-4 p-4",
              "shadow-[0_0_24px_-10px_rgba(45,212,191,0.45)] dark:shadow-[0_0_28px_-10px_rgba(34,211,238,0.35)]",
            )}
          >
            <div className={cn("space-y-1.5 leading-relaxed text-foreground", compact ? "text-xs" : "text-sm md:text-[15px]")}>
              <p>
                The team <span className="font-semibold text-teal">{t.team_name}</span> is looking for a{" "}
                <span className="font-medium">{t.role_label}</span>.
              </p>
              <p className="text-muted-foreground">
                Engine on their listing:{" "}
                <span className="font-medium text-foreground">{t.team_engine_label}</span>
                {t.matches_your_engine ? (
                  <span className="mt-2 block w-fit rounded-full bg-teal/15 px-2.5 py-0.5 text-xs font-semibold text-teal">
                    Same engine as your profile
                  </span>
                ) : null}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className={cn(
                "w-full shrink-0 cursor-pointer border-teal/30 bg-teal/5 text-teal hover:bg-teal/10 hover:text-teal",
                compact ? "h-7 text-xs" : "",
              )}
            >
              <Link href={`/teams/${t.id}`}>Quick View</Link>
            </Button>
          </article>
        ))}
      </div>
    </section>
  )
}
