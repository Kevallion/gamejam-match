"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { JammerCard, type JammerCardData, type SquadOption } from "@/components/player-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BookUser, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { ROLE_STYLES } from "@/lib/constants"
import { loadDirectoryJammers } from "@/app/actions/directory-actions"
import type { DirectoryJammerListItem } from "@/lib/queries"

const PAGE_SIZE = 24

type DirectoryGridProps = {
  searchQuery: string
  roleFilter: string
  engineFilter: string
  languageFilter: string
  initialJammers: DirectoryJammerListItem[]
  initialHasMore: boolean
  onResultsCountChange?: (count: number) => void
  onSwitchToAvailable?: () => void
}

function toCardData(jammer: DirectoryJammerListItem): JammerCardData {
  return {
    id: jammer.id,
    username: jammer.username,
    avatar_url: jammer.avatar_url,
    role: jammer.role,
    level: jammer.level,
    jamStyle: jammer.jamStyle,
    engine: jammer.engine,
    bio: jammer.bio,
    language: jammer.language,
    portfolio_link: jammer.portfolio_link,
    jam: jammer.jam
      ? { title: jammer.jam.title, url: jammer.jam.url ?? undefined }
      : undefined,
    jammerTitle: jammer.jammerTitle,
    jammerLevel: jammer.jammerLevel,
    kudosCounts: jammer.kudosCounts,
  }
}

export function DirectoryGrid({
  searchQuery = "",
  roleFilter = "all",
  engineFilter = "all",
  languageFilter = "all",
  initialJammers,
  initialHasMore,
  onResultsCountChange,
  onSwitchToAvailable,
}: DirectoryGridProps) {
  const [jammers, setJammers] = useState<DirectoryJammerListItem[]>(initialJammers)
  const [mySquads, setMySquads] = useState<SquadOption[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const offsetRef = useRef(initialJammers.length)
  const filtersKeyRef = useRef("")

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchPage = useCallback(
    async (from: number, append: boolean) => {
      const result = await loadDirectoryJammers({
        searchQuery: debouncedSearch,
        role: roleFilter,
        engine: engineFilter,
        language: languageFilter,
        offset: from,
        limit: PAGE_SIZE,
      })

      if (result.error) {
        if (!append) setJammers([])
        setHasMore(false)
        toast.error("Error loading directory.", { description: result.error })
        return
      }

      setJammers((prev) => (append ? [...prev, ...result.jammers] : result.jammers))
      setHasMore(result.hasMore)
      offsetRef.current = result.nextOffset
    },
    [debouncedSearch, roleFilter, engineFilter, languageFilter],
  )

  useEffect(() => {
    const key = `${debouncedSearch}|${roleFilter}|${engineFilter}|${languageFilter}`
    const isFirstMount = filtersKeyRef.current === ""
    filtersKeyRef.current = key

    if (isFirstMount) {
      onResultsCountChange?.(initialJammers.length)
      return
    }

    let cancelled = false
    const run = async () => {
      setLoading(true)
      await fetchPage(0, false)
      if (!cancelled) setLoading(false)
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [
    debouncedSearch,
    roleFilter,
    engineFilter,
    languageFilter,
    fetchPage,
    initialJammers.length,
    onResultsCountChange,
  ])

  useEffect(() => {
    onResultsCountChange?.(jammers.length)
  }, [jammers.length, onResultsCountChange])

  useEffect(() => {
    const initSquads = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const userId = session?.user?.id ?? null
      if (!userId) return

      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("id, team_name, game_name, looking_for")
        .eq("user_id", userId)

      if (teamsError || !teamsData) return

      type TeamMiniRow = {
        id: string
        team_name: string | null
        game_name: string | null
        looking_for: unknown
      }
      type LookingForRole = { role?: string | null }

      const teamIds = (teamsData as TeamMiniRow[]).map((team) => team.id)
      const memberIdsByTeam = new Map<string, string[]>()
      if (teamIds.length > 0) {
        const { data: memberRows } = await supabase
          .from("team_members")
          .select("team_id, user_id")
          .in("team_id", teamIds)
        for (const row of memberRows ?? []) {
          const teamId = row.team_id as string | null
          const memberId = row.user_id as string | null
          if (!teamId || !memberId) continue
          const list = memberIdsByTeam.get(teamId) ?? []
          list.push(memberId)
          memberIdsByTeam.set(teamId, list)
        }
      }

      const squads: SquadOption[] = (teamsData as TeamMiniRow[]).map((t) => {
        const parsedRoles: LookingForRole[] = Array.isArray(t.looking_for)
          ? (t.looking_for as LookingForRole[])
          : []
        const needed_roles = parsedRoles.map((r) => ({
          key: r.role ?? "",
          ...(ROLE_STYLES[r.role ?? ""] ?? {
            label: r.role ?? "Other",
            emoji: "❓",
            color: "bg-gray-500/10 text-gray-500",
          }),
        }))
        return {
          id: t.id,
          team_name: t.team_name ?? "Untitled squad",
          game_name: t.game_name ?? undefined,
          needed_roles,
          memberIds: memberIdsByTeam.get(t.id) ?? [],
        }
      })
      setMySquads(squads)
    }

    void initSquads()
  }, [])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    await fetchPage(offsetRef.current, true)
    setLoadingMore(false)
  }

  if (loading) {
    return (
      <section
        className="px-4 pb-16 pt-4 sm:px-6 lg:pb-24"
        aria-busy="true"
        aria-label="Loading directory"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-6">
            <Skeleton className="h-5 w-56 rounded-md" />
          </div>
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="flex min-h-[320px] flex-col gap-4 rounded-xl border border-border/60 bg-card/40 p-4 sm:p-6"
              >
                <div className="flex items-center gap-3.5">
                  <Skeleton className="size-12 shrink-0 rounded-full" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-5 w-3/5 max-w-[180px]" />
                    <Skeleton className="h-4 w-2/5 max-w-[120px]" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 pb-16 pt-4 sm:px-6 lg:pb-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{jammers.length}</span> jammers
            in the directory
          </p>
        </div>

        {jammers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
            <BookUser className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No jammers found matching these filters.
            </p>
            {onSwitchToAvailable ? (
              <Button
                type="button"
                variant="outline"
                className="mt-4 rounded-xl"
                onClick={onSwitchToAvailable}
              >
                Browse available jammers
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jammers.map((jammer) => (
              <JammerCard key={jammer.id} player={toCardData(jammer)} mySquads={mySquads} />
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
                "Load more jammers"
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
