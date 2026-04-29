"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Sparkles, Users, UserSearch, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

import { supabase } from "@/lib/supabase"
import { getAvailablePlayers, type AvailablePlayerListItem } from "@/lib/queries"
import { ROLE_STYLES, EXPERIENCE_STYLES } from "@/lib/constants"

import { UserAvatar } from "@/components/user-avatar"
import { sendTeamInvitation } from "@/app/actions/invite-actions"

type LookingForEntry = { role?: string | null; level?: string | null }

type TeamRow = {
  id: string
  team_name: string | null
  game_name: string | null
  engine: string | null
  language: string | null
  looking_for: unknown
  description: string | null
  expires_at: string | null
  created_at: string | null
}

type TeamSuggestion = {
  team: TeamRow
  matchedRoleKey: string
}

function parseLookingForRoleEntries(lookingFor: unknown): LookingForEntry[] {
  try {
    if (Array.isArray(lookingFor)) return lookingFor as LookingForEntry[]
    if (typeof lookingFor === "string") {
      const parsed = JSON.parse(lookingFor) as LookingForEntry[]
      return Array.isArray(parsed) ? parsed : []
    }
    return []
  } catch {
    return []
  }
}

function getRoleKeyList(lookingFor: unknown): string[] {
  const entries = parseLookingForRoleEntries(lookingFor)
  const keys = entries
    .map((e) => (e.role ?? "").trim().toLowerCase())
    .filter(Boolean)

  return Array.from(new Set(keys))
}

function getMatchedRoleEntry(lookingFor: unknown, roleKey: string): LookingForEntry | null {
  const entries = parseLookingForRoleEntries(lookingFor)
  const target = roleKey.trim().toLowerCase()
  if (!target) return null

  return (
    entries.find((e) => (e.role ?? "").trim().toLowerCase() === target) ??
    (entries[0] ?? null)
  )
}

export function PostActionOnboarding() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const flow = searchParams.get("flow")
  const teamIdParam = searchParams.get("id")

  const mode = useMemo<"new-team" | "new-player" | null>(() => {
    const f = flow?.trim().toLowerCase()
    if (f === "new-team" && teamIdParam?.trim()) return "new-team"
    if (f === "new-player") return "new-player"
    return null
  }, [flow, teamIdParam])

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [players, setPlayers] = useState<AvailablePlayerListItem[]>([])
  const [teams, setTeams] = useState<TeamSuggestion[]>([])

  const [teamData, setTeamData] = useState<TeamRow | null>(null)
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null)

  useEffect(() => {
    setOpen(Boolean(mode))
  }, [mode])

  const cleanUrlAndClose = () => {
    setOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    params.delete("flow")
    params.delete("id")
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  // Fetch data
  useEffect(() => {
    if (!mode) return

    async function run() {
      setLoading(true)
      setPlayers([])
      setTeams([])
      setTeamData(null)

      try {
        if (mode === "new-team") {
          const teamId = teamIdParam?.trim()
          if (!teamId) return

          const { data: t, error: teamErr } = await supabase
            .from("teams")
            .select(
              "id, team_name, game_name, engine, language, looking_for, description, expires_at, created_at",
            )
            .eq("id", teamId)
            .single()

          if (teamErr || !t) {
            toast.error("Team not found.", { description: "Could not load your squad." })
            return
          }

          const team = t as TeamRow
          setTeamData(team)

          const roleKeys = getRoleKeyList(team.looking_for)
          const teamLanguage = team.language?.trim() || "all"

          const invitedPlayers: AvailablePlayerListItem[] = []
          const seen = new Set<string>()

          for (const roleKey of roleKeys) {
            if (invitedPlayers.length >= 3) break

            const res = await getAvailablePlayers({
              role: roleKey,
              language: teamLanguage,
              limit: 3,
            })

            if (res.error) continue

            for (const p of res.players ?? []) {
              if (seen.has(p.id)) continue
              seen.add(p.id)
              invitedPlayers.push(p)
              if (invitedPlayers.length >= 3) break
            }
          }

          setPlayers(invitedPlayers)
          return
        }

        if (mode === "new-player") {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session?.user) return

          const uid = session.user.id
          const { data: profile } = await supabase
            .from("profiles")
            .select("default_role, main_role, default_language, profile_roles(role, is_primary)")
            .eq("id", uid)
            .maybeSingle()

          const roleKeyRaw =
            profile?.profile_roles?.find((r: { role?: string | null; is_primary?: boolean | null }) => r.is_primary)
              ?.role ?? profile?.main_role ?? profile?.default_role

          const roleKey = roleKeyRaw?.trim().toLowerCase() ?? ""
          const userLanguage = profile?.default_language?.trim() ?? ""

          if (!roleKey || !userLanguage) {
            setTeams([])
            return
          }

          const { data: teamRows, error: teamsErr } = await supabase
            .from("teams")
            .select(
              "id, team_name, game_name, engine, language, looking_for, description, expires_at, created_at",
            )
            .gt("expires_at", new Date().toISOString())
            .eq("language", userLanguage)
            .order("created_at", { ascending: false })
            .limit(80)

          if (teamsErr) {
            toast.error("Could not load team suggestions.", { description: teamsErr.message })
            return
          }

          const suggestions: TeamSuggestion[] = []
          for (const row of (teamRows ?? []) as TeamRow[]) {
            const roleKeys = getRoleKeyList(row.looking_for)
            if (!roleKeys.includes(roleKey)) continue
            suggestions.push({ team: row, matchedRoleKey: roleKey })
            if (suggestions.length >= 3) break
          }

          setTeams(suggestions)
        }
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [mode, teamIdParam])

  const handleInvite = async (player: AvailablePlayerListItem) => {
    if (!teamData) return
    if (invitingUserId) return

    const targetRole = player.role.key?.trim().toLowerCase() || player.rawRole?.trim().toLowerCase()
    if (!targetRole) {
      toast.error("No role found for this player.", { description: "Cannot send an invitation." })
      return
    }

    setInvitingUserId(player.id)
    try {
      const res = await sendTeamInvitation({
        teamId: teamData.id,
        inviteeUserId: player.id,
        inviteeUsername: player.username,
        targetRole,
        message: "Hey! We would love to have you join our squad on GameJamCrew.",
      })

      if (!res.success) {
        toast.error("Invite failed.", { description: res.error })
        return
      }

      toast.success("Invitation sent!", { description: `Invited ${player.username}.` })
    } catch (err) {
      toast.error("Invite failed.", { description: err instanceof Error ? err.message : "Try again." })
    } finally {
      setInvitingUserId(null)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) cleanUrlAndClose()
        else setOpen(true)
      }}
    >
      <DialogContent
        className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-md rounded-3xl border-border/60 bg-background p-0 shadow-2xl sm:max-w-lg"
        showCloseButton={true}
      >
        <div className="p-5 sm:p-6">
          {mode === "new-team" ? (
            <>
              <DialogHeader className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-teal/15">
                    <Sparkles className="size-5 text-teal" />
                  </div>
                  <DialogTitle className="text-2xl font-extrabold tracking-tight text-foreground">
                    Your squad is live!
                  </DialogTitle>
                </div>
                <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                  Next step: browse <span className="font-semibold text-foreground">Find Members</span> to invite
                  more teammates manually. Meanwhile, here are a few jammers you match right now.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5 flex items-center justify-between gap-3">
                <Badge
                  variant="outline"
                  className="rounded-full border-teal/30 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal"
                >
                  <Users className="mr-1 size-3.5" />
                  {teamData?.team_name?.trim() || "Your squad"}
                </Badge>
                <Button asChild variant="outline" className="rounded-xl border-primary/40 text-primary hover:bg-primary/10">
                  <Link href="/find-members" onClick={cleanUrlAndClose}>
                    <UserSearch className="mr-2 size-4" />
                    Find Members
                  </Link>
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                <h3 className="text-sm font-bold text-foreground">Suggested jammers</h3>

                {loading ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="rounded-2xl border-border/60 bg-card p-3">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <div className="mt-3 space-y-2">
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : players.length === 0 ? (
                  <Card className="rounded-2xl border-border/60 bg-card p-4">
                    <p className="text-sm font-medium text-muted-foreground">No matching players found.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {players.map((p) => (
                      <Card
                        key={p.id}
                        className="rounded-2xl border-border/60 bg-card p-3 shadow-sm"
                      >
                        <CardContent className="p-0">
                          <div className="flex items-start gap-3">
                            <UserAvatar src={p.avatar_url} fallbackName={p.username} size="sm" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-bold text-foreground">{p.username}</p>
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                {p.role.key ? (
                                  <Badge
                                    className={`rounded-full border-border/60 bg-card px-2.5 py-0.5 text-[11px] font-bold ${p.role.color}`}
                                    variant="secondary"
                                  >
                                    {p.role.emoji} {p.role.label}
                                  </Badge>
                                ) : (
                                  <Badge
                                    className="rounded-full border-border/60 bg-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground"
                                    variant="secondary"
                                  >
                                    Role unknown
                                  </Badge>
                                )}
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full bg-secondary/50 px-2.5 py-0.5 text-[11px] font-bold text-foreground`}
                                >
                                  {p.level.emoji} {p.level.label}
                                </span>
                              </div>

                              <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                <span className="truncate">
                                  Language: {p.language?.trim() || "—"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <Button
                              type="button"
                              className="w-full rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                              onClick={() => void handleInvite(p)}
                              disabled={invitingUserId === p.id}
                            >
                              {invitingUserId === p.id ? (
                                <span className="inline-flex items-center gap-2">
                                  <Loader2 className="size-4 animate-spin" />
                                  Inviting...
                                </span>
                              ) : (
                                "Invite"
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}

          {mode === "new-player" ? (
            <>
              <DialogHeader className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-lavender/15">
                    <Sparkles className="size-5 text-lavender" />
                  </div>
                  <DialogTitle className="text-2xl font-extrabold tracking-tight text-foreground">
                    Nice work! Here are squads for you
                  </DialogTitle>
                </div>
                <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                  Based on your role and language, these squads are actively looking for teammates.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5 space-y-3">
                <h3 className="text-sm font-bold text-foreground">Matching squads</h3>

                {loading ? (
                  <div className="grid grid-cols-1 gap-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="rounded-2xl border-border/60 bg-card p-4">
                        <Skeleton className="h-5 w-2/3" />
                        <div className="mt-3 space-y-2">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : teams.length === 0 ? (
                  <Card className="rounded-2xl border-border/60 bg-card p-5">
                    <p className="text-sm font-medium text-muted-foreground">
                      No matching squads right now for your role + language.
                    </p>
                    <div className="mt-4">
                      <Button
                        asChild
                        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                      >
                        <Link href="/create-team" onClick={cleanUrlAndClose}>
                          No matching squad? Create your own!
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {teams.map(({ team, matchedRoleKey }) => {
                      const roleStyle = ROLE_STYLES[matchedRoleKey]
                      const matchedEntry = getMatchedRoleEntry(team.looking_for, matchedRoleKey)
                      const levelKey = matchedEntry?.level?.trim()?.toLowerCase() ?? ""
                      const levelStyle = levelKey ? EXPERIENCE_STYLES[levelKey] : undefined

                      return (
                        <Card key={team.id} className="rounded-2xl border-border/60 bg-card p-4 shadow-sm">
                          <CardContent className="p-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-extrabold text-foreground">{team.team_name || "Unnamed squad"}</p>
                                {team.game_name?.trim() ? (
                                  <p className="mt-1 truncate text-sm font-semibold text-primary">{team.game_name}</p>
                                ) : null}
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {roleStyle?.label ? (
                                <Badge
                                  className={`rounded-full border-border/60 bg-card px-3 py-1 text-[11px] font-bold ${roleStyle.color}`}
                                  variant="secondary"
                                >
                                  {roleStyle.emoji} {roleStyle.label}
                                </Badge>
                              ) : (
                                <Badge className="rounded-full bg-secondary/50 px-3 py-1 text-[11px] font-bold text-muted-foreground" variant="secondary">
                                  Role
                                </Badge>
                              )}

                              {levelStyle?.label ? (
                                <Badge
                                  className={`rounded-full border-border/60 bg-secondary/50 px-3 py-1 text-[11px] font-bold ${levelStyle.color}`}
                                  variant="secondary"
                                >
                                  {levelStyle.emoji} {levelStyle.label}
                                </Badge>
                              ) : null}

                              <Badge className="rounded-full border-border/60 bg-secondary/50 px-3 py-1 text-[11px] font-bold text-teal" variant="secondary">
                                {team.language?.trim() || "—"}
                              </Badge>
                            </div>

                            <div className="mt-4">
                              <Button asChild variant="outline" className="w-full rounded-xl border-primary/40 text-primary hover:bg-primary/10">
                                <Link href={`/teams/${team.id}`} onClick={cleanUrlAndClose}>
                                  Open squad
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

