"use client"

import { useEffect, useMemo, useState } from "react"
import { sendTeamInvitation } from "@/app/actions/invite-actions"
import { showGamificationRewards } from "@/components/gamification-reward-toasts"
import { gamificationRewardHasToast } from "@/lib/gamification-reward-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserAvatar } from "@/components/user-avatar"
import {
  ENGINE_OPTIONS,
  EXPERIENCE_STYLES,
  LANGUAGE_OPTIONS,
  ROLE_STYLES,
} from "@/lib/constants"
import { getSuggestedPlayers, type SuggestedPlayer } from "@/lib/matchmaking"
import { supabase } from "@/lib/supabase"
import {
  Cpu,
  Globe,
  Link2,
  Loader2,
  MessageCircle,
  PenLine,
  Rocket,
  Send,
  Settings,
  Sparkles,
  UserMinus,
  Users,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  getJamListingStatus,
  isJamStartBackfilledWithCreatedAt,
} from "@/lib/jam-calendar-status"

export type TeamData = {
  id: string
  name: string
  jam: string
  engine: string
  language: string
  description: string
  members: number
  maxMembers: number
  roles: { label: string; emoji: string; color: string }[]
  /** Clés de rôle brutes depuis `teams.looking_for` (ex. developer, 2d-artist) pour le matchmaking */
  lookingForRoleKeys: string[]
  level: { label: string; emoji: string; color: string }
  discord_link?: string | null
  isOwner: boolean
  jamStartDate?: string | null
  jamEndDate?: string | null
  createdAt?: string | null
}

function roleLabel(key: string) {
  const k = key.toLowerCase()
  return ROLE_STYLES[k]?.label ?? key
}

function engineLabel(value: string) {
  const v = value.toLowerCase()
  return ENGINE_OPTIONS.find((e) => e.value === v)?.label ?? value
}

function spokenLanguageLabel(value: string) {
  const t = value.trim()
  if (!t) return null
  const v = t.toLowerCase()
  return LANGUAGE_OPTIONS.find((l) => l.value === v)?.label ?? t
}

type SuggestionCacheEntry = { players: SuggestedPlayer[]; loading: boolean }

interface DashboardMyTeamsProps {
  teams: TeamData[]
  onLeave?: (id: string) => Promise<void> | void
}

export function DashboardMyTeams({
  teams,
  onLeave,
}: DashboardMyTeamsProps) {
  const [leavingTeamId, setLeavingTeamId] = useState<string | null>(null)
  const [teamMatchesContext, setTeamMatchesContext] = useState<TeamData | null>(null)
  const [suggestionCache, setSuggestionCache] = useState<Record<string, SuggestionCacheEntry>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [inviteBusyUserId, setInviteBusyUserId] = useState<string | null>(null)
  /** `teamId:inviteeUserId` for pending squad invitations (invitation rows store invitee in `sender_id`). */
  const [pendingInvitePairKeys, setPendingInvitePairKeys] = useState<Set<string>>(new Set())

  const suggestionsFetchKey = useMemo(
    () =>
      teams
        .filter((t) => t.isOwner && t.lookingForRoleKeys.length > 0)
        .map((t) => `${t.id}\0${t.engine}\0${t.lookingForRoleKeys.join("\0")}`)
        .sort()
        .join("|"),
    [teams],
  )

  useEffect(() => {
    let cancelled = false
    const eligible = teams.filter((t) => t.isOwner && t.lookingForRoleKeys.length > 0)

    ;(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const uid = session?.user?.id ?? null
      if (!cancelled) setCurrentUserId(uid)

      if (eligible.length > 0) {
        setSuggestionCache((prev) => {
          const next = { ...prev }
          for (const team of eligible) {
            next[team.id] = { players: prev[team.id]?.players ?? [], loading: true }
          }
          return next
        })
      }

      let pendingKeys = new Set<string>()
      if (eligible.length > 0) {
        const ownedIds = eligible.map((t) => t.id)
        const { data: pendRows } = await supabase
          .from("join_requests")
          .select("team_id, sender_id")
          .eq("type", "invitation")
          .eq("status", "pending")
          .in("team_id", ownedIds)
        for (const r of pendRows ?? []) {
          if (r.team_id && r.sender_id) pendingKeys.add(`${r.team_id}:${r.sender_id}`)
        }
      }
      if (!cancelled) setPendingInvitePairKeys(pendingKeys)

      await Promise.all(
        eligible.map(async (team) => {
          const { players: raw, error } = await getSuggestedPlayers(
            team.lookingForRoleKeys,
            team.engine,
          )
          if (cancelled) return
          const filtered = error ? [] : uid ? raw.filter((p) => p.userId !== uid) : raw
          setSuggestionCache((prev) => ({
            ...prev,
            [team.id]: { players: filtered, loading: false },
          }))
        }),
      )
    })()

    return () => {
      cancelled = true
    }
  }, [suggestionsFetchKey])

  async function handleInviteFromModal(team: TeamData, player: SuggestedPlayer) {
    setInviteBusyUserId(player.userId)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) {
        toast.error("You must be signed in to invite someone.")
        return
      }

      const result = await sendTeamInvitation({
        teamId: team.id,
        inviteeUserId: player.userId,
        inviteeUsername: player.username,
        targetRole: player.role,
        message:
          "We spotted you on Find Members — we'd love to have you on the squad. Check your dashboard to accept or decline.",
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      if (result.gamification && gamificationRewardHasToast(result.gamification)) {
        showGamificationRewards("INVITE_MEMBER", result.gamification)
      }

      toast.success("Invitation sent!")

      setPendingInvitePairKeys((prev) => new Set(prev).add(`${team.id}:${player.userId}`))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not send invitation."
      toast.error("Invitation failed", { description: msg })
    } finally {
      setInviteBusyUserId(null)
    }
  }

  const dialogPlayers =
    teamMatchesContext && suggestionCache[teamMatchesContext.id]
      ? suggestionCache[teamMatchesContext.id].players
      : []

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">My Teams</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Teams you{"'"}ve created or joined
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="gap-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/85"
        >
          <Link href="/create-team">
            <Rocket className="size-3.5" />
            New Team
          </Link>
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 rounded-2xl border-border/50 bg-card px-6 py-10 text-center">
          <PenLine className="size-7 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            You haven{"'"}t created any teams yet.
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
          >
            <Link href="/create-team">Post your first team</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card
              key={team.id}
              className="group relative flex flex-col rounded-2xl border-border/50 bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
            >
              <CardHeader className="gap-2 pb-0 pt-4 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold text-foreground">
                      {team.name}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium text-primary truncate">
                      {team.jam}
                    </p>
                    {(() => {
                      const jamStatus = getJamListingStatus(team.jamStartDate, team.jamEndDate, {
                        createdAtIso: team.createdAt,
                      })
                      if (!jamStatus) return null
                      return (
                        <Badge
                          variant="outline"
                          className={`mt-1.5 w-fit max-w-full rounded-full px-2 py-0.5 text-[10px] font-semibold ${jamStatus.badgeClassName}`}
                        >
                          {jamStatus.label}
                        </Badge>
                      )
                    })()}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={`rounded-full text-[10px] font-semibold px-2 py-0.5 ${
                        team.isOwner
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border/60 bg-muted text-muted-foreground"
                      }`}
                    >
                      {team.isOwner ? "Leader" : "Member"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="rounded-full border-border/60 text-[10px] text-muted-foreground px-2 py-0.5"
                    >
                      <Users className="mr-1 size-3" />
                      {team.members}/{team.maxMembers}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-2.5 pt-3 px-4">
                {team.isOwner &&
                  isJamStartBackfilledWithCreatedAt(
                    team.jamStartDate,
                    team.createdAt,
                  ) &&
                  team.jamEndDate &&
                  new Date(team.jamEndDate).getTime() > Date.now() && (
                    <p
                      className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-2.5 py-1.5 text-[10px] leading-snug text-amber-900 dark:text-amber-100/90"
                      role="status"
                    >
                      Please update your Jam dates to show your real progress.
                    </p>
                  )}
                {/* Engine + language row */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Cpu className="size-3 text-lavender" />
                    {team.engine}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Globe className="size-3 text-teal" />
                    {team.language}
                  </span>
                </div>

                {/* Description */}
                <p className="flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {team.description}
                </p>

                {/* Role + level badges */}
                <div className="flex flex-wrap gap-1">
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${team.level.color}`}
                  >
                    {team.level.emoji} {team.level.label}
                  </span>
                  {team.roles.map((role, roleIdx) => (
                    <span
                      key={`${role.label}-${roleIdx}`}
                      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${role.color}`}
                    >
                      {role.emoji} {role.label}
                    </span>
                  ))}
                </div>

                {/* Matches button */}
                {team.isOwner &&
                team.lookingForRoleKeys.length > 0 &&
                suggestionCache[team.id] &&
                !suggestionCache[team.id].loading &&
                suggestionCache[team.id].players.length > 0 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full gap-1.5 rounded-xl border border-teal-500/40 bg-secondary/90 text-xs font-semibold text-teal-600 hover:bg-teal-500/15 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                    onClick={() => setTeamMatchesContext(team)}
                  >
                    <Sparkles className="size-3" />
                    {suggestionCache[team.id].players.length} Matches Found
                  </Button>
                ) : null}
              </CardContent>

              <CardFooter className="flex flex-col gap-1.5 px-4 pb-4 pt-1">
                {team.isOwner ? (
                  <>
                    {/* Primary actions row */}
                    <div className="flex w-full gap-1.5">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary/10 hover:text-primary text-xs"
                      >
                        <Link href={`/teams/${team.id}`}>
                          <MessageCircle className="size-3.5" />
                          Squad Space
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 rounded-xl border-border/60 text-foreground hover:bg-muted text-xs"
                      >
                        <Link href={`/teams/${team.id}/manage`}>
                          <Settings className="size-3.5" />
                          Manage
                        </Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary/10 hover:text-primary text-xs"
                    >
                      <Link href={`/teams/${team.id}`}>
                        <MessageCircle className="size-3.5" />
                        Open Squad Space
                      </Link>
                    </Button>
                    <div className="flex w-full gap-1.5">
                      {team.discord_link ? (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary/10 hover:text-primary text-xs"
                        >
                          <a
                            href={team.discord_link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Link2 className="size-3.5" />
                            Discord
                          </a>
                        </Button>
                      ) : (
                        <p className="flex-1 text-center text-[10px] italic text-muted-foreground">
                          No Discord link yet.
                        </p>
                      )}
                      {onLeave && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive text-xs"
                          onClick={async () => {
                            setLeavingTeamId(team.id)
                            try {
                              await onLeave(team.id)
                            } finally {
                              setLeavingTeamId(null)
                            }
                          }}
                          disabled={leavingTeamId === team.id}
                        >
                          {leavingTeamId === team.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <UserMinus className="size-3.5" />
                          )}
                          Leave
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Suggested matches dialog */}
      <Dialog
        open={teamMatchesContext !== null}
        onOpenChange={(open) => {
          if (!open) setTeamMatchesContext(null)
        }}
      >
        <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
          <DialogHeader className="shrink-0 space-y-0 border-b border-border/60 px-6 pt-6 pr-14 pb-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-teal/15 text-teal">
                <Sparkles className="size-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5 text-left">
                <DialogTitle className="text-base leading-tight sm:text-lg">
                  Suggested Developers
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground/80">for </span>
                  {teamMatchesContext?.name ?? "…"}
                </p>
              </div>
            </div>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            {dialogPlayers.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-2 py-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground ring-1 ring-border/40">
                  <Sparkles className="size-7 opacity-70" aria-hidden />
                </div>
                <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                  No perfect matches found right now. Check back later!
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {dialogPlayers.map((p) => {
                  const roleKey = p.role?.trim().toLowerCase() || ""
                  const roleStyle =
                    ROLE_STYLES[roleKey] ?? {
                      label: roleLabel(p.role),
                      emoji: "🎭",
                      color: "bg-muted text-muted-foreground",
                    }
                  const expKey = p.experience?.trim().toLowerCase() || "beginner"
                  const expStyle =
                    EXPERIENCE_STYLES[expKey] ?? EXPERIENCE_STYLES["beginner"]
                  const langLine =
                    spokenLanguageLabel(p.language) ?? "Language not specified"
                  const inviteKey =
                    teamMatchesContext ? `${teamMatchesContext.id}:${p.userId}` : ""
                  const inviteAlreadyPending = inviteKey && pendingInvitePairKeys.has(inviteKey)
                  return (
                    <li
                      key={`${teamMatchesContext!.id}-${p.availabilityPostId}`}
                      className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-background/50 p-4 backdrop-blur-sm transition-all hover:border-teal/30 hover:bg-muted/20"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <UserAvatar
                          src={p.avatarUrl}
                          fallbackName={p.username}
                          size="md"
                          className="size-12 shrink-0 rounded-full ring-2 ring-border/50"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="truncate font-semibold text-foreground">
                              {p.username}
                            </span>
                            <span className="inline-flex min-w-0 max-w-full items-center gap-1 text-xs text-muted-foreground">
                              <Globe className="size-3 shrink-0 text-teal/80" aria-hidden />
                              <span className="truncate">{langLine}</span>
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            <span
                              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${roleStyle.color}`}
                            >
                              <span className="shrink-0">{roleStyle.emoji}</span>
                              <span>{roleStyle.label}</span>
                            </span>
                            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                              {engineLabel(p.engine)}
                            </span>
                            <span
                              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${expStyle.color}`}
                            >
                              <span className="shrink-0">{expStyle.emoji}</span>
                              <span>{expStyle.label}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={inviteAlreadyPending ? "secondary" : "default"}
                        className={
                          inviteAlreadyPending
                            ? "shrink-0 gap-1.5 rounded-lg"
                            : "shrink-0 gap-1.5 rounded-lg bg-teal px-3 text-teal-foreground hover:bg-teal/90"
                        }
                        disabled={
                          inviteBusyUserId === p.userId ||
                          p.userId === currentUserId ||
                          !teamMatchesContext ||
                          Boolean(inviteAlreadyPending)
                        }
                        onClick={() => {
                          if (teamMatchesContext) {
                            void handleInviteFromModal(teamMatchesContext, p)
                          }
                        }}
                      >
                        {inviteBusyUserId === p.userId ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : inviteAlreadyPending ? (
                          "Invitation sent"
                        ) : (
                          <>
                            <Send className="size-3.5" aria-hidden />
                            Invite
                          </>
                        )}
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
