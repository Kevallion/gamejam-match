"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { JammerCard, type JammerCardData, type SquadOption } from "@/components/player-card"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

const PAGE_SIZE = 24

type JammerWithFilters = JammerCardData & {
  rawRole: string
  rawEngine: string
  rawLevel: string
}

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

function formatMember(m: any): JammerWithFilters {
  return {
    id: m.id as string,
    username: m.username,
    avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${m.username}&backgroundColor=d1d4f9`,
    rawRole: m.role || "",
    rawLevel: m.experience || "",
    rawEngine: m.engine || "",
    role: ROLE_STYLES[m.role] || { label: m.role, emoji: "❓", color: "bg-gray-500/10 text-gray-500" },
    level: LEVEL_STYLES[m.experience] || { label: m.experience, emoji: "⭐", color: "bg-gray-500/10 text-gray-500" },
    engine: m.engine,
    language: m.language,
    bio: m.bio,
    portfolio_link: m.portfolio_link || "",
  }
}

export function MembersGrid({
  searchQuery = "",
  roleFilter = "all",
  engineFilter = "all",
  levelFilter = "all",
}: MembersGridProps) {
  const [members, setMembers] = useState<JammerWithFilters[]>([])
  const [mySquads, setMySquads] = useState<SquadOption[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const offsetRef = useRef(0)

  // Debounced search — se déclenche 250ms après la dernière frappe
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchPage = useCallback(async (from: number, append: boolean) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .range(from, from + PAGE_SIZE - 1)

    if (!error && data) {
      const formatted = data.map(formatMember)
      setMembers((prev) => (append ? [...prev, ...formatted] : formatted))
      setHasMore(data.length === PAGE_SIZE)
      offsetRef.current = from + data.length
    } else if (error) {
      console.error("Erreur Supabase :", error)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id ?? null
      setCurrentUserId(userId)

      await fetchPage(0, false)

      if (userId) {
        const { data: teamsData, error: teamsError } = await supabase
          .from("teams")
          .select("id, team_name, game_name, looking_for")
          .eq("user_id", userId)

        if (!teamsError && teamsData) {
          const squads: SquadOption[] = (teamsData as any[]).map((t) => {
            const parsedRoles: any[] = Array.isArray(t.looking_for) ? t.looking_for : []
            const needed_roles = parsedRoles.map((r: any) => ({
              key: r.role,
              ...(ROLE_STYLES[r.role] ?? { label: r.role, emoji: "❓", color: "bg-gray-500/10 text-gray-500" }),
            }))
            return { id: t.id, team_name: t.team_name, game_name: t.game_name ?? undefined, needed_roles }
          })
          setMySquads(squads)
        }
      }

      setLoading(false)
    }

    init()
  }, [fetchPage])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    await fetchPage(offsetRef.current, true)
    setLoadingMore(false)
  }

  const displayedMembers = members.filter((m) => {
    const matchSearch =
      !debouncedSearch || m.username.toLowerCase().includes(debouncedSearch.toLowerCase())
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
            {displayedMembers.map((jammer) => (
              <JammerCard key={jammer.id} player={jammer} mySquads={mySquads} />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent disabled:opacity-60"
            >
              {loadingMore ? (
                <><Loader2 className="size-4 animate-spin" /> Loading...</>
              ) : (
                "Load more jammers"
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
