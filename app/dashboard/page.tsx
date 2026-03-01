"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { DashboardMyTeams, type TeamData } from "@/components/dashboard-my-teams"
import { DashboardMyAvailability, type ProfileData } from "@/components/dashboard-my-availability"
// IMPORT DU NOUVEAU COMPOSANT
import { DashboardIncomingApplications, type ApplicationData } from "@/components/dashboard-incoming-applications"
import { Gamepad2, Heart, LayoutDashboard, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"


// ---------------------------------------------------------------------------
// Dictionnaires de styles (Clés en minuscules pour matcher Supabase)
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

export default function DashboardPage() {
  const [teams, setTeams] = useState<TeamData[]>([])
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  // NOUVEAU STATE POUR LES CANDIDATURES
  const [applications, setApplications] = useState<ApplicationData[]>([])
  const [loading, setLoading] = useState(true)

  // --- Helpers de mapping (pour transformer les lignes Supabase en props propres) ---
  const mapTeamRow = (t: any): TeamData => {
    let parsed: any[] = []
    try { parsed = JSON.parse(t.looking_for || "[]") } catch { parsed = [] }
    const rawLevel = (parsed[0]?.level || "beginner").toLowerCase()

    return {
      id: t.id,
      name: t.team_name || "Unnamed",
      jam: t.jam_name || "",
      engine: t.engine || "",
      language: t.language || "",
      description: t.project_description || "",
      members: (t.team_members?.[0]?.count ?? 0) + 1,
      maxMembers: 1 + parsed.length,
      roles: parsed.map((r: any) => ROLE_STYLES[r.role?.toLowerCase()] ?? { ...FALLBACK_ROLE, label: r.role }),
      level: LEVEL_STYLES[rawLevel] ?? FALLBACK_LEVEL,
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
    }
  }

  // NOUVEAU MAPPER POUR LES DEMANDES DE RECRUTEMENT
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

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { setLoading(false); return }

    // On inclut team_members(count) dans la requête pour connaître le nombre de membres (hors créateur)
    const { data: teamsData } = await supabase
      .from("teams")
      .select("*, team_members(count)")
      .eq("user_id", session.user.id)

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
    
    // NOUVELLE REQUÊTE : On va chercher les gens qui veulent rejoindre tes équipes
    const { data: appsData } = await supabase
      .from("join_requests")
      .select("*, teams!inner(team_name, user_id)")
      .eq("teams.user_id", session.user.id)
      .eq("status", "pending")

    if (teamsData) setTeams(
      teamsData.map((t: any) => {
        // On récupère le nombre de membres et ajoute 1 (le créateur)
        let parsed: any[] = []
        try { parsed = JSON.parse(t.looking_for || "[]") } catch { parsed = [] }
        const rawLevel = (parsed[0]?.level || "beginner").toLowerCase()
        const membersCount = (t.team_members?.[0]?.count ?? 0) + 1 // +1 pour le créateur

        return {
          id: t.id,
          name: t.team_name || "Unnamed",
          jam: t.jam_name || "",
          engine: t.engine || "",
          language: t.language || "",
          description: t.project_description || "",
          members: membersCount,
          maxMembers: 1 + parsed.length,
          roles: parsed.map((r: any) => ROLE_STYLES[r.role?.toLowerCase()] ?? { ...FALLBACK_ROLE, label: r.role }),
          level: LEVEL_STYLES[rawLevel] ?? FALLBACK_LEVEL,
        }
      })
    )
    if (profilesData) setProfiles(profilesData.map(mapProfileRow))
    if (appsData) setApplications(appsData.map(mapApplicationRow))
    
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleDeleteTeam = async (id: string | number) => {
    if (!confirm("Delete this team?")) return
    await supabase.from("teams").delete().eq("id", id)
    setTeams((prev) => prev.filter((t) => t.id !== id))
  }

  const handleDeleteProfile = async (id: string | number) => {
    if (!confirm("Delete this profile?")) return
    await supabase.from("profiles").delete().eq("id", id)
    setProfiles((prev) => prev.filter((p) => p.id !== id))
  }

  // NOUVELLES FONCTIONS : ACCEPTER / REFUSER
  const handleAcceptApplication = async (id: string | number) => {
    // 1. Récupération
    const { data: request, error: fetchError } = await supabase
      .from("join_requests")
      .select("*")
      .eq("id", id)
      .single()
  
    if (fetchError || !request) {
      alert("Erreur lecture demande: " + fetchError?.message)
      return
    }
  
    // 2. Insertion Forcée
    // On s'assure que team_id est bien un nombre pour le int8
    const teamIdInt = parseInt(String(request.team_id), 10)
    
    const { error: insertError } = await supabase
      .from("team_members")
      .insert({
        team_id: teamIdInt,
        user_id: request.sender_id,
        role: 'member'
      })
  
    if (insertError) {
      // Si l'erreur est "duplicate key", c'est que le membre y est déjà, on continue
      if (insertError.code !== '23505') {
        alert("Erreur Insertion Membre: " + insertError.message)
        return
      }
    }
  
    // 3. Mise à jour statut
    await supabase
      .from("join_requests")
      .update({ status: 'accepted' })
      .eq("id", id)
  
    // 4. UI
    setApplications((prev) => prev.filter((a) => a.id !== id))
    alert("Succès ! Vérifie la table team_members maintenant.")

    // ICI : On force le composant à re-télécharger les données de l'équipe
    window.location.reload()
  }

  const handleDeclineApplication = async (id: string | number) => {
    await supabase.from("join_requests").update({ status: 'declined' }).eq("id", id)
    setApplications((prev) => prev.filter((a) => a.id !== id))
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
        {/* Hero header */}
        <section className="relative overflow-hidden px-4 pb-8 pt-16 lg:px-6 lg:pt-24 lg:pb-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            aria-hidden="true"
          >
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
              Manage your teams, track your availability, and keep your jam life
              organized all in one place.
            </p>
          </div>
        </section>

        {/* Content sections - même structure que TeamGrid / MembersGrid */}
        <section className="px-4 pb-16 pt-4 lg:px-6 lg:pb-24">
          <div className="mx-auto max-w-6xl flex flex-col gap-16">
            <DashboardMyTeams teams={teams} onDelete={handleDeleteTeam} />
            <DashboardIncomingApplications
              applications={applications}
              onAccept={handleAcceptApplication}
              onDecline={handleDeclineApplication}
            />
            <DashboardMyAvailability profiles={profiles} onDelete={handleDeleteProfile} />
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