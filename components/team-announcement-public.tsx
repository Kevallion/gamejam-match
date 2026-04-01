"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { JoinTeamModal } from "@/components/join-team-modal"
import { JamTitleBlock, type TeamCardData } from "@/components/team-card"
import { ArrowLeft, ArrowRight, Cpu, Globe, ShieldCheck } from "lucide-react"

type RoleOption = { key: string; label: string; emoji: string; color: string; filled?: boolean }

function computeAvailableRoles(team: TeamCardData): RoleOption[] {
  const filledKeys = team.filledRoleKeys ?? []
  const filledCountByKey: Record<string, number> = {}
  for (const key of filledKeys) {
    filledCountByKey[key] = (filledCountByKey[key] ?? 0) + 1
  }
  const consumedByKey: Record<string, number> = {}
  return team.roles.map((role) => {
    const key = role.key ?? role.label.toLowerCase().replace(/\s+/g, "-")
    const filledForRole = filledCountByKey[key] ?? 0
    const consumed = consumedByKey[key] ?? 0
    const filled = consumed < filledForRole
    consumedByKey[key] = consumed + 1
    return {
      key,
      label: role.label,
      emoji: role.emoji,
      color: role.color,
      filled,
    }
  })
}

interface TeamAnnouncementPublicProps {
  team: TeamCardData
  isLoggedIn: boolean
}

export function TeamAnnouncementPublic({ team, isLoggedIn }: TeamAnnouncementPublicProps) {
  const availableRoles = computeAvailableRoles(team)
  const isSquadFull =
    availableRoles.length > 0 && availableRoles.every((r) => r.filled)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-4 py-8 lg:px-6 lg:py-12">
        <div className="mx-auto max-w-lg">
          <Button
            asChild
            variant="ghost"
            className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
          >
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="rounded-2xl border border-border/60 bg-card shadow-xl shadow-teal/10 overflow-hidden">
            <div className="border-b border-border/60 px-6 pt-6 pb-4 space-y-1">
              <h1 className="text-xl font-bold text-foreground">{team.name}</h1>
              <JamTitleBlock team={team} className="text-sm font-medium text-primary" />
            </div>

            <div className="flex flex-col gap-4 px-6 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="inline-flex items-center gap-1.5 rounded-full border-border/60 bg-lavender px-3 py-1 text-xs font-semibold text-lavender-foreground"
                >
                  <Cpu className="size-3.5" />
                  {team.engine}
                </Badge>
                <Badge
                  variant="outline"
                  className="inline-flex items-center gap-1.5 rounded-full border-border/60 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal"
                >
                  <Globe className="size-3.5" />
                  {team.language}
                </Badge>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${team.level.color}`}
                >
                  {team.level.emoji} {team.level.label}
                </span>
                {team.teamVibe && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${team.teamVibe.color}`}
                  >
                    {team.teamVibe.emoji} {team.teamVibe.label}
                  </span>
                )}
              </div>

              <div>
                <h2 className="mb-2 text-sm font-semibold text-foreground">
                  Description
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {team.description}
                </p>
              </div>

              <div>
                <h2 className="mb-2 text-sm font-semibold text-foreground">
                  Roles sought
                </h2>
                <ul className="space-y-2">
                  {availableRoles.map((role, index) => (
                    <li
                      key={`${role.key}-${index}`}
                      className={[
                        "flex items-center gap-2 rounded-lg border border-border/40 px-3 py-2 text-sm transition-colors",
                        role.filled
                          ? "bg-muted/50 opacity-60"
                          : "bg-secondary/30",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                          role.filled ? "opacity-40" : role.color,
                        ].join(" ")}
                      >
                        {role.emoji} {role.label}
                      </span>
                      {role.filled && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          Filled
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                {availableRoles.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No role specified
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-border/60 px-6 py-4 bg-muted/20">
              {isSquadFull ? (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/50 px-4 py-3 text-sm font-bold text-muted-foreground">
                  <ShieldCheck className="size-4 text-primary" />
                  Team full
                </div>
              ) : !isLoggedIn ? (
                <Button asChild className="w-full gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/85">
                  <Link href="/">Sign in to apply</Link>
                </Button>
              ) : (
                <JoinTeamModal
                  teamId={team.id}
                  teamName={team.name}
                  availableRoles={availableRoles}
                  ownerUserId={team.user_id}
                >
                  <Button className="w-full gap-2 rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/85 hover:gap-3">
                    Apply
                    <ArrowRight className="size-4" />
                  </Button>
                </JoinTeamModal>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
