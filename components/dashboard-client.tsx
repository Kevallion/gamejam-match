"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DashboardMyTeams, type TeamData } from "@/components/dashboard-my-teams"
import { DashboardMyAvailability } from "@/components/dashboard-my-availability"
import { DashboardIncomingApplications, type ApplicationData } from "@/components/dashboard-incoming-applications"
import { DashboardSquadInvitations, type InvitationData } from "@/components/dashboard-squad-invitations"
import { Gamepad2, LayoutDashboard, Loader2, MessageCircle, Send, Users, Bell, UserCircle, UserMinus, Trash2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { supabase } from "@/lib/supabase"
import { notifyCandidateAccepted } from "@/app/actions/team-actions"
import type { Session } from "@supabase/supabase-js"
import { toast } from "sonner"
import { EXPERIENCE_STYLES, ROLE_STYLES } from "@/lib/constants"

const LEVEL_STYLES = EXPERIENCE_STYLES
const FALLBACK_ROLE = { label: "Other", emoji: "❓", color: "bg-muted text-muted-foreground" }
const FALLBACK_LEVEL = EXPERIENCE_STYLES["beginner"]

type SentApp = { id: string; status: string; target_role?: string; teams?: { team_name?: string; discord_link?: string } }

export type AvailabilityPostRow = {
  id: string
  user_id: string
  availability: string
  username?: string | null
  role?: string | null
  experience?: string | null
  jam_style?: string | null
  engine?: string | null
  language?: string | null
  bio?: string | null
  portfolio_link?: string | null
  avatar_url?: string | null
}

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
                    <span className="rounded bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                      Declined
                    </span>
                  )}
                  {app.status === "accepted" && (
                    <span className="rounded bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
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
  const [session, setSession] = useState<Session | null>(null)
  const [teams, setTeams] = useState<TeamData[]>([])
  const [availabilityPosts, setAvailabilityPosts] = useState<AvailabilityPostRow[]>([])
  const [applications, setApplications] = useState<ApplicationData[]>([])
  const [invitations, setInvitations] = useState<InvitationData[]>([])
  const [sentApplications, setSentApplications] = useState<SentApp[]>([])
  const [loading, setLoading] = useState(true)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [availabilityModalContext, setAvailabilityModalContext] = useState<string | null>(null)
  const [hasShownAvailabilityPrompt, setHasShownAvailabilityPrompt] = useState(false)
  const [teamIdToDelete, setTeamIdToDelete] = useState<string | null>(null)
  const [availabilityPostIdToDelete, setAvailabilityPostIdToDelete] = useState<string | null>(null)

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

  const mapApplicationRow = (r: any, profileMap: Record<string, { username?: string; avatar_url?: string }>): ApplicationData => {
    const targetRole = r.target_role
      ? (ROLE_STYLES[r.target_role] ?? { label: r.target_role, emoji: "🎭", color: "bg-muted text-muted-foreground" })
      : { label: "Applicant", emoji: "👋", color: "bg-teal/15 text-teal" }
    const profile = r.sender_id ? profileMap[r.sender_id] : null
    const username = profile?.username || r.sender_name || "A Jammer"
    const avatarUrl =
      profile?.avatar_url ||
      `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(username)}`
    return {
      id: r.id,
      username,
      avatarUrl,
      teamName: r.teams?.team_name || "Unknown Team",
      role: targetRole,
      motivation: r.message || "No motivation provided.",
      createdAt: r.created_at,
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
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession?.user) { setLoading(false); return }
      setSession(authSession)

      const { data: teamsData } = await supabase
      .from("teams")
      .select("*, team_members(count)")
      .eq("user_id", authSession.user.id)

    const { data: appsData } = await supabase
      .from("join_requests")
      .select("*, target_role, teams!inner(team_name, user_id)")
      .eq("teams.user_id", authSession.user.id)
      .eq("status", "pending")
      .eq("type", "application")

    // Fetch sender profiles for username and avatar
    const senderIds = [...new Set((appsData || []).map((a: any) => a.sender_id).filter(Boolean))]
    const profileMap: Record<string, { username?: string; avatar_url?: string }> = {}
    if (senderIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", senderIds)
      for (const p of profilesData || []) {
        profileMap[p.id] = { username: p.username, avatar_url: p.avatar_url ?? undefined }
      }
    }

    const { data: rawInvitesData } = await supabase
      .from("join_requests")
      .select("id, team_id, status, target_role, teams(team_name, game_name, discord_link)")
      .eq("sender_id", authSession.user.id)
      .eq("status", "pending")
      .eq("type", "invitation")

    const { data: sentAppsData } = await supabase
      .from("join_requests")
      .select("id, status, target_role, teams(team_name, discord_link)")
      .eq("sender_id", authSession.user.id)
      .eq("type", "application")

    const discordAvatarUrl = authSession.user.user_metadata?.avatar_url ?? null

    if (teamsData) setTeams(teamsData.map(mapTeamRow))

    const { data: postsData } = await supabase
      .from("availability_posts")
      .select("id, user_id, availability, username, role, experience, jam_style, engine, language, bio, portfolio_link, avatar_url")
      .eq("user_id", authSession.user.id)
      .order("updated_at", { ascending: false })
    if (postsData) setAvailabilityPosts(postsData as AvailabilityPostRow[])
    if (appsData) setApplications(appsData.map((r: any) => mapApplicationRow(r, profileMap)))
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

  // Offer to disable availability when user has joined a team (application accepted)
  // Persist in localStorage so the prompt is not shown again after the user has responded (e.g. on refresh)
  useEffect(() => {
    if (loading) return
    const userId = session?.user?.id
    const storageKey = userId ? `gamejam_availability_prompt_seen_${userId}` : null
    if (storageKey && typeof window !== "undefined") {
      const alreadySeen = localStorage.getItem(storageKey) === "true"
      if (alreadySeen) {
        setHasShownAvailabilityPrompt(true)
        return
      }
    }
    if (hasShownAvailabilityPrompt) return
    const hasAcceptedApp = sentApplications.some((a) => a.status === "accepted")
    const hasAvailability = availabilityPosts.length > 0
    if (hasAcceptedApp && hasAvailability) {
      setAvailabilityModalContext(null)
      setShowAvailabilityModal(true)
      setHasShownAvailabilityPrompt(true)
      if (storageKey && typeof window !== "undefined") {
        localStorage.setItem(storageKey, "true")
      }
    }
  }, [loading, session?.user?.id, sentApplications, availabilityPosts, hasShownAvailabilityPrompt])

  const handleDeleteTeam = async (id: string) => {
    try {
      const { error } = await supabase.from("teams").delete().eq("id", id)
      if (error) {
        toast.error("Could not delete the team.", { description: error.message })
        return
      }
      setTeams((prev) => prev.filter((t) => t.id !== id))
      setTeamIdToDelete(null)
      toast.success("Team deleted.")
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    }
  }

  const handleDeleteTeamClick = (id: string) => {
    setTeamIdToDelete(id)
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

  const handleRenewTeam = async (id: string) => {
    const { error } = await supabase
      .from("teams")
      .update({ expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() })
      .eq("id", id)

    if (error) throw new Error(error.message)
    loadData()
    toast.success("Listing renewed.", { description: "Your listing is now visible for another 30 days." })
  }

  const handleDeleteAvailabilityPost = async (postId: string) => {
    try {
      const { error } = await supabase.from("availability_posts").delete().eq("id", postId)
      if (error) {
        toast.error("Could not remove announcement.", { description: error.message })
        return
      }
      setAvailabilityPosts((prev) => prev.filter((p) => p.id !== postId))
      setAvailabilityPostIdToDelete(null)
      toast.success("Announcement removed.")
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    }
  }

  const handleDeleteAvailabilityPostClick = (postId: string) => {
    setAvailabilityPostIdToDelete(postId)
  }

  const handleAcceptApplication = async (id: string) => {
    try {
      const { data: request, error: fetchError } = await supabase
        .from("join_requests")
        .select("id, team_id, sender_id, sender_name, target_role, teams(team_name)")
        .eq("id", id)
        .single()

      if (fetchError || !request) {
        toast.error("Could not read the request.", { description: fetchError?.message })
        return
      }

      // Race condition guard: verify role slot is still open before accepting
      const targetRole = request.target_role
      const { data: teamData } = await supabase
        .from("teams")
        .select("looking_for")
        .eq("id", request.team_id)
        .single()

      const lookingFor = Array.isArray(teamData?.looking_for) ? teamData.looking_for : []
      const slotsForRole = lookingFor.filter((r: { role?: string }) => (r?.role || "").toLowerCase() === (targetRole || "").toLowerCase()).length
      if (slotsForRole === 0) {
        toast.error("Role no longer available.", { description: "This role may have been filled. Please refresh." })
        return
      }

      const { data: existingAccepted } = await supabase
        .from("join_requests")
        .select("id")
        .eq("team_id", request.team_id)
        .eq("status", "accepted")
        .eq("type", "application")
        .eq("target_role", targetRole)

      const acceptedForRole = existingAccepted?.length ?? 0
      if (acceptedForRole >= slotsForRole) {
        toast.error("Role already filled.", { description: "Someone else was accepted for this role. Please refresh." })
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

      // Notification e-mail au candidat (asynchrone, non bloquant)
      const teamName = (request as { teams?: { team_name?: string } }).teams?.team_name
      if (request.sender_id && teamName) {
        void notifyCandidateAccepted(request.sender_id, teamName)
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
      loadData() // Refresh sent applications
      toast.success(`You joined ${invitation.squadName}!`, {
        description: invitation.discordLink ? "Check the Discord link to connect." : undefined,
      })
      setAvailabilityModalContext(invitation.squadName)
      setHasShownAvailabilityPrompt(true)
      setShowAvailabilityModal(true)
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    }
  }

  const persistAvailabilityPromptSeen = () => {
    const userId = session?.user?.id
    if (userId && typeof window !== "undefined") {
      localStorage.setItem(`gamejam_availability_prompt_seen_${userId}`, "true")
    }
  }

  const handleAvailabilityModalConfirm = async () => {
    if (!session?.user) return
    persistAvailabilityPromptSeen()
    try {
      const { error } = await supabase
        .from("availability_posts")
        .delete()
        .eq("user_id", session.user.id)
      if (error) {
        toast.error("Could not update your profile.", { description: error.message })
        return
      }
      setAvailabilityPosts([])
      toast.success("You're no longer on the Available Players list.")
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    } finally {
      setShowAvailabilityModal(false)
      setAvailabilityModalContext(null)
    }
  }

  const handleAvailabilityModalCancel = () => {
    persistAvailabilityPromptSeen()
    setShowAvailabilityModal(false)
    setAvailabilityModalContext(null)
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
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
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
              <Card className="col-span-2 sm:col-span-1">
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-lavender/15">
                    <UserCircle className="size-6 text-lavender" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Availability</p>
                    <p className="text-2xl font-bold">{availabilityPosts.length}</p>
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
                  onDelete={handleDeleteTeamClick}
                  onUpdateDiscord={handleUpdateDiscord}
                  onRenew={handleRenewTeam}
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
                <DashboardMyAvailability
                  availabilityPosts={availabilityPosts}
                  onDeletePost={handleDeleteAvailabilityPostClick}
                  discordAvatarUrl={session?.user?.user_metadata?.avatar_url ?? null}
                />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer tagline="Connect, create, and ship games together." />

      <AlertDialog open={showAvailabilityModal} onOpenChange={(open) => !open && handleAvailabilityModalCancel()}>
        <AlertDialogContent className="rounded-2xl border-border/60">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-green-500/15">
                <UserMinus className="size-5 text-green-600" />
              </div>
              <AlertDialogTitle className="text-left">
                Congratulations! You&apos;ve joined the team.
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              {availabilityModalContext ? (
                <>You&apos;ve joined {availabilityModalContext}. </>
              ) : null}
              Would you like to remove your profile from the &quot;Available Players&quot; list to stop receiving requests?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:justify-end">
            <AlertDialogCancel onClick={handleAvailabilityModalCancel}>
              No, keep it
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAvailabilityModalConfirm} className="bg-primary">
              Yes, remove me
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={teamIdToDelete !== null} onOpenChange={(open) => !open && setTeamIdToDelete(null)}>
        <AlertDialogContent className="rounded-2xl border-border/60">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/15">
                <Trash2 className="size-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-left">Delete this team?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              This action cannot be undone. The team listing will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => teamIdToDelete && handleDeleteTeam(teamIdToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={availabilityPostIdToDelete !== null} onOpenChange={(open) => !open && setAvailabilityPostIdToDelete(null)}>
        <AlertDialogContent className="rounded-2xl border-border/60">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/15">
                <Trash2 className="size-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-left">Remove this availability announcement?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              Your announcement will be removed from the Available Players list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => availabilityPostIdToDelete && handleDeleteAvailabilityPost(availabilityPostIdToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
