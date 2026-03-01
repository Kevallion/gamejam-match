"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { DashboardMyTeams, type TeamData } from "@/components/dashboard-my-teams"
import { DashboardMyAvailability, type ProfileData } from "@/components/dashboard-my-availability"
import { DashboardIncomingApplications, type ApplicationData } from "@/components/dashboard-incoming-applications"
import { DashboardSquadInvitations, type InvitationData } from "@/components/dashboard-squad-invitations"
import { Gamepad2, Heart, LayoutDashboard, Loader2, MessageCircle, Send, Users, Bell, UserCircle } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

const ROLE_STYLES: Record<string, { label: string; emoji: string; color: string }> = {
  developer: { label: "Developer", emoji: "💻", color: "bg-teal/15 text-teal" },
  "2d-artist": { label: "2D Artist", emoji: "🎨", color: "bg-pink/15 text-pink" },
  "3d-artist": { label: "3D Artist", emoji: "🗿", color: "bg-peach/15 text-peach" },
  audio: { label: "Audio", emoji: "🎵", color: "bg-lavender/15 text-lavender" },
  writer: { label: "Writer", emoji: "✍️", color: "bg-pink/15 text-pink" },
  "game-design": { label: "Game Designer", emoji: "🎯", color: "bg-peach/15 text-peach" },
  "ui-ux": { label: "UI / UX", emoji: "✨", color: "bg-mint/15 text-mint" },
  qa: { label: "QA / Playtester", emoji: "🐛", color: "bg-peach/15 text-peach" },
}

const LEVEL_STYLES: Record<string, { label: string; emoji: string; color: string }> = {
  beginner: { label: "Beginner", emoji: "🌱", color: "bg-mint/15 text-mint" },
  hobbyist: { label: "Hobbyist", emoji: "🛠️", color: "bg-peach/15 text-peach" },
  confirmed: { label: "Confirmed", emoji: "🚀", color: "bg-teal/15 text-teal" },
  veteran: { label: "Veteran", emoji: "⭐", color: "bg-lavender/15 text-lavender" },
}

const FALLBACK_ROLE = { label: "Other", emoji: "❓", color: "bg-muted text-muted-foreground" }
const FALLBACK_LEVEL = LEVEL_STYLES["beginner"]

type SentApp = { id: string; status: string; target_role?: string; teams?: { team_name?: string; discord_link?: string } }

function SentApplicationsSection({ sentApplications }: { sentApplications: SentApp[] }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-teal/10">
            <Send className="size-5 text-teal" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">My sent applications</h2>
            <p className="text-sm text-muted-foreground">Track your applications to join a team.</p>
          </div>
        </div>
      </div>

      {sentApplications.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          You haven&apos;t sent any applications to join a team yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sentApplications.map(app => {
            const roleStyle = app.target_role
              ? (ROLE_STYLES[app.target_role] ?? { label: app.target_role, emoji: "🎭", color: "bg-muted text-muted-foreground" })
              : null
            return (
              <div key={app.id} className="flex items-center justify-between rounded-lg border bg-background px-4 py-3 shadow-sm gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-foreground truncate">
                    {app.teams?.team_name || "Unknown team"}
                  </span>
                  {roleStyle && (
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${roleStyle.color}`}>
                      {roleStyle.emoji} {roleStyle.label}
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {app.status === "pending" && (
                    <span className="rounded bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      Pending
                    </span>
                  )}
                  {app.status === "rejected" && (
                    <span className="rounded bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600">
                      Declined
                    </span>
                  )}
                  {app.status === "accepted" && (
                    <span className="rounded bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600">
                      Accepted
                    </span>
                  )}
                  {app.status === "accepted" && app.teams?.discord_link && (
                    <a
                      href={app.teams.discord_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#5865F2]/90 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#5865F2]"
                    >
                      <MessageCircle className="size-3.5" />
                      Join Discord
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function DashboardClient() {
  const [teams, setTeams] = useState<TeamData[]>([])
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [applications, setApplications] = useState<ApplicationData[]>([])
  const [invitations, setInvitations] = useState<InvitationData[]>([])
  const [sentApplications, setSentApplications] = useState<SentApp[]>([])
  const [loading, setLoading] = useState(true)

  const mapTeamRow = (t: any): TeamData => {
    let parsed: any[] = []
    try {
      const raw = t.looking_for
      parsed = Array.isArray(raw) ? raw : JSON.parse(raw || "[]")
    } catch { parsed = [] }
    const rawLevel = (parsed[0]?.level || "beginner").toLowerCase()
    return {
      id: t.id,
      name: t.team_name || "Unnamed",
      jam: t.game_name || "",
      engine: t.engine || "",
      language: t.language || "",
      description: t.description || "",
      members: (t.team_members?.[0]?.count ?? 0) + 1,
      maxMembers: 1 + parsed.length,
      roles: parsed.map((r: any) => ROLE_STYLES[r.role?.toLowerCase()] ?? { ...FALLBACK_ROLE, label: r.role }),
      level: LEVEL_STYLES[rawLevel] ?? FALLBACK_LEVEL,
      discord_link: t.discord_link ?? null,
    }
  }

  const mapProfileRow = (m: any): ProfileData => {
    const rawLevel = (m.experience || "beginner").toLowerCase()
    const rawRole = (m.role || "developer").toLowerCase()
    return {
      id: m.id,
      username: m.username || "Anonymous",
      avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${m.username}&backgroundColor=d1d4f9`,
      role: ROLE_STYLES[rawRole] ?? { ...FALLBACK_ROLE, label: m.role },
      level: LEVEL_STYLES[rawLevel] ?? FALLBACK_LEVEL,
      engine: m.engine || "",
      language: m.language || "",
      bio: m.bio || "",
      rawRole,
      rawLevel,
      portfolio_link: m.portfolio_link ?? null,
    }
  }

  const mapApplicationRow = (r: any): ApplicationData => {
    const targetRole = r.target_role
      ? (ROLE_STYLES[r.target_role] ?? { label: r.target_role, emoji: "🎭", color: "bg-muted text-muted-foreground" })
      : { label: "Applicant", emoji: "👋", color: "bg-teal/15 text-teal" }
    return {
      id: r.id,
      username: r.sender_name || "A Jammer",
      avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${r.sender_name || 'anon'}`,
      teamName: r.teams?.team_name || "Unknown Team",
      role: targetRole,
      motivation: r.message || "No motivation provided.",
    }
  }

  const mapInvitationRow = (r: any): InvitationData => ({
    id: r.id,
    team_id: r.team_id,
    squadName: r.teams?.team_name || "Unknown Squad",
    gameName: r.teams?.game_name ?? null,
    discordLink: r.teams?.discord_link ?? null,
    targetRole: r.target_role ?? null,
  })

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { setLoading(false); return }

      const { data: teamsData } = await supabase
      .from("teams")
      .select("*, team_members(count)")
      .eq("user_id", session.user.id)

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)

    const { data: appsData } = await supabase
      .from("join_requests")
      .select("*, target_role, teams!inner(team_name, user_id)")
      .eq("teams.user_id", session.user.id)
      .eq("status", "pending")
      .eq("type", "application")

    const { data: rawInvitesData } = await supabase
      .from("join_requests")
      .select("id, team_id, status, target_role, teams(team_name, game_name, discord_link)")
      .eq("sender_id", session.user.id)
      .eq("status", "pending")
      .eq("type", "invitation")

    const { data: sentAppsData } = await supabase
      .from("join_requests")
      .select("id, status, target_role, teams(team_name, discord_link)")
      .eq("sender_id", session.user.id)
      .eq("type", "application")

    if (teamsData) setTeams(teamsData.map(mapTeamRow))
    if (profilesData) setProfiles(profilesData.map(mapProfileRow))
    if (appsData) setApplications(appsData.map(mapApplicationRow))
    if (rawInvitesData) setInvitations(rawInvitesData.map(mapInvitationRow))
    if (sentAppsData) {
      setSentApplications(sentAppsData.map((a: any) => ({
        ...a,
        teams: Array.isArray(a.teams) ? a.teams[0] : a.teams,
      })))
    }
    } catch (err) {
      toast.error("Error loading the dashboard.", {
        description: err instanceof Error ? err.message : "Please refresh the page.",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Delete this team?")) return
    try {
      const { error } = await supabase.from("teams").delete().eq("id", id)
      if (error) {
        toast.error("Could not delete the team.", { description: error.message })
        return
      }
      setTeams((prev) => prev.filter((t) => t.id !== id))
      toast.success("Team deleted.")
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    }
  }

  const handleUpdateDiscord = async (id: string, discordLink: string) => {
    const { error } = await supabase
      .from("teams")
      .update({ discord_link: discordLink })
      .eq("id", id)

    if (error) throw new Error(error.message)
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, discord_link: discordLink } : t))
    )
    toast.success("Discord link updated.", { description: "The team has been updated." })
  }

  const handleDeleteProfile = async (id: string) => {
    if (!confirm("Delete this profile?")) return
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id)
      if (error) {
        toast.error("Could not delete the profile.", { description: error.message })
        return
      }
      setProfiles((prev) => prev.filter((p) => p.id !== id))
      toast.success("Profile deleted.")
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    }
  }

  const handleAcceptApplication = async (id: string) => {
    try {
      const { data: request, error: fetchError } = await supabase
        .from("join_requests")
        .select("*")
        .eq("id", id)
        .single()

      if (fetchError || !request) {
        toast.error("Could not read the request.", { description: fetchError?.message })
        return
      }

      const { error: insertError } = await supabase
        .from("team_members")
        .insert({ team_id: request.team_id, user_id: request.sender_id, role: 'member' })

      if (insertError && insertError.code !== '23505') {
        toast.error("Could not add the member.", { description: insertError.message })
        return
      }

      const { error: updateError } = await supabase.from("join_requests").update({ status: 'accepted' }).eq("id", id)
      if (updateError) {
        toast.error("Could not accept the application.", { description: updateError.message })
        return
      }
      setApplications((prev) => prev.filter((a) => a.id !== id))
      toast.success("Application accepted!", { description: `${request.sender_name || "The jammer"} joined your team.` })
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    }
  }

  const handleDeclineApplication = async (id: string) => {
    try {
      const { error } = await supabase.from("join_requests").update({ status: 'rejected' }).eq("id", id)
      if (error) {
        toast.error("Could not decline the application.", { description: error.message })
        return
      }
      setApplications((prev) => prev.filter((a) => a.id !== id))
      toast.success("Application declined.", { icon: "👎" })
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    }
  }

  const handleAcceptInvitation = async (invitation: InvitationData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        toast.error("You must be logged in to accept an invitation.")
        return
      }

      const { error: insertError } = await supabase
        .from("team_members")
        .insert({ team_id: invitation.team_id, user_id: session.user.id, role: "member" })

      if (insertError && insertError.code !== "23505") {
        toast.error("Could not join the team.", { description: insertError.message })
        return
      }

      const { error: updateError } = await supabase.from("join_requests").update({ status: "accepted" }).eq("id", invitation.id)
      if (updateError) {
        toast.error("Could not accept the invitation.", { description: updateError.message })
        return
      }
      setInvitations((prev) => prev.filter((i) => i.id !== invitation.id))
      toast.success(`You joined ${invitation.squadName}!`, {
        description: invitation.discordLink ? "Check the Discord link to connect." : undefined,
      })
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    }
  }

  const handleDeclineInvitation = async (id: string) => {
    try {
      const { error } = await supabase.from("join_requests").update({ status: "rejected" }).eq("id", id)
      if (error) {
        toast.error("Could not decline the invitation.", { description: error.message })
        return
      }
      setInvitations((prev) => prev.filter((i) => i.id !== id))
      toast.success("Invitation declined.", { icon: "👋" })
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your data...</p>
        </div>
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
          <div className="relative mx-auto max-w-6xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-peach/20 bg-peach/10 px-4 py-1.5 text-sm font-medium text-peach">
              <LayoutDashboard className="size-4" />
              Command Center
            </div>
            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              Dashboard
            </h1>
            <p className="mt-3 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              Manage your teams, track your availability, and keep your jam life organized all in one place.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16 pt-4 lg:px-6 lg:pb-24">
          <div className="mx-auto max-w-6xl">
            {/* Stat Cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-teal/15">
                    <Users className="size-6 text-teal" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">My Teams</p>
                    <p className="text-2xl font-bold">{teams.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-peach/15">
                    <Bell className="size-6 text-peach" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                    <p className="text-2xl font-bold">{applications.length + invitations.length + sentApplications.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-lavender/15">
                    <UserCircle className="size-6 text-lavender" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">My Profiles</p>
                    <p className="text-2xl font-bold">{profiles.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="teams" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="teams">My Teams</TabsTrigger>
                <TabsTrigger value="requests">Inbox / Requests</TabsTrigger>
                <TabsTrigger value="availability">Profile</TabsTrigger>
              </TabsList>
              <TabsContent value="teams" className="mt-0">
                <DashboardMyTeams
                  teams={teams}
                  onDelete={handleDeleteTeam}
                  onUpdateDiscord={handleUpdateDiscord}
                />
              </TabsContent>
              <TabsContent value="requests" className="mt-0 flex flex-col gap-8">
                <DashboardIncomingApplications
                  applications={applications}
                  onAccept={handleAcceptApplication}
                  onDecline={handleDeclineApplication}
                />
                <DashboardSquadInvitations
                  invitations={invitations}
                  onAccept={handleAcceptInvitation}
                  onDecline={handleDeclineInvitation}
                />
                <SentApplicationsSection sentApplications={sentApplications} />
              </TabsContent>
              <TabsContent value="availability" className="mt-0">
                <DashboardMyAvailability profiles={profiles} onDelete={handleDeleteProfile} />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <footer className="border-t border-border/50 bg-card/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center lg:px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="size-4 text-pink" />
            <span>by</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
              <Gamepad2 className="size-4 text-primary" />
              GameJamCrew
            </span>
          </div>
          <p className="text-xs text-muted-foreground/70">
            {"Connect, create, and ship games together."}
          </p>
        </div>
      </footer>
    </div>
  )
}
