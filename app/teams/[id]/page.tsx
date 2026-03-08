"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TeamChat } from "@/components/team-chat"
import { TeamAnnouncementPublic } from "@/components/team-announcement-public"
import { supabase } from "@/lib/supabase"
import { fetchProfilesMap } from "@/lib/profiles"
import { formatTeamToCardData, type TeamRowDb } from "@/lib/team-utils"
import type { TeamCardData } from "@/components/team-card"
import { Loader2, ArrowLeft, ShieldAlert, Users, Cpu, Globe } from "lucide-react"
import { toast } from "sonner"
import { UserAvatar } from "@/components/user-avatar"
import { Badge } from "@/components/ui/badge"
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

export default function TeamPage() {
  const params = useParams()
  const rawId = params.id
  const teamId = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : ""

  const [viewMode, setViewMode] = useState<ViewMode>("loading")
  const [teamCardData, setTeamCardData] = useState<TeamCardData | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [squad, setSquad] = useState<SquadViewData | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [members, setMembers] = useState<SquadMember[]>([])

  useEffect(() => {
    if (!teamId || teamId.length < 2) return

    let cancelled = false

    const run = async () => {
      setViewMode("loading")

      // 1) Public fetch: team by id (non-expired first, then any for shared links)
      let { data: teamRow, error: teamError } = await supabase
        .from("teams")
        .select("*, team_members(id, role, user_id)")
        .eq("id", teamId)
        .gt("expires_at", new Date().toISOString())
        .single()

      if ((teamError || !teamRow)) {
        const fallback = await supabase
          .from("teams")
          .select("*, team_members(id, role, user_id)")
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
        (m: { user_id: string }) => m.user_id
      )
      const isMember =
        !!session &&
        (teamRow.user_id === session.user.id ||
          memberUserIds.includes(session.user.id))

      if (!isMember) {
        setIsLoggedIn(!!session?.user)
        setViewMode("announcement")
        return
      }

      // 2) User is member: load full squad space
      if (cancelled) return
      setCurrentUserId(session!.user.id)

      const { data: teamData, error: teamDataError } = await supabase
        .from("teams")
        .select("id, user_id, team_name, game_name, description, engine, language, discord_link")
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
        new Set([teamData.user_id, ...(membersData ?? []).map((m: { user_id: string }) => m.user_id)])
      )
      const [joinRes, profilesFromMap] = await Promise.all([
        (membersData?.length ?? 0) > 0
          ? supabase
              .from("join_requests")
              .select("sender_id, sender_name, target_role, status, type")
              .eq("team_id", teamId)
              .eq("status", "accepted")
              .in(
                "sender_id",
                (membersData ?? []).map((m: { user_id: string }) => m.user_id)
              )
          : Promise.resolve({
              data: [] as {
                sender_id?: string
                sender_name?: string
                target_role?: string
              }[],
            }),
        fetchProfilesMap(allUserIds),
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
        if (jr.sender_name?.trim())
          senderNameByUserId[jr.sender_id] = (jr.sender_name as string).trim()
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
        const key =
          membershipRole ?? roleByUserId[row.user_id] ?? null
        const style = key ? ROLE_STYLES[key] : undefined
        const roleLabel = style?.label ?? (key ?? "Member")
        squadMembers.push({
          userId: row.user_id,
          username:
            profile.username ||
            senderNameByUserId[row.user_id] ||
            "A Jammer",
          avatarUrl: profile.avatar_url,
          roleKey: key,
          roleLabel,
          isLeader: false,
          discordUsername: profile.discord_username,
        })
      }

      if (cancelled) return
      setSquad(teamData as SquadViewData)
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
        <main className="flex-1 px-4 py-16 lg:px-6">
          <div className="mx-auto max-w-2xl">
            <Card className="rounded-2xl border-border/60 bg-card">
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <ShieldAlert className="size-12 text-muted-foreground" />
                <h1 className="text-xl font-bold text-foreground">
                  This announcement is no longer available
                </h1>
                <p className="text-muted-foreground">
                  The team may have been removed or the listing has expired.
                </p>
                <Button asChild variant="outline" className="gap-2 rounded-xl">
                  <Link href="/dashboard">
                    <ArrowLeft className="size-4" />
                    Back to Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer tagline="Connect, create, and ship games together." />
      </div>
    )
  }

  if (viewMode === "announcement" && teamCardData) {
    return (
      <TeamAnnouncementPublic
        team={teamCardData}
        isLoggedIn={isLoggedIn}
      />
    )
  }

  if (viewMode === "squad" && squad && currentUserId) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <section className="relative overflow-hidden px-4 pb-8 pt-16 lg:px-6 lg:pt-24 lg:pb-12">
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              aria-hidden="true"
            >
              <div className="absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-peach/20 blur-[120px]" />
              <div className="absolute right-0 top-1/2 size-[400px] -translate-y-1/2 rounded-full bg-teal/15 blur-[100px]" />
            </div>
            <div className="relative mx-auto max-w-4xl">
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
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Users className="size-4" />
                Squad space
              </div>
              <h1 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                {squad.team_name}
              </h1>
              <p className="mt-2 text-muted-foreground">{squad.game_name}</p>
            </div>
          </section>

          <section className="px-4 pb-16 pt-4 lg:px-6 lg:pb-24">
            <div className="mx-auto max-w-4xl">
              <Tabs defaultValue="overview">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Squad overview</TabsTrigger>
                  <TabsTrigger value="chat">Squad chat</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0">
                  <Card className="rounded-2xl border-border/50">
                    <div className="p-6 space-y-4">
                      <h2 className="text-lg font-bold text-foreground">
                        Squad overview
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Cpu className="size-3.5 text-lavender" />
                          {squad.engine}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Globe className="size-3.5 text-teal" />
                          {squad.language}
                        </span>
                        {squad.discord_link && (
                          <Button
                            asChild
                            variant="outline"
                            className="gap-2 rounded-xl border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                          >
                            <Link
                              href={squad.discord_link}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Join Discord
                            </Link>
                          </Button>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {squad.description}
                      </p>
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">
                          Squad members
                        </h3>
                        {members.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No other members have joined this squad yet.
                          </p>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {members.map((member) => {
                              const roleClasses = member.isLeader
                                ? "bg-primary/10 text-primary"
                                : member.roleKey && ROLE_STYLES[member.roleKey]
                                  ? ROLE_STYLES[member.roleKey].color
                                  : "bg-muted text-muted-foreground"
                              return (
                                <div
                                  key={member.userId}
                                  className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/60 px-3 py-2"
                                >
                                  <div className="flex flex-1 items-center gap-3 min-w-0">
                                    <UserAvatar
                                      src={member.avatarUrl}
                                      fallbackName={member.username}
                                      size="xs"
                                    />
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold text-foreground">
                                        {member.username}
                                      </p>
                                      {member.discordUsername && (
                                        <p className="truncate text-xs text-muted-foreground">
                                          Discord: {member.discordUsername}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${roleClasses}`}
                                  >
                                    {member.roleLabel}
                                  </Badge>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="chat" className="mt-0">
                  <TeamChat teamId={squad.id} currentUserId={currentUserId} />
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </main>
        <Footer tagline="Connect, create, and ship games together." />
      </div>
    )
  }

  return null
}
