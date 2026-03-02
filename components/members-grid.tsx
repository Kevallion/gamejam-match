"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { JammerCard, type JammerCardData, type SquadOption } from "@/components/player-card"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { EXPERIENCE_STYLES, ROLE_STYLES } from "@/lib/constants"

const PAGE_SIZE = 24

type JammerWithFilters = JammerCardData & {
  rawRole: string
  rawEngine: string
  rawLevel: string
}

interface MembersGridProps {
  searchQuery: string
  roleFilter: string
  engineFilter: string
  levelFilter: string
}

function formatMember(m: any): JammerWithFilters {
  const fallbackUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${m.username}&backgroundColor=d1d4f9`
  return {
    id: m.id as string,
    username: m.username,
    avatarUrl: m.avatar_url?.trim() || fallbackUrl,
    rawRole: m.role || "",
    rawLevel: m.experience || "",
    rawEngine: m.engine || "",
    role: ROLE_STYLES[m.role] || { label: m.role, emoji: "❓", color: "bg-gray-500/10 text-gray-500" },
    level: EXPERIENCE_STYLES[m.experience] || { label: m.experience, emoji: "⭐", color: "bg-gray-500/10 text-gray-500" },
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
      setMembers([])
      toast.error("Error loading profiles.", { description: error.message })
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
    const rawLevel = m.rawLevel?.toLowerCase() || ""
    const filterLevel = levelFilter.toLowerCase()
    const matchLevel =
      levelFilter === "all" ||
      rawLevel === filterLevel ||
      (filterLevel === "expert" && rawLevel === "veteran") ||
      (filterLevel === "veteran" && rawLevel === "expert")

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
