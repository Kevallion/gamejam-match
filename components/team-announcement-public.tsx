"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { JoinTeamModal } from "@/components/join-team-modal"
import { AuthModal } from "@/components/auth-modal"
import { JamTitleBlock, type TeamCardData } from "@/components/team-card"
import { JamStatusBadge } from "@/components/jam-status-badge"
import { UserAvatar } from "@/components/user-avatar"
import { engineOptionLabel, languageOptionLabel } from "@/lib/constants"
import { TagIcon } from "@/components/tag-icon"
import { getJamListingStatus } from "@/lib/jam-calendar-status"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight, Share2, CircleCheck } from "lucide-react"

type RoleOption = { key: string; label: string; color: string; filled?: boolean }

export type PublicRosterMember = {
  userId: string
  username: string
  avatarUrl: string | null
  isCaptain: boolean
}

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
      color: role.color,
      filled,
    }
  })
}

function formatJamDate(iso?: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (!Number.isFinite(date.getTime())) return null
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

interface TeamAnnouncementPublicProps {
  team: TeamCardData
  isLoggedIn: boolean
  roster?: PublicRosterMember[]
}

export function TeamAnnouncementPublic({
  team,
  isLoggedIn,
  roster = [],
}: TeamAnnouncementPublicProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  // Returning from sign-in with ?apply=1: reopen the application modal, then clean the URL.
  const [applyIntent] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("apply") === "1",
  )
  useEffect(() => {
    if (!applyIntent) return
    const url = new URL(window.location.href)
    url.searchParams.delete("apply")
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`)
  }, [applyIntent])
  const availableRoles = computeAvailableRoles(team)
  const engineLabel = engineOptionLabel(team.engine)
  const languageLabel = languageOptionLabel(team.language)
  const isSquadFull =
    availableRoles.length > 0 && availableRoles.every((role) => role.filled)
  const openSpots = Math.max(0, team.maxMembers - team.members)
  const fillRatio = team.maxMembers > 0 ? Math.min(100, (team.members / team.maxMembers) * 100) : 0
  const jamStatus = getJamListingStatus(team.jamStartDate, team.jamEndDate, {
    createdAtIso: team.createdAt,
  })
  const startLabel = jamStatus?.phase === "dates_pending" ? null : formatJamDate(team.jamStartDate)
  const endLabel = formatJamDate(team.jamEndDate)

  async function handleShare() {
    const openRoleLabels =
      availableRoles.filter((role) => !role.filled).map((role) => role.label).join(", ") || "members"
    const text = `Check out ${team.name} on GameJamCrew! They are looking for: ${openRoleLabels}.`
    const url = `${window.location.origin}/teams/${team.id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: team.name, text, url })
        toast.success("Shared!")
        return
      }
      throw new Error("Share not supported")
    } catch {
      try {
        await navigator.clipboard.writeText(`${text} ${url}`)
        toast.success("Link copied to clipboard!")
      } catch {
        toast.error("Could not share this squad.")
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-4 pb-12 pt-8 lg:px-6 lg:pb-16 lg:pt-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between gap-3">
            <Button
              asChild
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Link href="/teams">
                <ArrowLeft className="size-4" />
                All squads
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl"
              onClick={() => void handleShare()}
            >
              <Share2 className="size-4" />
              Share
            </Button>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <article className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl shadow-teal/10">
              <div className="space-y-2 border-b border-border/60 px-6 pb-4 pt-6">
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">{team.name}</h1>
                <JamTitleBlock team={team} className="text-sm font-medium text-primary" />
                {jamStatus ? <JamStatusBadge status={jamStatus} /> : null}
              </div>

              <div className="flex flex-col gap-5 px-6 py-5">
                <div>
                  <h2 className="mb-2 text-sm font-semibold text-foreground">Description</h2>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {team.description || "No description yet."}
                  </p>
                </div>

                <div>
                  <h2 className="mb-2 text-sm font-semibold text-foreground">Roles sought</h2>
                  {availableRoles.length === 0 ? (
                    <p className="text-sm italic text-muted-foreground">No role specified</p>
                  ) : (
                    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {availableRoles.map((role, index) => (
                        <li
                          key={`${role.key}-${index}`}
                          className={[
                            "flex items-center justify-between gap-2 rounded-xl border border-border/40 px-3 py-2 text-sm",
                            role.filled ? "bg-muted/50 opacity-60" : "bg-secondary/30",
                          ].join(" ")}
                        >
                          <TagIcon
                            kind="role"
                            value={role.key}
                            size="md"
                            showLabel
                            className={role.filled ? "opacity-40" : undefined}
                          />
                          {role.filled ? (
                            <span className="text-xs text-muted-foreground">Filled</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </article>

            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {openSpots} open spot{openSpots === 1 ? "" : "s"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {team.members}/{team.maxMembers} filled
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-teal" style={{ width: `${fillRatio}%` }} />
                  </div>
                </div>

                {(startLabel || endLabel) && (
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {startLabel ? <p>Starts {startLabel}</p> : null}
                    {endLabel ? <p>Ends {endLabel}</p> : null}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {engineLabel ? <TagIcon kind="engine" value={team.engine} size="md" showLabel /> : null}
                  {languageLabel ? (
                    <TagIcon kind="language" value={team.language} size="md" showLabel />
                  ) : null}
                  {team.level.key ? <TagIcon kind="level" value={team.level.key} size="md" showLabel /> : null}
                  {team.teamVibe?.key ? (
                    <TagIcon kind="style" value={team.teamVibe.key} size="md" showLabel />
                  ) : null}
                </div>

                {roster.length > 0 ? (
                  <div>
                    <h2 className="mb-2 text-sm font-semibold text-foreground">Squad</h2>
                    <ul className="space-y-2">
                      {roster.map((member) => (
                        <li key={member.userId}>
                          <Link
                            href={`/jammer/${member.userId}`}
                            className="flex items-center gap-2 rounded-xl px-1 py-1 hover:bg-secondary/40"
                          >
                            <UserAvatar
                              src={member.avatarUrl}
                              fallbackName={member.username}
                              size="sm"
                            />
                            <span className="min-w-0 truncate text-sm font-medium text-foreground">
                              {member.username}
                            </span>
                            {member.isCaptain ? (
                              <span className="ml-auto text-xs font-semibold text-teal">Captain</span>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {isSquadFull ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/50 px-4 py-3 text-sm font-bold text-muted-foreground">
                    <CircleCheck className="size-4 text-primary" />
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
                    autoOpen={applyIntent}
                  >
                    <Button className="w-full gap-2 rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/85 active:scale-[0.98]">
                      Apply
                      <ArrowRight className="size-4" />
                    </Button>
                  </JoinTeamModal>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        next={`/teams/${team.id}?apply=1`}
      />
    </div>
  )
}
