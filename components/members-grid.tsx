"use client"

import { useEffect, useRef, useState } from "react"
import { JammerCard, type SquadOption } from "@/components/player-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { ROLE_STYLES } from "@/lib/constants"
import { loadMoreAvailablePlayers } from "@/app/actions/find-members-actions"
import type { AvailablePlayerListItem } from "@/lib/queries"

const PAGE_SIZE = 24

interface MembersGridProps {
  initialMembers: AvailablePlayerListItem[]
  initialHasMore: boolean
  searchQuery: string
  roleFilter: string
  engineFilter: string
  levelFilter: string
  jamIdFilter?: string
  onResultsCountChange?: (count: number) => void
  isRefreshing?: boolean
}

export function MembersGrid({
  initialMembers,
  initialHasMore,
  searchQuery = "",
  roleFilter = "all",
  engineFilter = "all",
  levelFilter = "all",
  jamIdFilter = "",
  onResultsCountChange,
  isRefreshing = false,
}: MembersGridProps) {
  const [members, setMembers] = useState<AvailablePlayerListItem[]>(initialMembers)
  const [mySquads, setMySquads] = useState<SquadOption[]>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const offsetRef = useRef(initialMembers.length)

  useEffect(() => {
    setMembers(initialMembers)
    setHasMore(initialHasMore)
    offsetRef.current = initialMembers.length
  }, [initialMembers, initialHasMore])

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id ?? null

      if (userId) {
        const { data: teamsData, error: teamsError } = await supabase
          .from("teams")
          .select("id, team_name, game_name, looking_for")
          .eq("user_id", userId)

        if (!teamsError && teamsData) {
          type TeamMiniRow = {
            id: string
            team_name: string | null
            game_name: string | null
            looking_for: unknown
          }
          type LookingForRole = { role?: string | null }

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
              team_name: t.team_name ?? "Untitled team",
              game_name: t.game_name ?? undefined,
              needed_roles,
            }
          })
          setMySquads(squads)
        }
      }
    }

    void init()
  }, [])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    try {
      const result = await loadMoreAvailablePlayers({
        searchQuery,
        role: roleFilter,
        engine: engineFilter,
        experience: levelFilter,
        jamId: jamIdFilter,
        offset: offsetRef.current,
        limit: PAGE_SIZE,
      })

      if (result.error) {
        toast.error("Error loading profiles.", { description: result.error })
        setHasMore(false)
        return
      }

      setMembers((prev) => [...prev, ...result.players])
      setHasMore(result.hasMore)
      offsetRef.current = result.nextOffset
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    onResultsCountChange?.(members.length)
  }, [members.length, onResultsCountChange])

  return (
    <section className="px-4 pb-16 pt-4 sm:px-6 lg:pb-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{members.length}</span> available jammers
          </p>
          {isRefreshing ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Refreshing
            </span>
          ) : null}
        </div>

        {members.length === 0 ? (
          <div className="text-center py-10 bg-card/50 rounded-3xl border border-dashed border-border">
            No jammers found matching these filters. 😢
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((jammer) => (
              <JammerCard
                key={jammer.availabilityPostId ?? jammer.id}
                player={jammer}
                mySquads={mySquads}
              />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loadingMore || isRefreshing}
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
