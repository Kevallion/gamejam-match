"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { DashboardMyTeams, type TeamData } from "@/components/dashboard-my-teams"
import { DashboardMyAvailability, type ProfileData } from "@/components/dashboard-my-availability"
import { DashboardIncomingApplications, type ApplicationData } from "@/components/dashboard-incoming-applications"
import { DashboardSquadInvitations, type InvitationData } from "@/components/dashboard-squad-invitations"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Gamepad2, Heart, LayoutDashboard, MessageCircle, Send,
  Rocket, Inbox, UserCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

// ---------------------------------------------------------------------------
// Dictionnaires de styles
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Stat card — at-a-glance overview above the tabs
// ---------------------------------------------------------------------------
type StatCardColor = "teal" | "peach" | "lavender"

const STAT_COLOR_MAP: Record<StatCardColor, { bg: string; text: string; border: string; glow: string }> = {
  teal:     { bg: "bg-teal/10",     text: "text-teal",     border: "border-teal/20",     glow: "shadow-teal/5" },
  peach:    { bg: "bg-peach/10",    text: "text-peach",    border: "border-peach/20",    glow: "shadow-peach/5" },
  lavender: { bg: "bg-lavender/10", text: "text-lavender", border: "border-lavender/20", glow: "shadow-lavender/5" },
}

function StatCard({
  label,
  sublabel,
  value,
  icon: Icon,
  color,
  onClick,
  urgent,
}: {
  label: string
  sublabel: string
  value: number
  icon: React.ElementType
  color: StatCardColor
  onClick?: () => void
  urgent?: boolean
}) {
  const c = STAT_COLOR_MAP[color]
  return (
    <button
      type="button"
      onClick={onClick}
      className={`card-interactive group w-full text-left flex items-center gap-4 rounded-2xl border ${c.border} bg-card p-5 shadow-sm transition-all duration-300 ${onClick ? "cursor-pointer hover:shadow-md" : "cursor-default"}`}
    >
      <div className={`relative flex size-12 shrink-0 items-center justify-center rounded-xl ${c.bg} transition-transform duration-300 group-hover:scale-110`}>
        <Icon className={`size-6 ${c.text}`} />
        {urgent && value > 0 && (
          <span className="absolute -right-1 -top-1 flex size-3">
            <span className={`absolute inline-flex size-full animate-ping rounded-full ${c.bg} opacity-75`} />
            <span className={`relative inline-flex size-3 rounded-full ${c.bg} border-2 border-card`} />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-3xl font-extrabold tabular-nums leading-none ${c.text}`}>{value}</p>
        <p className="mt-1 truncate text-sm font-semibold text-foreground">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{sublabel}</p>
      </div>
      {onClick && (
        <svg
          className={`size-4 shrink-0 ${c.text} opacity-0 transition-opacity duration-200 group-hover:opacity-60`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Skeleton loading — mirrors the real layout with animated placeholders
// ---------------------------------------------------------------------------
function SkeletonPulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-secondary/50 ${className}`} />
}

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 pb-6 pt-16 lg:px-6 lg:pb-8 lg:pt-24">
          <div className="mx-auto max-w-6xl space-y-4">
            <SkeletonPulse className="h-7 w-40" />
            <SkeletonPulse className="h-12 w-56" />
            <SkeletonPulse className="h-5 w-80" />
          </div>
        </section>
        {/* Stat cards */}
        <section className="px-4 pb-6 pt-2 lg:px-6">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-5">
                <SkeletonPulse className="size-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <SkeletonPulse className="h-8 w-10" />
                  <SkeletonPulse className="h-4 w-24" />
                  <SkeletonPulse className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* Tabs + cards */}
        <section className="px-4 pb-16 pt-4 lg:px-6 lg:pb-24">
          <div className="mx-auto max-w-6xl space-y-6">
            <SkeletonPulse className="h-11 w-full rounded-xl" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <SkeletonPulse key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sent Applications section (used inside Applications tab)
// ---------------------------------------------------------------------------
function SentApplicationsSection() {
  const [sentApplications, setSentApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSentApplications = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { setLoading(false); return }
      
      const { data, error } = await supabase
        .from("join_requests")
        .select("id, status, teams(team_name, discord_link)")
        .eq("sender_id", session.user.id)
        .eq("type", "application")
      
      if (!error && data) setSentApplications(data)
      setLoading(false)
    }
    fetchSentApplications()
  }, [])

  if (loading) return null

  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Send className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">My Sent Applications</h2>
            <p className="text-sm text-muted-foreground">Track the status of your requests to join a squad.</p>
          </div>
        </div>
      </div>

      {sentApplications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
          You haven&apos;t applied to join any squad yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sentApplications.map(app => (
            <div key={app.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-background px-4 py-3 shadow-sm">
              <span className="font-medium text-foreground">
                {app.teams?.team_name || "Unknown Squad"}
              </span>

              <div className="flex items-center gap-3">
                {app.status === "pending" && (
                  <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    Pending
                  </span>
                )}
                {app.status === "rejected" && (
                  <span className="status-error rounded-lg px-2.5 py-1 text-xs font-medium">
                    Declined
                  </span>
                )}
                {app.status === "accepted" && (
                  <span className="status-success rounded-lg px-2.5 py-1 text-xs font-medium">
                    Accepted
                  </span>
                )}

                {app.status === "accepted" && app.teams?.discord_link && (
                  <a
                    href={app.teams.discord_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#5865F2]/90 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#5865F2]"
                  >
                    <MessageCircle className="size-3.5" />
                    Join Discord
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// PAGE PRINCIPALE DU DASHBOARD
// ---------------------------------------------------------------------------
export default function DashboardPage() {
  const [teams, setTeams] = useState<TeamData[]>([])
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [applications, setApplications] = useState<ApplicationData[]>([])
  const [invitations, setInvitations] = useState<InvitationData[]>([])
  const [loading, setLoading] = useState(true)

  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get("tab") || "squads"

  const navigateToTab = useCallback((tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace(`/dashboard?${params.toString()}`, { scroll: false })
  }, [searchParams, router])

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
    return {
      id: r.id,
      username: r.sender_name || "A Jammer",
      avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${r.sender_name || 'anon'}`,
      teamName: r.teams?.team_name || "Unknown Team",
      role: { label: "Applicant", emoji: "👋", color: "bg-teal/15 text-teal" },
      motivation: r.message || "No motivation provided.",
    }
  }

  const mapInvitationRow = (r: any): InvitationData => ({
    id: r.id,
    team_id: r.team_id,
    squadName: r.teams?.team_name || "Unknown Squad",
    discordLink: r.teams?.discord_link ?? null,
  })

  const loadData = async () => {
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
      .select("*, teams!inner(team_name, user_id)")
      .eq("teams.user_id", session.user.id)
      .eq("status", "pending")
      .eq("type", "application")

    // Invitations: records created by a Squad Leader targeting the current user
    const { data: rawInvitesData } = await supabase
      .from("join_requests")
      .select("id, team_id, status, teams(team_name, discord_link)")
      .eq("sender_id", session.user.id)
      .eq("status", "pending")
      .eq("type", "invitation")

    if (teamsData) setTeams(teamsData.map(mapTeamRow))
    if (profilesData) setProfiles(profilesData.map(mapProfileRow))
    if (appsData) setApplications(appsData.map(mapApplicationRow))

    if (rawInvitesData) {
      setInvitations(rawInvitesData.map(mapInvitationRow))
    }
    
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleDeleteTeam = async (id: string) => {
    await supabase.from("teams").delete().eq("id", id)
    setTeams((prev) => prev.filter((t) => t.id !== id))
    toast.success("Team deleted.")
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
  }

  const handleDeleteProfile = async (id: string) => {
    await supabase.from("profiles").delete().eq("id", id)
    setProfiles((prev) => prev.filter((p) => p.id !== id))
    toast.success("Availability profile removed.")
  }

  const handleAcceptApplication = async (id: string) => {
    const { data: request, error: fetchError } = await supabase
      .from("join_requests")
      .select("*")
      .eq("id", id)
      .single()
  
    if (fetchError || !request) {
      toast.error("Could not load this application. Please try again.")
      return
    }
  
    const { error: insertError } = await supabase
      .from("team_members")
      .insert({
        team_id: request.team_id,
        user_id: request.sender_id,
        role: 'member'
      })
  
    if (insertError && insertError.code !== '23505') {
      toast.error("Failed to add member: " + insertError.message)
      return
    }
  
    await supabase
      .from("join_requests")
      .update({ status: 'accepted' })
      .eq("id", id)
  
    setApplications((prev) => prev.filter((a) => a.id !== id))
    toast.success("Application accepted! The jammer has joined your squad.")
    window.location.reload()
  }

  const handleDeclineApplication = async (id: string) => {
    await supabase.from("join_requests").update({ status: 'rejected' }).eq("id", id)
    setApplications((prev) => prev.filter((a) => a.id !== id))
    toast.info("Application declined.")
  }

  const handleAcceptInvitation = async (invitation: InvitationData) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    const { error: insertError } = await supabase
      .from("team_members")
      .insert({ team_id: invitation.team_id, user_id: session.user.id, role: "member" })

    if (insertError && insertError.code !== "23505") {
      toast.error("Failed to join squad: " + insertError.message)
      return
    }

    await supabase
      .from("join_requests")
      .update({ status: "accepted" })
      .eq("id", invitation.id)

    setInvitations((prev) => prev.filter((i) => i.id !== invitation.id))
    toast.success(`You joined ${invitation.squadName}!`)
  }

  const handleDeclineInvitation = async (id: string) => {
    await supabase.from("join_requests").update({ status: "rejected" }).eq("id", id)
    setInvitations((prev) => prev.filter((i) => i.id !== id))
    toast.info("Invitation declined.")
  }

  if (loading) return <DashboardSkeleton />

  const pendingCount = applications.length + invitations.length

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-4 pb-6 pt-16 lg:px-6 lg:pt-24 lg:pb-8">
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

        {/* ── At-a-glance stat cards ────────────────────────────────────── */}
        <section className="px-4 pb-6 pt-2 lg:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label="My Teams"
                sublabel={teams.length === 1 ? "team created" : "teams created"}
                value={teams.length}
                icon={Rocket}
                color="teal"
                onClick={() => navigateToTab("squads")}
              />
              <StatCard
                label="Pending Requests"
                sublabel={pendingCount === 1 ? "action needed" : "actions needed"}
                value={pendingCount}
                icon={Inbox}
                color="peach"
                onClick={() => navigateToTab("applications")}
                urgent={pendingCount > 0}
              />
              <StatCard
                label="My Profiles"
                sublabel={profiles.length === 1 ? "availability posted" : "availabilities posted"}
                value={profiles.length}
                icon={UserCircle}
                color="lavender"
                onClick={() => navigateToTab("availability")}
              />
            </div>
          </div>
        </section>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <section className="px-4 pb-16 pt-4 lg:px-6 lg:pb-24">
          <div className="mx-auto max-w-6xl">
            <Tabs value={activeTab} onValueChange={navigateToTab} className="gap-0">

              {/* Tab bar */}
              <TabsList className="mb-8 h-11 w-full rounded-xl bg-secondary/60 p-1">
                <TabsTrigger
                  value="squads"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold
                    data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm
                    data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
                >
                  <Rocket className="size-4" />
                  <span className="hidden sm:inline">My Teams</span>
                  {teams.length > 0 && (
                    <Badge className="ml-0.5 border-0 bg-teal/15 px-1.5 text-xs font-bold text-teal">
                      {teams.length}
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="applications"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold
                    data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm
                    data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
                >
                  <Inbox className="size-4" />
                  <span className="hidden sm:inline">Applications</span>
                  {pendingCount > 0 && (
                    <Badge className="ml-0.5 border-0 bg-peach/15 px-1.5 text-xs font-bold text-peach">
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="availability"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold
                    data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm
                    data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
                >
                  <UserCircle className="size-4" />
                  <span className="hidden sm:inline">My Availability</span>
                  {profiles.length > 0 && (
                    <Badge className="ml-0.5 border-0 bg-lavender/15 px-1.5 text-xs font-bold text-lavender">
                      {profiles.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* My Squads tab */}
              <TabsContent value="squads" className="mt-0">
                <DashboardMyTeams
                  teams={teams}
                  onDelete={handleDeleteTeam}
                  onUpdateDiscord={handleUpdateDiscord}
                />
              </TabsContent>

              {/* Requests tab — incoming apps + squad invitations + sent apps */}
              <TabsContent value="applications" className="mt-0">
                <div className="flex flex-col gap-12">
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
                  <SentApplicationsSection />
                </div>
              </TabsContent>

              {/* Availability tab */}
              <TabsContent value="availability" className="mt-0">
                <DashboardMyAvailability
                  profiles={profiles}
                  onDelete={handleDeleteProfile}
                />
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
              JamSquad
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