"use client"

import { useEffect, useState } from "react"
import { TeamCard, type TeamCardData } from "@/components/team-card"
import { supabase } from "@/lib/supabase"

const ROLE_STYLES: Record<string, any> = {
  developer: { label: "Developer", emoji: "💻", color: "bg-teal/15 text-teal" },
  "2d-artist": { label: "2D Artist", emoji: "🎨", color: "bg-pink/15 text-pink" },
  "3d-artist": { label: "3D Artist", emoji: "🗿", color: "bg-peach/15 text-peach" },
  audio: { label: "Audio", emoji: "🎵", color: "bg-lavender/15 text-lavender" },
  writer: { label: "Writer", emoji: "✍️", color: "bg-pink/15 text-pink" },
  "game-design": { label: "Game Designer", emoji: "🎯", color: "bg-peach/15 text-peach" },
  "ui-ux": { label: "UI / UX", emoji: "✨", color: "bg-mint/15 text-mint" },
  qa: { label: "QA / Playtester", emoji: "🐛", color: "bg-peach/15 text-peach" },
}

const LEVEL_STYLES: Record<string, any> = {
  beginner: { label: "Beginner", emoji: "🌱", color: "bg-mint/15 text-mint" },
  hobbyist: { label: "Hobbyist", emoji: "🛠️", color: "bg-peach/15 text-peach" },
  confirmed: { label: "Confirmed", emoji: "🚀", color: "bg-teal/15 text-teal" },
  veteran: { label: "Veteran", emoji: "⭐", color: "bg-lavender/15 text-lavender" },
}

// Les propriétés reçues de la page d'accueil
interface TeamGridProps {
  searchQuery: string
  engineFilter: string
  roleFilter: string
  levelFilter: string
  languageFilter: string
}

export function TeamGrid({ searchQuery = "", engineFilter = "all", roleFilter = "all", levelFilter = "all", languageFilter = "all" }: TeamGridProps) {
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getTeams() {
      // CHANGEMENT 1 : On demande l'ID des membres (plus fiable que count)
      const { data, error } = await supabase.from('teams').select('*, team_members(id)').order('created_at', { ascending: false })

      if (!error && data) {
        const formattedTeams = data.map((t) => {
          let parsedRoles: any[] = []
          try { parsedRoles = JSON.parse(t.looking_for || "[]") } catch (e) { parsedRoles = [] }

          const roleBadges = parsedRoles.map((r: any) => 
            ROLE_STYLES[r.role] || { label: r.role, emoji: "❓", color: "bg-gray-500/10 text-gray-500" }
          )

          const mainLevel = parsedRoles.length > 0 ? parsedRoles[0].level : "beginner"
          const levelBadge = LEVEL_STYLES[mainLevel] || LEVEL_STYLES["beginner"]
          
          // CHANGEMENT 2 : On compte simplement la taille du tableau renvoyé !
          const acceptedMembersCount = t.team_members ? t.team_members.length : 0

          // DEBUG : On affiche ce qu'on reçoit dans la console
          console.log(`L'équipe "${t.team_name}" a ${acceptedMembersCount} membre(s) en base :`, t.team_members)

          return {
            id: t.id,
            name: t.team_name || "Unknown Team",
            jam: t.jam_name || "Unknown Jam",
            engine: t.engine || "Unknown",
            language: t.language || "Unknown",
            description: t.project_description || "",
            rawRoles: parsedRoles,
            
            // 1 (le créateur) + les membres acceptés
            members: 1 + acceptedMembersCount, 
            
            maxMembers: 1 + parsedRoles.length, 
            roles: roleBadges,
            level: levelBadge,
          }
        })
        setTeams(formattedTeams)
      } else if (error) {
        console.error("Erreur Supabase :", error)
      }
      setLoading(false)
    }
    getTeams()
  }, [])

  // 🚀 LE FILTRE DES ÉQUIPES EN TEMPS RÉEL
  const displayedTeams = teams.filter((t) => {
    const searchLower = searchQuery.toLowerCase()
    const matchSearch = t.name.toLowerCase().includes(searchLower) || 
                        t.jam.toLowerCase().includes(searchLower) ||
                        t.description.toLowerCase().includes(searchLower)

    const matchEngine = engineFilter === "all" || String(t.engine).toLowerCase() === engineFilter.toLowerCase()
    const matchLanguage = languageFilter === "all" || String(t.language).toLowerCase() === languageFilter.toLowerCase()

    const matchRole = roleFilter === "all" || t.rawRoles.some((r: any) => r.role.toLowerCase() === roleFilter.toLowerCase())
    const matchLevel = levelFilter === "all" || t.rawRoles.some((r: any) => r.level.toLowerCase() === levelFilter.toLowerCase())

    return matchSearch && matchEngine && matchLanguage && matchRole && matchLevel
  })

  if (loading) return <div className="text-center py-20 text-muted-foreground">Loading teams...</div>

  return (
    <section className="px-4 pb-16 pt-4 lg:px-6 lg:pb-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{displayedTeams.length}</span> teams
          </p>
        </div>
        
        {displayedTeams.length === 0 ? (
          <div className="text-center py-10 bg-card/50 rounded-3xl border border-dashed border-border">
            No teams found matching these filters. 😢
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayedTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}