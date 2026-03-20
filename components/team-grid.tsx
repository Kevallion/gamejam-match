"use client"

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { TeamCard, type TeamCardData } from "@/components/team-card"
import { Button } from "@/components/ui/button"
import { getRecommendedTeams } from "@/lib/matchmaking"
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
  onResultsCountChange?: (count: number) => void
}

type RawRoleEntry = { role?: string | null; level?: string | null }

type TeamRowDb = {
  id: string
  user_id: string
  team_name: string | null
  game_name: string | null
  engine: string | null
  language: string | null
  description: string | null
  team_vibe: string | null
  looking_for: unknown
  team_members: { id: string; role?: string | null }[] | null
}

type TeamWithMeta = TeamCardData & {
  rawRoles: RawRoleEntry[]
  rawTeamVibe: string | null
  isRecommended?: boolean
}

type GridFilterOpts = {
  debouncedSearch: string
  engineFilter: string
  roleFilter: string
  levelFilter: string
  languageFilter: string
  styleFilter: string
}

function formatTeam(t: TeamRowDb): TeamWithMeta {
  const parsedRoles: RawRoleEntry[] = Array.isArray(t.looking_for) ? (t.looking_for as RawRoleEntry[]) : []
  const roleBadges = parsedRoles.map((r) => ({
    ...(ROLE_STYLES[r.role ?? ""] ?? { label: r.role ?? "Other", emoji: "❓", color: "bg-gray-500/10 text-gray-500" }),
    key: r.role ?? undefined,
  }))
  const mainLevel = (parsedRoles.length > 0 ? parsedRoles[0].level : "beginner") ?? "beginner"
  const levelBadge = EXPERIENCE_STYLES[mainLevel] || EXPERIENCE_STYLES["beginner"]
  const acceptedRoleKeys: string[] = (t.team_members ?? [])
    .map((m) => m.role ?? null)
    .filter((r): r is string => !!r)
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

function teamPassesGridFilters(t: TeamWithMeta, o: GridFilterOpts): boolean {
  if (t.rawRoles.length > 0 && t.members >= t.maxMembers) return false

  const searchLower = o.debouncedSearch.toLowerCase()
  const matchSearch =
    !searchLower ||
    t.name.toLowerCase().includes(searchLower) ||
    t.jam.toLowerCase().includes(searchLower) ||
    t.description.toLowerCase().includes(searchLower)

  const matchEngine =
    o.engineFilter === "all" || String(t.engine).toLowerCase() === o.engineFilter.toLowerCase()
  const matchLanguage =
    o.languageFilter === "all" || String(t.language).toLowerCase() === o.languageFilter.toLowerCase()
  const matchRole =
    o.roleFilter === "all" ||
    t.rawRoles.some((r) => r.role?.toLowerCase() === o.roleFilter.toLowerCase())
  const legacyMap: Record<string, string> = { hobbyist: "junior", confirmed: "regular", expert: "senior" }
  const matchLevel =
    o.levelFilter === "all" ||
    t.rawRoles.some((r) => {
      const raw = (r.level?.toLowerCase() || "")
      const normalized = legacyMap[raw] ?? raw
      const filter = o.levelFilter.toLowerCase()
      return normalized === filter
    })
  const matchStyle =
    o.styleFilter === "all" ||
    Boolean(
      t.rawTeamVibe && String(t.rawTeamVibe).toLowerCase() === o.styleFilter.toLowerCase(),
    )

  return matchSearch && matchEngine && matchLanguage && matchRole && matchLevel && matchStyle
}

export function TeamGrid({
  searchQuery = "",
  engineFilter = "all",
  roleFilter = "all",
  levelFilter = "all",
  languageFilter = "all",
  styleFilter = "all",
  onResultsCountChange,
}: TeamGridProps) {
  const [teams, setTeams] = useState<TeamWithMeta[]>([])
  const [recommendedTeams, setRecommendedTeams] = useState<TeamWithMeta[]>([])
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
      .select("*, team_members(id, role, user_id)")
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
      setHasMore(false)
      offsetRef.current = 0
      toast.error("Error loading teams.", { description: error.message })
    }
  }, [])

  const loadRecommended = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      setRecommendedTeams([])
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("default_role, default_engine")
      .eq("id", session.user.id)
      .maybeSingle()

    if (profileError) {
      setRecommendedTeams([])
      return
    }

    const role = profile?.default_role?.trim()
    if (!role) {
      setRecommendedTeams([])
      return
    }

    const engine = profile?.default_engine?.trim() ?? null
    const { teams: rec, error } = await getRecommendedTeams(role, engine)
    if (error || !rec.length) {
      setRecommendedTeams([])
      return
    }

    const ids = rec.map((t) => t.id)
    const { data: rows, error: teamsError } = await supabase
      .from("teams")
      .select("*, team_members(id, role, user_id)")
      .in("id", ids)
      .gt("expires_at", new Date().toISOString())

    if (teamsError || !rows?.length) {
      setRecommendedTeams([])
      return
    }

    const byId = new Map(rows.map((r) => [r.id, r as TeamRowDb]))
    const ordered: TeamWithMeta[] = []
    for (const item of rec) {
      const row = byId.get(item.id)
      if (!row) continue
      const meta = formatTeam(row)
      if (meta.rawRoles.length > 0 && meta.members >= meta.maxMembers) continue
      ordered.push({ ...meta, isRecommended: true })
      if (ordered.length >= 3) break
    }
    setRecommendedTeams(ordered)
  }, [])

  useEffect(() => {
    offsetRef.current = 0
    void fetchPage(0, false)
    void loadRecommended()
  }, [fetchPage, loadRecommended])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    await fetchPage(offsetRef.current, true)
    setLoadingMore(false)
  }

  const filterOpts: GridFilterOpts = useMemo(
    () => ({
      debouncedSearch,
      engineFilter,
      roleFilter,
      levelFilter,
      languageFilter,
      styleFilter,
    }),
    [debouncedSearch, engineFilter, roleFilter, levelFilter, languageFilter, styleFilter],
  )

  const displayedTeams = useMemo(() => {
    const passes = (t: TeamWithMeta) => teamPassesGridFilters(t, filterOpts)
    const recFiltered = recommendedTeams.filter(passes)
    const recommendedIds = new Set(recommendedTeams.map((t) => t.id))
    const regularFiltered = teams.filter((t) => !recommendedIds.has(t.id)).filter(passes)
    return [...recFiltered, ...regularFiltered]
  }, [teams, recommendedTeams, filterOpts])

  useEffect(() => {
    onResultsCountChange?.(displayedTeams.length)
  }, [displayedTeams.length, onResultsCountChange])

  if (!teams.length && hasMore)
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
              <div key={team.id} className="min-h-0 h-full">
                <TeamCard team={team} isRecommended={!!team.isRecommended} />
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="gap-2 rounded-xl"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load more teams"
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
