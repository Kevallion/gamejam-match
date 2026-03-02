"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { TeamCard, type TeamCardData } from "@/components/team-card"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { EXPERIENCE_STYLES, JAM_STYLE_STYLES, ROLE_STYLES } from "@/lib/constants"

const PAGE_SIZE = 24

interface TeamGridProps {
  searchQuery: string
  engineFilter: string
  roleFilter: string
  levelFilter: string
  languageFilter: string
  styleFilter?: string
}

function formatTeam(t: any) {
  const parsedRoles: any[] = Array.isArray(t.looking_for) ? t.looking_for : []
  const roleBadges = parsedRoles.map((r: any) => ({
    ...(ROLE_STYLES[r.role] ?? { label: r.role, emoji: "❓", color: "bg-gray-500/10 text-gray-500" }),
    key: r.role,
  }))
  const mainLevel = parsedRoles.length > 0 ? parsedRoles[0].level : "beginner"
  const levelBadge = EXPERIENCE_STYLES[mainLevel] || EXPERIENCE_STYLES["beginner"]
  const acceptedRoleKeys: string[] = (t.join_requests ?? [])
    .filter((jr: any) => jr.status === "accepted" && jr.type === "application" && jr.target_role)
    .map((jr: any) => jr.target_role as string)
  const acceptedMembersCount = t.team_members ? t.team_members.length : 0
  const teamVibe = t.team_vibe ? JAM_STYLE_STYLES[t.team_vibe] : undefined

  return {
    id: t.id,
    user_id: t.user_id,
    name: t.team_name || "Unknown Team",
    jam: t.game_name || "",
    engine: t.engine || "",
    language: t.language || "",
    description: t.description || "",
    rawRoles: parsedRoles,
    rawTeamVibe: t.team_vibe || null,
    members: 1 + acceptedMembersCount,
    maxMembers: 1 + parsedRoles.length,
    roles: roleBadges,
    level: levelBadge,
    teamVibe: teamVibe ?? undefined,
    filledRoleKeys: acceptedRoleKeys,
  }
}

export function TeamGrid({
  searchQuery = "",
  engineFilter = "all",
  roleFilter = "all",
  levelFilter = "all",
  languageFilter = "all",
  styleFilter = "all",
}: TeamGridProps) {
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const offsetRef = useRef(0)

  // Debounced search query — updates 250ms after last keystroke
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchPage = useCallback(async (from: number, append: boolean) => {
    const { data, error } = await supabase
      .from("teams")
      .select("*, team_members(id, role, user_id), join_requests(target_role, status, type)")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (!error && data) {
      const formatted = data.map(formatTeam)
      setTeams((prev) => (append ? [...prev, ...formatted] : formatted))
      setHasMore(data.length === PAGE_SIZE)
      offsetRef.current = from + data.length
    } else if (error) {
      setTeams([])
      toast.error("Error loading teams.", { description: error.message })
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    offsetRef.current = 0
    fetchPage(0, false).finally(() => setLoading(false))
  }, [fetchPage])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    await fetchPage(offsetRef.current, true)
    setLoadingMore(false)
  }

  const displayedTeams = teams.filter((t) => {
    // Hide full teams
    if (t.members >= t.maxMembers) return false

    const searchLower = debouncedSearch.toLowerCase()
    const matchSearch =
      !searchLower ||
      t.name.toLowerCase().includes(searchLower) ||
      t.jam.toLowerCase().includes(searchLower) ||
      t.description.toLowerCase().includes(searchLower)

    const matchEngine =
      engineFilter === "all" || String(t.engine).toLowerCase() === engineFilter.toLowerCase()
    const matchLanguage =
      languageFilter === "all" || String(t.language).toLowerCase() === languageFilter.toLowerCase()
    const matchRole =
      roleFilter === "all" || t.rawRoles.some((r: any) => r.role.toLowerCase() === roleFilter.toLowerCase())
    const legacyMap: Record<string, string> = { hobbyist: "junior", confirmed: "regular", expert: "senior" }
    const matchLevel =
      levelFilter === "all" ||
      t.rawRoles.some((r: any) => {
        const raw = (r.level?.toLowerCase() || "")
        const normalized = legacyMap[raw] ?? raw
        const filter = levelFilter.toLowerCase()
        return normalized === filter
      })
    const matchStyle =
      styleFilter === "all" ||
      (t.rawTeamVibe && String(t.rawTeamVibe).toLowerCase() === styleFilter.toLowerCase())

    return matchSearch && matchEngine && matchLanguage && matchRole && matchLevel && matchStyle
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
                "Load more teams"
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
