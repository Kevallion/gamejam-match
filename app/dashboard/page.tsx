"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { DashboardMyTeams, type TeamData } from "@/components/dashboard-my-teams"
import { DashboardMyAvailability, type ProfileData } from "@/components/dashboard-my-availability"
import { DashboardIncomingApplications, type ApplicationData } from "@/components/dashboard-incoming-applications"
import { DashboardSquadInvitations, type InvitationData } from "@/components/dashboard-squad-invitations"
import { Footer } from "@/components/footer"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  LayoutDashboard,
  Loader2,
  Rocket,
  Inbox,
  UserCircle,
  MessageCircle,
  Send,
} from "lucide-react"
import { useState as useStateReact } from "react"

// ---------------------------------------------------------------------------
// Style dictionaries (lowercase keys to match Supabase column values)
// ---------------------------------------------------------------------------
const ROLE_STYLES: Record<string, { label: string; emoji: string; color: string }> = {
  developer:    { label: "Developer",      emoji: "💻", color: "bg-teal/15 text-teal" },
  "2d-artist":  { label: "2D Artist",      emoji: "🎨", color: "bg-pink/15 text-pink" },
  "3d-artist":  { label: "3D Artist",      emoji: "🗿", color: "bg-peach/15 text-peach" },
  audio:        { label: "Audio",           emoji: "🎵", color: "bg-lavender/15 text-lavender" },
  writer:       { label: "Writer",          emoji: "✍️", color: "bg-pink/15 text-pink" },
  "game-design":{ label: "Game Designer",  emoji: "🎯", color: "bg-peach/15 text-peach" },
  "ui-ux":      { label: "UI / UX",        emoji: "✨", color: "bg-mint/15 text-mint" },
  qa:           { label: "QA / Playtester",emoji: "🐛", color: "bg-peach/15 text-peach" },
}

const LEVEL_STYLES: Record<string, { label: string; emoji: string; color: string }> = {
  beginner:  { label: "Beginner",  emoji: "🌱", color: "bg-mint/15 text-mint" },
  hobbyist:  { label: "Hobbyist",  emoji: "🛠️", color: "bg-peach/15 text-peach" },
  confirmed: { label: "Confirmed", emoji: "🚀", color: "bg-teal/15 text-teal" },
  veteran:   { label: "Veteran",   emoji: "⭐", color: "bg-lavender/15 text-lavender" },
}

const FALLBACK_ROLE  = { label: "Other", emoji: "❓", color: "bg-muted text-muted-foreground" }
const FALLBACK_LEVEL = LEVEL_STYLES["beginner"]

// ---------------------------------------------------------------------------
// Row mappers
// ---------------------------------------------------------------------------
function mapTeamRow(t: any): TeamData {
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

function mapProfileRow(m: any): ProfileData {
  const rawLevel = (m.experience || "beginner").toLowerCase()
  const rawRole  = (m.role       || "developer").toLowerCase()
  return {
    id: m.id,
    username: m.username || "Anonymous",
    avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${m.username}&backgroundColor=d1d4f9`,
    role:  ROLE_STYLES[rawRole]  ?? { ...FALLBACK_ROLE, label: m.role },
    level: LEVEL_STYLES[rawLevel] ?? FALLBACK_LEVEL,
    engine: m.engine || "",
    language: m.language || "",
    bio: m.bio || "",
    rawRole,
    rawLevel,
    portfolio_link: m.portfolio_link ?? null,
  }
}

function mapApplicationRow(r: any): ApplicationData {
  return {
    id: r.id,
    username: r.sender_name || "A Jammer",
    avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${r.sender_name || "anon"}`,
    teamName: r.teams?.team_name || "Unknown Team",
    role: { label: "Applicant", emoji: "👋", color: "bg-teal/15 text-teal" },
    motivation: r.message || "No motivation provided.",
  }
}

function mapInvitationRow(r: any): InvitationData {
  return {
    id: r.id,
    team_id: r.team_id,
    squadName: r.teams?.team_name || "Unknown Squad",
    discordLink: r.teams?.discord_link ?? null,
  }
}

// ---------------------------------------------------------------------------
// Sent Applications section
// ---------------------------------------------------------------------------
function SentApplicationsSection() {
  const [sentApplications, setSentApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
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
    fetch()
  }, [])

  if (loading) return null

  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <Send className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">My Sent Applications</h2>
          <p className="text-sm text-muted-foreground">Track the status of your requests to join a squad.</p>
        </div>
      </div>

      {sentApplications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
          You haven&apos;t applied to join any squad yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sentApplications.map(app => (
            <div
              key={app.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-background px-4 py-3 shadow-sm"
            >
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
// Page
// ---------------------------------------------------------------------------
export default function DashboardPage() {
  const [teams,       setTeams]       = useState<TeamData[]>([])
  const [profiles,    setProfiles]    = useState<ProfileData[]>([])
  const [applications,setApplications]= useState<ApplicationData[]>([])
  const [invitations, setInvitations] = useState<InvitationData[]>([])
  const [loading,     setLoading]     = useState(true)

  const searchParams  = useSearchParams()
  const router        = useRouter()
  const activeTab     = searchParams.get("tab") || "teams"

  const navigateToTab = useCallback((tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace(`/dashboard?${params.toString()}`, { scroll: false })
  }, [searchParams, router])

  // ── Data loading ──────────────────────────────────────────────────────────
  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { setLoading(false); return }

    const { data: teamsData }   = await supabase
      .from("teams").select("*, team_members(count)").eq("user_id", session.user.id)

    const { data: profilesData } = await supabase
      .from("profiles").select("*").eq("id", session.user.id)

    const { data: appsData } = await supabase
      .from("join_requests")
      .select("*, teams!inner(team_name, user_id)")
      .eq("teams.user_id", session.user.id)
      .eq("status", "pending")
      .eq("type", "application")

    const { data: rawInvitesData } = await supabase
      .from("join_requests")
      .select("id, team_id, status, teams(team_name, discord_link)")
      .eq("sender_id", session.user.id)
      .eq("status", "pending")
      .eq("type", "invitation")

    if (teamsData)       setTeams(teamsData.map(mapTeamRow))
    if (profilesData)    setProfiles(profilesData.map(mapProfileRow))
    if (appsData)        setApplications(appsData.map(mapApplicationRow))
    if (rawInvitesData)  setInvitations(rawInvitesData.map(mapInvitationRow))

    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleDeleteTeam = async (id: string) => {
    await supabase.from("teams").delete().eq("id", id)
    setTeams(prev => prev.filter(t => t.id !== id))
    toast.success("Team deleted.")
  }

  const handleUpdateDiscord = async (id: string, discordLink: string) => {
    const { error } = await supabase.from("teams").update({ discord_link: discordLink }).eq("id", id)
    if (error) throw new Error(error.message)
    setTeams(prev => prev.map(t => t.id === id ? { ...t, discord_link: discordLink } : t))
  }

  const handleDeleteProfile = async (id: string) => {
    await supabase.from("profiles").delete().eq("id", id)
    setProfiles(prev => prev.filter(p => p.id !== id))
    toast.success("Availability profile removed.")
  }

  const handleAcceptApplication = async (id: string) => {
    const { data: request, error: fetchError } = await supabase
      .from("join_requests").select("*").eq("id", id).single()
    if (fetchError || !request) { toast.error("Could not load this application."); return }

    const { error: insertError } = await supabase
      .from("team_members").insert({ team_id: request.team_id, user_id: request.sender_id, role: "member" })
    if (insertError && insertError.code !== "23505") {
      toast.error("Failed to add member: " + insertError.message); return
    }

    await supabase.from("join_requests").update({ status: "accepted" }).eq("id", id)
    setApplications(prev => prev.filter(a => a.id !== id))
    toast.success("Application accepted! The jammer has joined your squad.")
    window.location.reload()
  }

  const handleDeclineApplication = async (id: string) => {
    await supabase.from("join_requests").update({ status: "rejected" }).eq("id", id)
    setApplications(prev => prev.filter(a => a.id !== id))
    toast.info("Application declined.")
  }

  const handleAcceptInvitation = async (invitation: InvitationData) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    const { error: insertError } = await supabase
      .from("team_members").insert({ team_id: invitation.team_id, user_id: session.user.id, role: "member" })
    if (insertError && insertError.code !== "23505") {
      toast.error("Failed to join squad: " + insertError.message); return
    }

    await supabase.from("join_requests").update({ status: "accepted" }).eq("id", invitation.id)
    setInvitations(prev => prev.filter(i => i.id !== invitation.id))
    toast.success(`You joined ${invitation.squadName}!`)
  }

  const handleDeclineInvitation = async (id: string) => {
    await supabase.from("join_requests").update({ status: "rejected" }).eq("id", id)
    setInvitations(prev => prev.filter(i => i.id !== id))
    toast.info("Invitation declined.")
  }

  // ── Loading ───────────────────────────────────────────────────────────────
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

  // ── Derived counts ────────────────────────────────────────────────────────
  const pendingCount = applications.length + invitations.length

  const stats = [
    {
      label: "My Teams",
      value: teams.length,
      icon: Rocket,
      accent: "text-teal",
      bg: "bg-teal/10",
      tab: "teams",
      urgent: false,
    },
    {
      label: "Pending Requests",
      value: pendingCount,
      icon: Inbox,
      accent: "text-peach",
      bg: "bg-peach/10",
      tab: "applications",
      urgent: pendingCount > 0,
    },
    {
      label: "My Profiles",
      value: profiles.length,
      icon: UserCircle,
      accent: "text-lavender",
      bg: "bg-lavender/10",
      tab: "availability",
      urgent: false,
    },
  ]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-4 pb-6 pt-14 lg:px-6 lg:pb-8 lg:pt-20">
          <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
            <div className="absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-peach/20 blur-[120px]" />
            <div className="absolute right-0 top-1/2 size-[400px] -translate-y-1/2 rounded-full bg-teal/15 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-5xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-peach/20 bg-peach/10 px-4 py-1.5 text-sm font-medium text-peach">
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

        {/* ── Stat cards ──────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-4 pb-8 lg:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map(s => (
              <Card
                key={s.label}
                onClick={() => navigateToTab(s.tab)}
                className="group cursor-pointer rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-md"
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={`relative flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${s.bg}`}>
                    <s.icon className={`size-5 ${s.accent}`} />
                    {/* Urgency ping — only for peach card when there are pending items */}
                    {s.urgent && (
                      <span className="absolute -right-1 -top-1 flex size-3">
                        <span className={`absolute inline-flex size-full animate-ping rounded-full ${s.bg} opacity-75`} />
                        <span className={`relative inline-flex size-3 rounded-full ${s.bg} border-2 border-card`} />
                      </span>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="text-2xl font-extrabold tracking-tight text-foreground">
                      {s.value}
                    </span>
                    <span className="truncate text-sm text-muted-foreground">
                      {s.label}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Tabbed content ──────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-4 pb-16 lg:px-6 lg:pb-24">
          <Tabs value={activeTab} onValueChange={navigateToTab}>

            <TabsList className="mb-8 h-11 w-full rounded-xl bg-secondary/60 p-1">
              <TabsTrigger
                value="teams"
                className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <Rocket className="size-4" />
                <span className="hidden sm:inline">My Teams</span>
                <span className="sm:hidden">Teams</span>
              </TabsTrigger>

              <TabsTrigger
                value="applications"
                className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <Inbox className="size-4" />
                <span className="hidden sm:inline">Applications</span>
                <span className="sm:hidden">Apps</span>
                {pendingCount > 0 && (
                  <span className="ml-0.5 inline-flex size-5 items-center justify-center rounded-full bg-peach/20 text-[10px] font-bold text-peach">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="availability"
                className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <UserCircle className="size-4" />
                <span className="hidden sm:inline">My Availability</span>
                <span className="sm:hidden">Profile</span>
              </TabsTrigger>
            </TabsList>

            {/* My Teams */}
            <TabsContent value="teams">
              <DashboardMyTeams
                teams={teams}
                onDelete={handleDeleteTeam}
                onUpdateDiscord={handleUpdateDiscord}
              />
            </TabsContent>

            {/* Applications — incoming + squad invitations + sent */}
            <TabsContent value="applications">
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

            {/* Availability */}
            <TabsContent value="availability">
              <DashboardMyAvailability
                profiles={profiles}
                onDelete={handleDeleteProfile}
              />
            </TabsContent>

          </Tabs>
        </section>

      </main>

      <Footer />
    </div>
  )
}
