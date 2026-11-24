"use client"

import Link from "next/link"
import { BentoCard } from "@/components/dashboard/bento-card"
import { AppIcon } from "@/components/ui/app-icon"
import type { SmartRecommendedTeam } from "@/lib/queries"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"

type DashboardRecommendedTeamsProps = {
  teams: SmartRecommendedTeam[]
  /** False while the existing client fetch is still in flight. */
  ready?: boolean
  className?: string
  compact?: boolean
  headingId?: string
}

export function DashboardRecommendedTeams({
  teams,
  ready = true,
  className,
  compact = false,
  headingId = "recommended-squads-heading",
}: DashboardRecommendedTeamsProps) {
  const visible = teams.slice(0, compact ? 3 : 6)

  if (!ready) {
    return (
      <BentoCard
        tone="match"
        title="Recommended squads"
        icon={ICON.recommended}
        placeholder
        skeletonLines={compact ? 3 : 4}
        className={cn("min-h-[200px]", className)}
      />
    )
  }

  return (
    <BentoCard
      tone="match"
      title="Recommended squads"
      icon={ICON.recommended}
      className={cn("min-h-[200px]", className)}
    >
      <h2 id={headingId} className="sr-only">
        Recommended squads
      </h2>
      {visible.length === 0 ? (
        <div className="flex flex-1 flex-col">
          <p className="text-sm font-semibold text-muted-foreground">
            No recommended squads right now
          </p>
          <Link
            href="/teams"
            className="mt-3 inline-flex min-h-11 w-fit items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-extrabold shadow-[3px_3px_0_0_var(--neo-shadow)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Browse squads
            <AppIcon icon={ICON.navRight} size="sm" tone="muted" />
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {visible.map((team) => (
            <li
              key={team.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-background/40 p-3"
            >
              <p className={cn("leading-relaxed", compact ? "text-xs font-semibold" : "text-sm font-semibold")}>
                The squad <span className="font-extrabold text-foreground">{team.team_name}</span> is
                looking for a <span className="font-extrabold">{team.role_label}</span>.
              </p>
              <p className="text-xs font-semibold text-muted-foreground">
                Engine: <span className="text-foreground">{team.team_engine_label}</span>
                {team.matches_your_engine ? (
                  <span className="mt-1.5 block w-fit rounded-full bg-teal/15 px-2 py-0.5 text-[11px] font-extrabold text-teal">
                    Same engine as your profile
                  </span>
                ) : null}
              </p>
              <Link
                href={`/teams/${team.id}`}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border bg-card px-3 text-xs font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                View squad
              </Link>
            </li>
          ))}
        </ul>
      )}
    </BentoCard>
  )
}