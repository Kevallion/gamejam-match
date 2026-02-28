"use client"

import { useEffect, useState } from "react"
import { PlayerCard, type PlayerCardData } from "@/components/player-card"
import { supabase } from "@/lib/supabase"

// --- Notre "Machine à traduire" les styles ---
const ROLE_STYLES: Record<string, any> = {
  developer: { label: "Developer", emoji: "💻", color: "bg-teal/15 text-teal" },
  "2d-artist": { label: "2D Artist", emoji: "🎨", color: "bg-pink/15 text-pink" },
  "3d-artist": { label: "3D Artist", emoji: "🗿", color: "bg-peach/15 text-peach" },
  audio: { label: "Audio", emoji: "🎵", color: "bg-lavender/15 text-lavender" },
  writer: { label: "Writer", emoji: "✍️", color: "bg-pink/15 text-pink" },
  "game-design": { label: "Game Designer", emoji: "🎯", color: "bg-peach/15 text-peach" },
}

const LEVEL_STYLES: Record<string, any> = {
  beginner: { label: "Beginner", emoji: "🌱", color: "bg-mint/15 text-mint" },
  hobbyist: { label: "Hobbyist", emoji: "🛠️", color: "bg-peach/15 text-peach" },
  confirmed: { label: "Confirmed", emoji: "🚀", color: "bg-teal/15 text-teal" },
  expert: { label: "Expert", emoji: "👑", color: "bg-lavender/15 text-lavender" },
}

export function MembersGrid() {
  const [members, setMembers] = useState<PlayerCardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getMembers() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false }) // Les plus récents en premier

      console.log("Erreur Supabase :", error);
      console.log("Données reçues :", data);
      
      if (!error && data) {
        // On transforme les données Supabase pour le design
        const formattedMembers = data.map((m) => ({
          id: m.id,
          username: m.username,
          // Génération d'un avatar unique basé sur le pseudo
          avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${m.username}&backgroundColor=d1d4f9`,
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

  if (loading) return <div className="text-center py-20 text-muted-foreground">Loading jammers...</div>

  return (
    <section className="px-4 pb-16 pt-4 lg:px-6 lg:pb-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{members.length}</span> available jammers
          </p>
        </div>
        
        {members.length === 0 ? (
          <div className="text-center py-10 bg-card/50 rounded-3xl border border-dashed border-border">
            No jammers found yet. Be the first to post!
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}