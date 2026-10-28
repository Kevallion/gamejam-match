"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { JoinTeamModal } from "@/components/join-team-modal"
import { AuthModal } from "@/components/auth-modal"
import { JamTitleBlock, type TeamCardData } from "@/components/team-card"
import { engineOptionLabel, languageOptionLabel } from "@/lib/constants"
import { TagIcon } from "@/components/tag-icon"
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react"

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
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const availableRoles = computeAvailableRoles(team)
  const engineLabel = engineOptionLabel(team.engine)
  const languageLabel = languageOptionLabel(team.language)
  const isSquadFull =
    availableRoles.length > 0 && availableRoles.every((r) => r.filled)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-4 pb-8 pt-8 lg:px-6 lg:pb-12 lg:pt-28">
        <div className="mx-auto max-w-lg">
          <Button
            asChild
            variant="ghost"
            className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
          >
            <Link href="/teams">
              <ArrowLeft className="size-4" />
              All squads
            </Link>
          </Button>

          <div className="rounded-2xl border border-border/60 bg-card shadow-xl shadow-teal/10 overflow-hidden">
            <div className="border-b border-border/60 px-6 pt-6 pb-4 space-y-1">
              <h1 className="text-xl font-bold text-foreground">{team.name}</h1>
              <JamTitleBlock team={team} className="text-sm font-medium text-primary" />
            </div>

            <div className="flex flex-col gap-4 px-6 py-4">
              <div className="flex flex-wrap items-center gap-2">
                {engineLabel ? <TagIcon kind="engine" value={team.engine} size="md" showLabel /> : null}
                {languageLabel ? <TagIcon kind="language" value={team.language} size="md" showLabel /> : null}
                {team.level.key ? <TagIcon kind="level" value={team.level.key} size="md" showLabel /> : null}
                {team.teamVibe?.key ? <TagIcon kind="style" value={team.teamVibe.key} size="md" showLabel /> : null}
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
                      <TagIcon
                        kind="role"
                        value={role.key}
                        size="md"
                        showLabel
                        className={role.filled ? "opacity-40" : undefined}
                      />
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
                  Squad full
                </div>
              ) : !isLoggedIn ? (
                <Button
                  type="button"
                  className="w-full gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/85"
                  onClick={() => setAuthModalOpen(true)}
                >
                  Sign in to apply
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
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  )
}
