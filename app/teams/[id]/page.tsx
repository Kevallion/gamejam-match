"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TeamChat } from "@/components/team-chat"
import { supabase } from "@/lib/supabase"
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

export default function SquadMemberPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string

  const [loading, setLoading] = useState(true)
  const [squad, setSquad] = useState<SquadViewData | null>(null)
  const [isMember, setIsMember] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserDiscordAvatarUrl, setCurrentUserDiscordAvatarUrl] = useState<string | null>(null)
  const [members, setMembers] = useState<SquadMember[]>([])

  useEffect(() => {
    const loadSquad = async () => {
      if (!teamId) return
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session?.user) {
          router.push("/dashboard")
          return
        }

        setCurrentUserId(session.user.id)
        const meta = (session.user.user_metadata ?? {}) as Record<string, unknown>
        const discordAvatar =
          typeof meta.avatar_url === "string"
            ? meta.avatar_url
            : typeof meta.picture === "string"
              ? meta.picture
              : null
        setCurrentUserDiscordAvatarUrl(discordAvatar)

        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .select("id, user_id, team_name, game_name, description, engine, language, discord_link")
          .eq("id", teamId)
          .single()

        if (teamError || !teamData) {
          toast.error("Squad not found.")
          router.push("/dashboard")
          return
        }

        const { data: membersData, error: membersError } = await supabase
          .from("team_members")
          .select("user_id, role")
          .eq("team_id", teamId)

        let allowed = teamData.user_id === session.user.id
        if (!allowed && !membersError && membersData) {
          allowed = membersData.some((m) => m.user_id === session.user.id)
        }

        setIsMember(allowed)
        if (!allowed) {
          setSquad(null)
          setMembers([])
          return
        }

        const memberUserIds = (membersData ?? []).map((m: { user_id: string }) => m.user_id)

        const { data: joinRows } = await supabase
          .from("join_requests")
          .select("sender_id, sender_name, target_role, status, type")
          .eq("team_id", teamId)
          .eq("status", "accepted")
          .in("sender_id", memberUserIds)

        const roleByUserId: Record<string, string | null> = {}
        const senderNameByUserId: Record<string, string> = {}
        for (const jr of joinRows ?? []) {
          if (!jr.sender_id) continue
          const key = (jr.target_role as string | null) ?? null
          if (key) roleByUserId[jr.sender_id] = key
          const rawName = (jr.sender_name as string | null) ?? null
          if (rawName && rawName.trim()) {
            senderNameByUserId[jr.sender_id] = rawName.trim()
          }
        }

        const allUserIds = Array.from(new Set([teamData.user_id, ...memberUserIds]))

        const profileMap: Record<
          string,
          { username: string; avatar_url: string | null; discord_username: string | null }
        > = {}
        if (allUserIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, username, avatar_url, discord_username")
            .in("id", allUserIds)

          for (const p of profilesData ?? []) {
            if (!p.id) continue
            const rawUsername = (p.username ?? "").trim()
            profileMap[p.id] = {
              username: rawUsername,
              avatar_url: p.avatar_url ?? null,
              discord_username: (p as { discord_username?: string | null }).discord_username ?? null,
            }
          }
        }

        const ownerProfile = profileMap[teamData.user_id] ?? {
          username: "Leader",
          avatar_url: null,
          discord_username: null,
        }

        const squadMembers: SquadMember[] = []

        // Leader first
        squadMembers.push({
          userId: teamData.user_id,
          username: ownerProfile.username || "Leader",
          avatarUrl: ownerProfile.avatar_url,
          roleKey: null,
          roleLabel: "Leader",
          isLeader: true,
          discordUsername: ownerProfile.discord_username,
        })

        // Then accepted members
        for (const row of membersData ?? []) {
          const profile = profileMap[row.user_id] ?? {
            username: "",
            avatar_url: null,
            discord_username: null,
          }

          const membershipRole = ((row as { role?: string | null }).role ?? "").trim() || null
          const key = membershipRole ?? roleByUserId[row.user_id] ?? null
          const style = key ? ROLE_STYLES[key] : undefined
          const roleLabel = style?.label ?? (key ? key : "Member")
          const displayName =
            profile.username ||
            senderNameByUserId[row.user_id] ||
            "A Jammer"

          squadMembers.push({
            userId: row.user_id,
            username: displayName,
            avatarUrl: profile.avatar_url,
            roleKey: key,
            roleLabel,
            isLeader: false,
            discordUsername: profile.discord_username,
          })
        }

        setSquad(teamData as SquadViewData)
        setMembers(squadMembers)
      } catch (err) {
        toast.error("Error loading squad.", {
          description: err instanceof Error ? err.message : "Please try again.",
        })
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    void loadSquad()
  }, [teamId, router])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading squad space...</p>
        </div>
      </div>
    )
  }

  if (!isMember || !squad || !currentUserId) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 px-4 py-16 lg:px-6">
          <div className="mx-auto max-w-2xl">
            <Card className="rounded-2xl border-destructive/50 bg-destructive/10">
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <ShieldAlert className="size-12 text-destructive" />
                <h1 className="text-xl font-bold text-foreground">Access denied</h1>
                <p className="text-muted-foreground">
                  Only accepted members of this squad (or the squad owner) can access this space.
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden px-4 pb-8 pt-16 lg:px-6 lg:pt-24 lg:pb-12">
          <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
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
                  <CardHeader>
                    <h2 className="text-lg font-bold text-foreground">Squad overview</h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                          <Link href={squad.discord_link} target="_blank" rel="noreferrer">
                            Join Discord
                          </Link>
                        </Button>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {squad.description}
                    </p>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">Squad members</h3>
                      {members.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No other members have joined this squad yet.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {members.map((member) => {
                            const isCurrentUser = member.userId === currentUserId
                            const avatarSrc = member.avatarUrl ?? (isCurrentUser ? currentUserDiscordAvatarUrl : null)
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
                                    src={avatarSrc}
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
                  </CardContent>
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

