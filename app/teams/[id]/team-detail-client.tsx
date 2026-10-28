"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TeamChat } from "@/components/team-chat"
import { TeamAnnouncementPublic } from "@/components/team-announcement-public"
import { supabase } from "@/lib/supabase"
import { fetchProfilesMapWithDiscord } from "@/lib/profiles"
import { fetchTeamDiscordLink } from "@/lib/team-discord"
import { TEAMS_PUBLIC_WITH_MEMBERS, sanitizeJamDisplayName } from "@/lib/teams-public"
import { formatTeamToCardData, type TeamRowDb } from "@/lib/team-utils"
import type { TeamCardData } from "@/components/team-card"
import { Loader2, ArrowLeft, ShieldAlert, Users, Cpu, Globe, Info } from "lucide-react"
import { toast } from "sonner"
import { UserAvatar } from "@/components/user-avatar"
import { Badge } from "@/components/ui/badge"
import { engineOptionLabel, languageOptionLabel } from "@/lib/constants"
import { ROLE_STYLES } from "@/lib/constants"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

type SquadViewData = {
  id: string
  user_id: string
  team_name: string
  game_name: string
  description: string
  engine: string
  language: string
  discord_link: string | null
  jam_end_date: string | null
}

type SquadMember = {
  userId: string
  username: string
  avatarUrl: string | null
  roleKey: string | null
  roleLabel: string
  isLeader: boolean
  discordUsername?: string | null
}

type ViewMode = "loading" | "not_found" | "announcement" | "squad"

export function TeamDetailClient({ teamId }: { teamId: string }) {
  const [viewMode, setViewMode] = useState<ViewMode>("loading")
  const [teamCardData, setTeamCardData] = useState<TeamCardData | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [squad, setSquad] = useState<SquadViewData | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [members, setMembers] = useState<SquadMember[]>([])

  useEffect(() => {
    if (!teamId || teamId.length < 2) {
      setViewMode("not_found")
      return
    }

    let cancelled = false

    const run = async () => {
      setViewMode("loading")

      let { data: teamRow, error: teamError } = await supabase
        .from("teams")
        .select(TEAMS_PUBLIC_WITH_MEMBERS)
        .eq("id", teamId)
        .gt("expires_at", new Date().toISOString())
        .single()

      if (teamError || !teamRow) {
        const fallback = await supabase
          .from("teams")
          .select(TEAMS_PUBLIC_WITH_MEMBERS)
          .eq("id", teamId)
          .single()
        if (fallback.data) {
          teamRow = fallback.data
          teamError = null
        }
      }

      if (cancelled) return
      if (teamError || !teamRow) {
        setViewMode("not_found")
        return
      }

      const cardData = formatTeamToCardData(teamRow as TeamRowDb)
      setTeamCardData(cardData)

      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (cancelled) return

      const memberUserIds = (teamRow.team_members ?? []).map(
        (m: { user_id: string }) => m.user_id,
      )
      const isMember =
        !!session &&
        (teamRow.user_id === session.user.id || memberUserIds.includes(session.user.id))

      if (!isMember) {
        setIsLoggedIn(!!session?.user)
        setViewMode("announcement")
        return
      }

      if (cancelled) return
      setCurrentUserId(session!.user.id)

      const { data: teamData, error: teamDataError } = await supabase
        .from("teams")
        .select("id, user_id, team_name, game_name, description, engine, language, jam_end_date")
        .eq("id", teamId)
        .single()

      if (teamDataError || !teamData) {
        toast.error("Squad not found.")
        setViewMode("announcement")
        return
      }

      const { data: membersData } = await supabase
        .from("team_members")
        .select("user_id, role")
        .eq("team_id", teamId)

      const allUserIds = Array.from(
        new Set([
          teamData.user_id,
          ...(membersData ?? []).map((m: { user_id: string }) => m.user_id),
        ]),
      )
      const [joinRes, profilesFromMap, discordLink] = await Promise.all([
        (membersData?.length ?? 0) > 0
          ? supabase
              .from("join_requests")
              .select("sender_id, sender_name, target_role, status, type")
              .eq("team_id", teamId)
              .eq("status", "accepted")
              .in(
                "sender_id",
                (membersData ?? []).map((m: { user_id: string }) => m.user_id),
              )
          : Promise.resolve({
              data: [] as {
                sender_id?: string
                sender_name?: string
                target_role?: string
              }[],
            }),
        fetchProfilesMapWithDiscord(allUserIds),
        fetchTeamDiscordLink(supabase, teamId),
      ])

      const roleByUserId: Record<string, string | null> = {}
      const senderNameByUserId: Record<string, string> = {}
      const profileMap: Record<
        string,
        { username: string; avatar_url: string | null; discord_username: string | null }
      > = {}

      for (const jr of joinRes.data ?? []) {
        if (!jr.sender_id) continue
        if (jr.target_role) roleByUserId[jr.sender_id] = jr.target_role as string
        if (jr.sender_name?.trim()) {
          senderNameByUserId[jr.sender_id] = (jr.sender_name as string).trim()
        }
      }
      for (const [id, p] of Object.entries(profilesFromMap)) {
        profileMap[id] = {
          username: p.username,
          avatar_url: p.avatar_url,
          discord_username: p.discord_username ?? null,
        }
      }

      const ownerProfile = profileMap[teamData.user_id] ?? {
        username: "Leader",
        avatar_url: null,
        discord_username: null,
      }

      const squadMembers: SquadMember[] = [
        {
          userId: teamData.user_id,
          username: ownerProfile.username || "Leader",
          avatarUrl: ownerProfile.avatar_url,
          roleKey: null,
          roleLabel: "Leader",
          isLeader: true,
          discordUsername: ownerProfile.discord_username,
        },
      ]

      for (const row of membersData ?? []) {
        const profile = profileMap[row.user_id] ?? {
          username: "",
          avatar_url: null,
          discord_username: null,
        }
        const membershipRole = (row as { role?: string | null }).role ?? null
        const key = membershipRole ?? roleByUserId[row.user_id] ?? null
        const style = key ? ROLE_STYLES[key] : undefined
        const roleLabel = style?.label ?? (key ?? "Member")
        squadMembers.push({
          userId: row.user_id,
          username:
            profile.username || senderNameByUserId[row.user_id] || "A Jammer",
          avatarUrl: profile.avatar_url,
          roleKey: key,
          roleLabel,
          isLeader: false,
          discordUsername: profile.discord_username,
        })
      }

      if (cancelled) return
      setSquad({
        id: teamData.id as string,
        user_id: teamData.user_id as string,
        team_name: (teamData.team_name as string) ?? "Untitled Squad",
        game_name: sanitizeJamDisplayName(teamData.game_name as string | null),
        description: (teamData.description as string) ?? "",
        engine: (teamData.engine as string) ?? "",
        language: (teamData.language as string) ?? "",
        discord_link: discordLink,
        jam_end_date: (teamData.jam_end_date as string | null) ?? null,
      })
      setMembers(squadMembers)
      setViewMode("squad")
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [teamId])

  if (viewMode === "loading") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (viewMode === "not_found") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 px-4 py-16 lg:px-6 lg:pt-28">
          <div className="mx-auto max-w-2xl">
            <Card className="rounded-2xl border-border/60 bg-card">
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <ShieldAlert className="size-12 text-muted-foreground" />
                <h1 className="text-xl font-bold text-foreground">
                  This announcement is no longer available
                </h1>
                <p className="text-sm text-muted-foreground">
                  This squad may have been removed or the link is invalid.
                </p>
                <Button asChild className="rounded-xl">
                  <Link href="/teams">Browse squads</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  if (viewMode === "announcement" && teamCardData) {
    return <TeamAnnouncementPublic team={teamCardData} isLoggedIn={isLoggedIn} />
  }

  if (viewMode !== "squad" || !squad || !currentUserId) {
    return null
  }

  const isLeader = currentUserId === squad.user_id
  const discordMissing = !squad.discord_link?.trim()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-4 pb-8 pt-8 lg:px-6 lg:pb-12 lg:pt-28">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              asChild
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Link href="/dashboard">
                <ArrowLeft className="size-4" />
                Back to Dashboard
              </Link>
            </Button>
            {isLeader ? (
              <Button asChild variant="outline" className="rounded-xl">
                <Link href={`/teams/${squad.id}/manage`}>Manage squad</Link>
              </Button>
            ) : null}
          </div>

          <Card className="rounded-2xl border-border/60 bg-card">
            <CardContent className="space-y-4 p-6">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                  {squad.team_name}
                </h1>
                {squad.game_name ? (
                  <p className="mt-1 text-sm font-medium text-primary">{squad.game_name}</p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {squad.engine ? (
                  <Badge
                    variant="outline"
                    className="inline-flex items-center gap-1.5 rounded-full border-border/60 bg-lavender px-3 py-1 text-xs font-semibold text-lavender-foreground"
                  >
                    <Cpu className="size-3.5" />
                    {engineOptionLabel(squad.engine)}
                  </Badge>
                ) : null}
                {squad.language ? (
                  <Badge
                    variant="outline"
                    className="inline-flex items-center gap-1.5 rounded-full border-border/60 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal"
                  >
                    <Globe className="size-3.5" />
                    {languageOptionLabel(squad.language)}
                  </Badge>
                ) : null}
                <Badge
                  variant="outline"
                  className="inline-flex items-center gap-1.5 rounded-full border-border/60 px-3 py-1 text-xs font-semibold"
                >
                  <Users className="size-3.5" />
                  {members.length} member{members.length === 1 ? "" : "s"}
                </Badge>
              </div>

              {squad.description ? (
                <p className="text-sm leading-relaxed text-muted-foreground">{squad.description}</p>
              ) : null}

              {discordMissing ? (
                <Alert>
                  <Info className="size-4" />
                  <AlertTitle>Discord link missing</AlertTitle>
                  <AlertDescription>
                    {isLeader
                      ? "Add a Discord invite from Manage squad so members can join your server."
                      : "Ask your squad leader to add a Discord invite link."}
                  </AlertDescription>
                </Alert>
              ) : (
                <Button asChild className="rounded-xl bg-[#5865F2] text-white hover:bg-[#4752C4]">
                  <a href={squad.discord_link!} target="_blank" rel="noopener noreferrer">
                    Join Discord
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="chat" className="rounded-lg">
                Chat
              </TabsTrigger>
              <TabsTrigger value="members" className="rounded-lg">
                Members
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="mt-4">
              <TeamChat teamId={squad.id} currentUserId={currentUserId} />
            </TabsContent>
            <TabsContent value="members" className="mt-4">
              <Card className="rounded-2xl border-border/60 bg-card">
                <CardContent className="divide-y divide-border/50 p-0">
                  {members.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <UserAvatar
                        src={member.avatarUrl}
                        fallbackName={member.username}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/jammer/${member.userId}`}
                          className="truncate text-sm font-semibold text-foreground hover:underline"
                        >
                          {member.username}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">
                          {member.roleLabel}
                          {member.isLeader ? " · Leader" : ""}
                          {member.discordUsername
                            ? ` · @${member.discordUsername}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
