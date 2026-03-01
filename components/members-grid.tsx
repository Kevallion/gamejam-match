"use client"

import { useEffect, useState } from "react"
import { PlayerCard, type PlayerCardData } from "@/components/player-card"
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
  expert: { label: "Expert", emoji: "👑", color: "bg-lavender/15 text-lavender" },
}

interface MembersGridProps {
  searchQuery: string
  roleFilter: string
  engineFilter: string
  levelFilter: string
}

export function MembersGrid({ searchQuery = "", roleFilter = "all", engineFilter = "all", levelFilter = "all" }: MembersGridProps) {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getMembers() {
      // J'ai remis le tri par created_at si tu as créé la colonne, sinon efface juste la ligne .order()
      const { data, error } = await supabase.from('profiles').select('*')
      
      if (!error && data) {
        const formattedMembers = data.map((m) => ({
          id: m.id || m.username,
          username: m.username,
          avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${m.username}&backgroundColor=d1d4f9`,
          // On garde les données "brutes" (raw) pour que les filtres puissent les lire facilement
          rawRole: m.role || "",
          rawLevel: m.experience || "",
          rawEngine: m.engine || "",
          // On génère les jolis badges pour l'affichage
          role: ROLE_STYLES[m.role] || { label: m.role, emoji: "❓", color: "bg-gray-500/10 text-gray-500" },
          level: LEVEL_STYLES[m.experience] || { label: m.experience, emoji: "⭐", color: "bg-gray-500/10 text-gray-500" },
          engine: m.engine,
          language: m.language,
          bio: m.bio,
        }))
        setMembers(formattedMembers)
      }
      setLoading(false)
    }
    getMembers()
  }, [])

  // 🚀 LE FILTRE ULTRA-ROBUSTE
  const displayedMembers = members.filter((m) => {
    const matchSearch = m.username.toLowerCase().includes(searchQuery.toLowerCase())
    
    // On compare les mots exacts en minuscules
    const matchRole = roleFilter === "all" || m.rawRole.toLowerCase() === roleFilter.toLowerCase()
    const matchEngine = engineFilter === "all" || m.rawEngine.toLowerCase() === engineFilter.toLowerCase()
    const matchLevel = levelFilter === "all" || m.rawLevel.toLowerCase() === levelFilter.toLowerCase()
    
    return matchSearch && matchRole && matchEngine && matchLevel
  })

  if (loading) return <div className="text-center py-20 text-muted-foreground">Loading jammers...</div>

  return (
    <section className="px-4 pb-16 pt-4 lg:px-6 lg:pb-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{displayedMembers.length}</span> available jammers
          </p>
        </div>
        
        {displayedMembers.length === 0 ? (
          <div className="text-center py-10 bg-card/50 rounded-3xl border border-dashed border-border">
            No jammers found matching these filters. 😢
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayedMembers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}