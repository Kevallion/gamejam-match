"use client"

import { useEffect, useState } from "react"
import { TeamCard, type TeamCardData } from "@/components/team-card"
import { supabase } from "@/lib/supabase"

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

interface TeamGridProps {
  searchQuery: string
  engineFilter: string
  roleFilter: string
  levelFilter: string
  languageFilter: string
}

export function TeamGrid({
  searchQuery = "",
  engineFilter = "all",
  roleFilter = "all",
  levelFilter = "all",
  languageFilter = "all",
}: TeamGridProps) {
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getTeams() {
      // On sélectionne les membres avec leur rôle (target_role depuis join_requests acceptés)
      const { data, error } = await supabase
        .from("teams")
        .select("*, team_members(id, role, user_id), join_requests(target_role, status, type)")
        .order("created_at", { ascending: false })

      if (!error && data) {
        const formattedTeams = data.map((t) => {
          const parsedRoles: any[] = Array.isArray(t.looking_for) ? t.looking_for : []

          const roleBadges = parsedRoles.map((r: any) => ({
            ...(ROLE_STYLES[r.role] ?? { label: r.role, emoji: "❓", color: "bg-gray-500/10 text-gray-500" }),
            key: r.role,
          }))

          const mainLevel = parsedRoles.length > 0 ? parsedRoles[0].level : "beginner"
          const levelBadge = LEVEL_STYLES[mainLevel] || LEVEL_STYLES["beginner"]

          // Rôles déjà pris : on regarde les join_requests acceptées avec un target_role
          const acceptedRoleKeys: string[] = (t.join_requests ?? [])
            .filter((jr: any) => jr.status === "accepted" && jr.type === "application" && jr.target_role)
            .map((jr: any) => jr.target_role as string)

          const acceptedMembersCount = t.team_members ? t.team_members.length : 0

          return {
            id: t.id,
            name: t.team_name || "Unknown Team",
            jam: t.game_name || "",
            engine: t.engine || "",
            language: t.language || "",
            description: t.description || "",
            rawRoles: parsedRoles,
            members: 1 + acceptedMembersCount,
            maxMembers: 1 + parsedRoles.length,
            roles: roleBadges,
            level: levelBadge,
            filledRoleKeys: acceptedRoleKeys,
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

  const displayedTeams = teams.filter((t) => {
    const searchLower = searchQuery.toLowerCase()
    const matchSearch =
      t.name.toLowerCase().includes(searchLower) ||
      t.jam.toLowerCase().includes(searchLower) ||
      t.description.toLowerCase().includes(searchLower)

    const matchEngine =
      engineFilter === "all" || String(t.engine).toLowerCase() === engineFilter.toLowerCase()
    const matchLanguage =
      languageFilter === "all" || String(t.language).toLowerCase() === languageFilter.toLowerCase()
    const matchRole =
      roleFilter === "all" || t.rawRoles.some((r: any) => r.role.toLowerCase() === roleFilter.toLowerCase())
    const matchLevel =
      levelFilter === "all" || t.rawRoles.some((r: any) => r.level.toLowerCase() === levelFilter.toLowerCase())

    return matchSearch && matchEngine && matchLanguage && matchRole && matchLevel
  })

  if (loading)
    return <div className="text-center py-20 text-muted-foreground">Loading teams...</div>

  return (
    <section className="px-4 pb-16 pt-4 lg:px-6 lg:pb-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">{displayedTeams.length}</span>{" "}
            teams
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
