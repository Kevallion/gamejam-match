"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { JammerCard, type JammerCardData, type SquadOption } from "@/components/player-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { EXPERIENCE_STYLES, JAM_STYLE_STYLES, ROLE_STYLES } from "@/lib/constants"
import { levelFromTotalXp } from "@/lib/gamification-level"
import { kudosCountsMapFromRpcRows, type KudosCounts } from "@/lib/kudos"

const PAGE_SIZE = 24

type JammerWithFilters = JammerCardData & {
  rawRole: string
  rawEngine: string
  rawLevel: string
  availabilityPostId?: string // Unique per announcement for React key
}

type AvailabilityPostRowDb = {
  id: string
  user_id: string
  availability: string | null
  role: string | null
  experience: string | null
  experience_level?: string | null
  jam_style: string | null
  engine: string | null
  language: string | null
  bio: string | null
  portfolio_link: string | null
}

type ProfileWithUser = {
  id: string
  username: string | null
  avatar_url: string | null
  jam_id: string | null
  xp?: number | null
  current_title?: string | null
  role?: string | null
  experience?: string | null
  experience_level?: string | null
  jam_style?: string | null
  engine?: string | null
  language?: string | null
  bio?: string | null
  portfolio_link?: string | null
}

interface MembersGridProps {
  searchQuery: string
  roleFilter: string
  engineFilter: string
  levelFilter: string
  onResultsCountChange?: (count: number) => void
}

type MemberRow = AvailabilityPostRowDb & { id: string }

function formatMember(
  m: MemberRow,
  profile: ProfileWithUser | null,
  kudosCounts?: KudosCounts | null,
): JammerWithFilters {
  const roleRaw = (m.role ?? profile?.role ?? "").trim()
  const roleKey = roleRaw.toLowerCase()
  const expRaw = (
    m.experience ??
    m.experience_level ??
    profile?.experience ??
    profile?.experience_level ??
    ""
  ).trim()
  const expKey = expRaw.toLowerCase()
  const jamStyleKey = (m.jam_style ?? profile?.jam_style ?? "").trim().toLowerCase()
  const jamStyle = jamStyleKey ? JAM_STYLE_STYLES[jamStyleKey] : undefined
  const xp = typeof profile?.xp === "number" ? profile.xp : 0
  const jammerTitle = profile?.current_title?.trim() || "Rookie Jammer"
  const engineVal = (m.engine ?? profile?.engine ?? "").trim()
  const languageVal = (m.language ?? profile?.language ?? "").trim()
  const bioVal = (m.bio ?? profile?.bio ?? "").trim()
  const portfolioVal = (m.portfolio_link ?? profile?.portfolio_link ?? "").trim()
  return {
    id: m.id as string,
    username: profile?.username?.trim() || "Anonymous",
    avatar_url: profile?.avatar_url?.trim() || null,
    jammerTitle,
    jammerLevel: levelFromTotalXp(xp),
    rawRole: roleRaw,
    rawLevel: expRaw,
    rawEngine: engineVal,
    role: {
      ...(ROLE_STYLES[roleKey] || {
        label: roleRaw || "—",
        emoji: "❓",
        color: "bg-gray-500/10 text-gray-500",
      }),
      key: roleKey || undefined,
    },
    level: EXPERIENCE_STYLES[expKey] || {
      label: expRaw || "—",
      emoji: "⭐",
      color: "bg-gray-500/10 text-gray-500",
    },
    jamStyle: jamStyle ?? undefined,
    engine: engineVal,
    language: languageVal,
    bio: bioVal,
    portfolio_link: portfolioVal,
    availability: m.availability || undefined,
    kudosCounts: kudosCounts ?? undefined,
  }
}

export function MembersGrid({
  searchQuery = "",
  roleFilter = "all",
  engineFilter = "all",
  levelFilter = "all",
  onResultsCountChange,
}: MembersGridProps) {
  const [members, setMembers] = useState<JammerWithFilters[]>([])
  const [mySquads, setMySquads] = useState<SquadOption[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const offsetRef = useRef(0)

  // Debounced search — updates 250ms after last keystroke
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchPage = useCallback(async (from: number, append: boolean) => {
    const { data: postsData, error: postsError } = await supabase
      .from("availability_posts")
      .select("id, user_id, availability, role, experience, jam_style, engine, language, bio, portfolio_link")
      .gt("expires_at", new Date().toISOString())
      .order("updated_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (postsError || !postsData?.length) {
      if (postsError) {
        setMembers([])
        toast.error("Error loading profiles.", { description: postsError.message })
      } else if (!append) {
        setMembers([])
      }
      setHasMore(false)
      return
    }

    const userIds = [...new Set((postsData as AvailabilityPostRowDb[]).map((r) => r.user_id).filter(Boolean))]
    const { data: profilesData } = await supabase
      .from("profiles")
      .select(
        "id, username, avatar_url, jam_id, xp, current_title, role, experience, experience_level, jam_style, engine, language, bio, portfolio_link",
      )
      .in("id", userIds)
    const profilesByUserId = new Map<string, ProfileWithUser>()
    for (const p of (profilesData ?? []) as ProfileWithUser[]) {
      if (p.id) profilesByUserId.set(p.id, p)
    }

    const jamIds = [...new Set(((profilesData ?? []) as ProfileWithUser[]).map((p) => p.jam_id).filter(Boolean))] as string[]
    const jamMap: Record<string, { title: string | null; url: string | null }> = {}
    if (jamIds.length > 0) {
      const { data: jamsData } = await supabase
        .from("external_jams")
        .select("id, title, url")
        .in("id", jamIds)
      for (const j of jamsData ?? []) {
        jamMap[j.id] = { title: j.title ?? null, url: j.url ?? null }
      }
    }
    const profileJamMap: Record<string, { title: string | null; url: string | null } | null> = {}
    for (const p of (profilesData ?? []) as ProfileWithUser[]) {
      const jamId = p.jam_id
      profileJamMap[p.id] = jamId && jamMap[jamId] ? jamMap[jamId] : null
    }

    let kudosByUser = new Map<string, KudosCounts>()
    if (userIds.length > 0) {
      const { data: kudosRows, error: kudosErr } = await supabase.rpc("get_kudos_counts_for_users", {
        p_user_ids: userIds,
      })
      if (!kudosErr && kudosRows) {
        kudosByUser = kudosCountsMapFromRpcRows(
          kudosRows as { receiver_id: string; category: string; cnt: number | string }[],
        )
      }
    }

    const formatted = (postsData as AvailabilityPostRowDb[]).map((row) => {
      const profile = profilesByUserId.get(row.user_id) ?? null
      const kudosCounts = kudosByUser.get(row.user_id) ?? null
      const member = formatMember({ ...row, id: row.user_id }, profile, kudosCounts) as JammerWithFilters
      member.availabilityPostId = row.id
      const jam = profileJamMap[row.user_id]
      if (jam?.title) member.jam = { title: jam.title, url: jam.url ?? undefined }
      return member
    }).filter(Boolean) as JammerWithFilters[]

    setMembers((prev) => (append ? [...prev, ...formatted] : formatted))
    setHasMore(postsData.length === PAGE_SIZE)
    offsetRef.current = from + postsData.length
  }, [])

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id ?? null

      await fetchPage(0, false)

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

      setLoading(false)
    }

    init()
  }, [fetchPage])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    await fetchPage(offsetRef.current, true)
    setLoadingMore(false)
  }

  const displayedMembers = useMemo(() => {
    return members.filter((m) => {
      // Hide profiles with availability disabled (removed from list)
      if (m.availability == null || m.availability === "") return false

      const term = debouncedSearch.toLowerCase()
      const inUsername = m.username.toLowerCase().includes(term)
      const inJamTitle = m.jam?.title ? m.jam.title.toLowerCase().includes(term) : false
      const matchSearch = !term || inUsername || inJamTitle
      const matchRole = roleFilter === "all" || m.rawRole.toLowerCase() === roleFilter.toLowerCase()
      const matchEngine = engineFilter === "all" || m.rawEngine.toLowerCase() === engineFilter.toLowerCase()
      const rawLevel = m.rawLevel?.toLowerCase() || ""
      const filterLevel = levelFilter.toLowerCase()
      const legacyMap: Record<string, string> = { hobbyist: "junior", confirmed: "regular", expert: "senior" }
      const normalizedRaw = legacyMap[rawLevel] ?? rawLevel
      const matchLevel = levelFilter === "all" || normalizedRaw === filterLevel

      return matchSearch && matchRole && matchEngine && matchLevel
    })
  }, [members, debouncedSearch, roleFilter, engineFilter, levelFilter])

  useEffect(() => {
    onResultsCountChange?.(displayedMembers.length)
  }, [displayedMembers.length, onResultsCountChange])

  if (loading) {
    return (
      <section className="px-4 pb-16 pt-4 sm:px-6 lg:pb-24" aria-busy="true" aria-label="Loading jammers">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
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
                  <Skeleton className="size-8 shrink-0 rounded-full" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-7 w-20 rounded-full" />
                </div>
                <Skeleton className="h-16 w-full rounded-lg" />
                <div className="mt-auto flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-xl" />
                  <Skeleton className="h-9 flex-1 rounded-xl" />
                </div>
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
            Showing <span className="font-semibold text-foreground">{displayedMembers.length}</span> available jammers
          </p>
        </div>

        {displayedMembers.length === 0 ? (
          <div className="text-center py-10 bg-card/50 rounded-3xl border border-dashed border-border">
            No jammers found matching these filters. 😢
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedMembers.map((jammer) => (
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
