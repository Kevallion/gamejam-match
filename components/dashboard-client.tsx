"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { DashboardMyTeams, type TeamData } from "@/components/dashboard-my-teams"
import { DashboardRecommendedTeams } from "@/components/dashboard-recommended-teams"
import { DashboardMyAvailability } from "@/components/dashboard-my-availability"
import { DashboardIncomingApplications, type ApplicationData } from "@/components/dashboard-incoming-applications"
import { DashboardSquadInvitations, type InvitationData } from "@/components/dashboard-squad-invitations"
import {
  Info,
  Inbox,
  MessageCircle,
  Send,
  Settings2,
  Trash2,
  Trophy,
  UserMinus,
  UserSearch,
  Users2,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { supabase } from "@/lib/supabase"
import {
  notifyApplicantDeclined,
  notifyOwnerInvitationDeclined,
} from "@/app/actions/team-actions"
import {
  acceptJoinApplication,
  acceptTeamInvitation,
} from "@/app/actions/team-membership-actions"
import { claimDailyLoginXp } from "@/app/actions/gamification-actions"
import { OnboardingModal } from "@/components/onboarding-modal"
import { CURRENT_ONBOARDING_VERSION } from "@/lib/onboarding"
import { ProfileSettings } from "@/components/profile-settings"
import { ProfileGamification } from "@/components/profile-gamification"
import {
  GamificationDashboardFull,
} from "@/components/gamification-dashboard"
import { DashboardEmptyState } from "@/components/dashboard-empty-state"
import { PushNotificationBanner } from "@/components/push-notification-banner"
import type { Session } from "@supabase/supabase-js"
import { showGamificationRewards } from "@/components/gamification-reward-toasts"
import { gamificationRewardHasToast } from "@/lib/gamification-reward-types"
import { toast } from "sonner"
import { EXPERIENCE_STYLES, ROLE_STYLES } from "@/lib/constants"
import { UserAvatar } from "@/components/user-avatar"
import { JammerTitleBadge, JammerLevelBadge } from "@/components/profile-card"
import { levelFromTotalXp, gamificationLevelProgress } from "@/lib/gamification-level"
import { getRecommendedTeams, type SmartRecommendedTeam } from "@/lib/queries"
import { kudosCountsMapFromRpcRows, type KudosCounts } from "@/lib/kudos"

const LEVEL_STYLES = EXPERIENCE_STYLES
const FALLBACK_ROLE = { label: "Other", emoji: "?", color: "bg-muted text-muted-foreground" }
const FALLBACK_LEVEL = EXPERIENCE_STYLES["beginner"]

type SentApp = { id: string; status: string; target_role?: string; teams?: { team_name?: string; discord_link?: string } }

type TeamRow = {
  id: string
  user_id: string
  team_name: string | null
  game_name: string | null
  engine: string | null
  language: string | null
  description: string | null
  looking_for: unknown
  discord_link?: string | null
  team_members?: { count?: number | null }[]
}

type ApplicationRow = {
  id: string
  sender_id: string | null
  sender_name: string | null
  target_role: string | null
  message: string | null
  created_at: string
  teams?: { team_name?: string | null; user_id?: string | null }
}

type InvitationRow = {
  id: string
  team_id: string
  target_role?: string | null
  teams?: { team_name?: string | null; game_name?: string | null; discord_link?: string | null }
}

type MembershipRow = {
  team_id: string | null
}

type SentApplicationRow = {
  id: string
  status: string
  target_role?: string | null
  teams: { team_name?: string | null; discord_link?: string | null } | { team_name?: string | null; discord_link?: string | null }[] | null
}

export type JamInfo = { id: string; title: string | null; url: string | null }

export type AvailabilityPostRow = {
  id: string
  user_id: string
  availability: string
  username?: string | null
  role?: string | null
  experience?: string | null
  jam_style?: string | null
  engine?: string | null
  language?: string | null
  bio?: string | null
  portfolio_link?: string | null
  avatar_url?: string | null
  jam?: JamInfo | null
  kudosCounts?: KudosCounts | null
}

function SentApplicationsSection({ sentApplications }: { sentApplications: SentApp[] }) {
  return (
    <div className="glass-card rounded-2xl p-4 md:p-6">
      <div className="mb-4 flex items-center gap-3 md:mb-6">
        <div className="flex size-10 items-center justify-center rounded-xl bg-teal/15">
          <Send className="size-5 text-teal" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight md:text-xl">My sent applications</h2>
          <p className="text-sm text-muted-foreground">Track your applications to join a team.</p>
        </div>
      </div>

      {sentApplications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/50 p-6 text-center text-sm text-muted-foreground md:p-8">
          You haven&apos;t sent any applications to join a team yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2 md:gap-3">
          {sentApplications.map(app => {
            const roleStyle = app.target_role
              ? (ROLE_STYLES[app.target_role] ?? { label: app.target_role, emoji: "?", color: "bg-muted text-muted-foreground" })
              : null
            return (
              <div key={app.id} className="flex items-center justify-between rounded-xl border border-border/40 bg-background/50 px-3 py-2.5 gap-2 md:px-4 md:py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-foreground truncate">
                    {app.teams?.team_name || "Unknown team"}
                  </span>
                  {roleStyle && (
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold", roleStyle.color)}>
                      {roleStyle.emoji} {roleStyle.label}
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2 md:gap-3">
                  {app.status === "pending" && (
                    <span className="rounded-lg bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      Pending
                    </span>
                  )}
                  {app.status === "rejected" && (
                    <span className="rounded-lg bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                      Declined
                    </span>
                  )}
                  {app.status === "accepted" && (
                    <span className="rounded-lg bg-success/10 px-2 py-1 text-xs font-medium text-success">
                      Accepted
                    </span>
                  )}
                  {app.status === "accepted" && app.teams?.discord_link && (
                    <a
                      href={app.teams.discord_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#5865F2]/90 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#5865F2]"
                    >
                      <MessageCircle className="size-3.5" />
                      Join Discord
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

type DashboardClientProps = {
  defaultTab?: string | null
}

const VALID_TABS = ["squads", "inbox", "availability", "achievements", "settings"] as const

const LEGACY_TAB_TO_CURRENT: Record<string, (typeof VALID_TABS)[number]> = {
  requests: "inbox",
  overview: "squads",
  teams: "squads",
  profile: "settings",
}

function DashboardTabTrigger({
  value,
  tooltipLabel,
  showTooltip,
  className,
  icon,
  label,
}: {
  value: string
  tooltipLabel: string
  showTooltip: boolean
  className: string
  icon: ReactNode
  label: string
}) {
  const trigger = (
    <TabsTrigger
      value={value}
      title={tooltipLabel}
      className={className}
    >
      {icon}
      <span className="max-[380px]:sr-only">{label}</span>
    </TabsTrigger>
  )
  if (!showTooltip) return trigger
  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs font-semibold tracking-tight">
        {tooltipLabel}
      </TooltipContent>
    </Tooltip>
  )
}

function DashboardLoadingSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 py-6 md:py-10 lg:px-6 lg:py-12">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Identity header skeleton */}
            <div className="glass-card flex items-center gap-4 rounded-2xl p-4 md:p-6">
              <Skeleton className="size-14 shrink-0 rounded-2xl md:size-16" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            {/* KPI cards skeleton */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
            {/* Tabs skeleton */}
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </section>
      </main>
    </div>
  )
}

// Compact Identity Header for Overview
function DashboardIdentityHeader({
  displayName,
  avatarUrl,
  currentTitle,
  xp,
}: {
  displayName: string
  avatarUrl: string | null
  currentTitle: string
  xp: number
}) {
  const level = levelFromTotalXp(xp)
  const progress = gamificationLevelProgress(xp)
  const title = currentTitle?.trim() || "Rookie Jammer"

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      {/* XP Progress bar */}
      <div className="h-1 w-full bg-muted/50">
        <div
          className="h-full bg-gradient-to-r from-teal to-peach transition-all duration-500"
          style={{ width: `${progress.progressPercent}%` }}
        />
      </div>
      <div className="flex items-center gap-3 p-4 md:gap-4 md:p-5">
        <UserAvatar
          src={avatarUrl}
          fallbackName={displayName}
          size="lg"
          className="size-12 shrink-0 rounded-xl ring-2 ring-border/30 md:size-14"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-semibold tracking-tight text-foreground md:text-lg">
              {displayName}
            </p>
            <JammerLevelBadge
              level={level}
              className="level-badge-animated shrink-0 border-amber-800/35 bg-amber-600/12 px-1.5 py-0.5 text-[10px] font-bold text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-400"
            />
          </div>
          <div className="mt-1 flex items-center gap-2">
            <JammerTitleBadge title={title} className="text-sm" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardClient({ defaultTab: defaultTabProp }: DashboardClientProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get("tab")

  const activeTab = useMemo(() => {
    const raw = (tabFromUrl ?? defaultTabProp ?? "").trim().toLowerCase()
    const mapped = LEGACY_TAB_TO_CURRENT[raw]
    if (mapped) return mapped
    if (VALID_TABS.includes(raw as (typeof VALID_TABS)[number])) {
      return raw as (typeof VALID_TABS)[number]
    }
    return "squads"
  }, [tabFromUrl, defaultTabProp])

  const handleTabChange = useCallback(
    (value: string) => {
      if (!VALID_TABS.includes(value as (typeof VALID_TABS)[number])) return
      const params = new URLSearchParams(searchParams.toString())
      if (value === "squads") {
        params.delete("tab")
      } else {
        params.set("tab", value)
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const [session, setSession] = useState<Session | null>(null)
  const [teams, setTeams] = useState<TeamData[]>([])
  const [availabilityPosts, setAvailabilityPosts] = useState<AvailabilityPostRow[]>([])
  const [applications, setApplications] = useState<ApplicationData[]>([])
  const [invitations, setInvitations] = useState<InvitationData[]>([])
  const [sentApplications, setSentApplications] = useState<SentApp[]>([])
  const [loading, setLoading] = useState(true)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [availabilityModalContext, setAvailabilityModalContext] = useState<string | null>(null)
  const [hasShownAvailabilityPrompt, setHasShownAvailabilityPrompt] = useState(false)
  const [teamIdToDelete, setTeamIdToDelete] = useState<string | null>(null)
  const [availabilityPostIdToDelete, setAvailabilityPostIdToDelete] = useState<string | null>(null)
  const [recommendedTeams, setRecommendedTeams] = useState<SmartRecommendedTeam[]>([])
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [profile, setProfile] = useState<{
    id: string
    username?: string | null
    discord_username?: string | null
    avatar_url?: string | null
    default_role?: string | null
    default_engine?: string | null
    default_language?: string | null
    portfolio_url?: string | null
    xp?: number | null
    current_title?: string | null
  } | null>(null)

  const dailyXpClaimRef = useRef(false)
  const [compactTabBar, setCompactTabBar] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(max-width: 639px)")
    const apply = () => setCompactTabBar(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  const mapTeamRow = (t: TeamRow, authUserId: string): TeamData => {
    type LookingForEntry = { level?: string | null; role?: string | null }
    let parsed: LookingForEntry[] = []
    try {
      const raw = t.looking_for
      parsed = Array.isArray(raw)
        ? (raw as LookingForEntry[])
        : (JSON.parse(typeof raw === "string" ? raw : "[]") as LookingForEntry[])
    } catch {
      parsed = []
    }
    const rawLevel = (parsed[0]?.level || "beginner").toLowerCase()
    return {
      id: t.id,
      name: t.team_name || "Unnamed",
      jam: t.game_name || "",
      engine: t.engine || "",
      language: t.language || "",
      description: t.description || "",
      members: (t.team_members?.[0]?.count ?? 0) + 1,
      maxMembers: 1 + parsed.length,
      roles: parsed.map((r) => ROLE_STYLES[r.role?.toLowerCase() ?? ""] ?? { ...FALLBACK_ROLE, label: r.role ?? "Other" }),
      lookingForRoleKeys: parsed
        .map((r) => (r.role ?? "").trim().toLowerCase())
        .filter(Boolean),
      level: LEVEL_STYLES[rawLevel] ?? FALLBACK_LEVEL,
      discord_link: t.discord_link ?? null,
      isOwner: t.user_id === authUserId,
    }
  }

  const mapApplicationRow = (r: ApplicationRow, profileMap: Record<string, { username?: string; avatar_url?: string }>): ApplicationData => {
    const targetRole = r.target_role
      ? (ROLE_STYLES[r.target_role] ?? { label: r.target_role, emoji: "?", color: "bg-muted text-muted-foreground" })
      : { label: "Applicant", emoji: "?", color: "bg-teal/15 text-teal" }
    const profile = r.sender_id ? profileMap[r.sender_id] : null
    const username = profile?.username || r.sender_name || "A Jammer"
    return {
      id: r.id,
      username,
      avatar_url: profile?.avatar_url ?? null,
      teamName: r.teams?.team_name || "Unknown Team",
      role: targetRole,
      motivation: r.message || "No motivation provided.",
      createdAt: r.created_at,
    }
  }

  const mapInvitationRow = (r: InvitationRow): InvitationData => ({
    id: r.id,
    team_id: r.team_id,
    squadName: r.teams?.team_name || "Unknown Squad",
    gameName: r.teams?.game_name ?? null,
    discordLink: r.teams?.discord_link ?? null,
    targetRole: r.target_role ?? null,
  })

  const loadData = useCallback(async () => {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession?.user) {
        setRecommendedTeams([])
        setLoading(false)
        return
      }
      setSession(authSession)

      const uid = authSession.user.id

      const [
        { data: membershipRows },
        { data: profileData },
        { data: appsData },
        { data: rawInvitesData },
        { data: sentAppsData },
        { data: postsData },
      ] = await Promise.all([
        supabase.from("team_members").select("team_id").eq("user_id", uid),
        supabase
          .from("profiles")
          .select(
            "id, has_completed_onboarding, onboarding_version, jam_id, username, avatar_url, discord_username, default_role, default_engine, engine, default_language, portfolio_url, xp, current_title",
          )
          .eq("id", uid)
          .maybeSingle(),
        supabase
          .from("join_requests")
          .select("*, target_role, teams!inner(team_name, user_id)")
          .eq("teams.user_id", uid)
          .eq("status", "pending")
          .eq("type", "application"),
        supabase
          .from("join_requests")
          .select("id, team_id, status, target_role, teams(team_name, game_name, discord_link)")
          .eq("sender_id", uid)
          .eq("status", "pending")
          .eq("type", "invitation"),
        supabase
          .from("join_requests")
          .select("id, status, target_role, teams(team_name, discord_link)")
          .eq("sender_id", uid)
          .eq("type", "application"),
        supabase
          .from("availability_posts")
          .select("id, user_id, availability, role, experience, jam_style, engine, language, bio, portfolio_link")
          .eq("user_id", uid)
          .order("updated_at", { ascending: false }),
      ])

      const memberTeamIds = [
        ...new Set((membershipRows as MembershipRow[] | null)?.map((m) => m.team_id).filter(Boolean) ?? []),
      ] as string[]

      let teamsQuery = supabase.from("teams").select("*, team_members(count)")
      if (memberTeamIds.length > 0) {
        teamsQuery = teamsQuery.or(`user_id.eq.${uid},id.in.(${memberTeamIds.join(",")})`)
      } else {
        teamsQuery = teamsQuery.eq("user_id", uid)
      }
      const { data: allTeamsRows } = await teamsQuery

      const merged = new Map<string, TeamData>()
      for (const t of (allTeamsRows ?? []) as TeamRow[]) {
        merged.set(t.id, mapTeamRow(t, uid))
      }
      setTeams(Array.from(merged.values()))

      const senderIds = [...new Set(((appsData || []) as ApplicationRow[]).map((a) => a.sender_id).filter(Boolean))]
      const profileMap: Record<string, { username?: string; avatar_url?: string }> = {}
      if (senderIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", senderIds)
        for (const p of profilesData || []) {
          profileMap[p.id] = { username: p.username, avatar_url: p.avatar_url ?? undefined }
        }
      }

      const profilePrefs = profileData as {
        default_role?: string | null
        default_engine?: string | null
        engine?: string | null
      } | null
      const { teams: smartMatches } = await getRecommendedTeams({
        id: uid,
      default_role: profilePrefs?.default_role ?? null,
      default_engine: profilePrefs?.default_engine ?? null,
      profile_engine: profilePrefs?.engine ?? null,
        excludeTeamIds: Array.from(merged.keys()),
      })
      setRecommendedTeams(smartMatches)

      // Show the new onboarding wizard: when no profile yet (new user), or when
      // onboarding was never completed, or when they completed an older version.
      if (!profileData) {
        setShowOnboardingModal(true)
      } else {
        const hasCompletedOnboarding = profileData.has_completed_onboarding === true
        const onboardingVersion = (profileData as { onboarding_version?: number | null }).onboarding_version ?? 0
        setShowOnboardingModal(!hasCompletedOnboarding || onboardingVersion < CURRENT_ONBOARDING_VERSION)
      }

      const meta = authSession.user.user_metadata as Record<string, string> | undefined
      const sessionAvatarUrl =
        profileData?.avatar_url?.trim() ||
        meta?.avatar_url ||
        meta?.picture ||
        null

      setProfile(
        profileData
          ? {
              id: (profileData as { id: string }).id ?? authSession.user.id,
              username: profileData.username,
              discord_username: (profileData as { discord_username?: string | null }).discord_username,
              avatar_url: sessionAvatarUrl || profileData.avatar_url,
              default_role: (profileData as { default_role?: string | null }).default_role,
              default_engine: (profileData as { default_engine?: string | null }).default_engine,
              default_language: (profileData as { default_language?: string | null }).default_language,
              portfolio_url: (profileData as { portfolio_url?: string | null }).portfolio_url,
              xp: typeof (profileData as { xp?: number | null }).xp === "number" ? (profileData as { xp: number }).xp : 0,
              current_title: (profileData as { current_title?: string | null }).current_title ?? null,
            }
          : authSession.user
            ? {
                id: authSession.user.id,
                username: null,
                discord_username: null,
                avatar_url: (authSession.user.user_metadata as Record<string, string> | undefined)?.avatar_url ??
                  (authSession.user.user_metadata as Record<string, string> | undefined)?.picture ??
                  null,
                default_role: null,
                default_engine: null,
                default_language: null,
                portfolio_url: null,
                xp: 0,
                current_title: null,
              }
            : null,
      )

      const profile = profileData as { username?: string | null; avatar_url?: string | null } | null
      const profileUsername = profile?.username?.trim() ?? null
      const profileAvatarUrl = sessionAvatarUrl ?? profile?.avatar_url?.trim() ?? null

      let postsWithJam: AvailabilityPostRow[] = ((postsData ?? []) as Record<string, unknown>[]).map((p) => ({
        ...p,
        username: profileUsername,
        avatar_url: profileAvatarUrl,
      })) as AvailabilityPostRow[]

      const jamId = (profileData as { jam_id?: string | null } | null)?.jam_id ?? null
      const [kudosRpcResult, jamLookupResult] = await Promise.all([
        supabase.rpc("get_kudos_counts_for_users", { p_user_ids: [uid] }),
        jamId
          ? supabase.from("external_jams").select("id, title, url").eq("id", jamId).maybeSingle()
          : Promise.resolve({ data: null }),
      ])
      const kudosMap = kudosCountsMapFromRpcRows(
        (kudosRpcResult.data ?? []) as { receiver_id: string; category: string; cnt: number | string }[],
      )
      const myKudosCounts = kudosMap.get(uid) ?? null
      postsWithJam = postsWithJam.map((p) => ({ ...p, kudosCounts: myKudosCounts }))

      const jamData = jamLookupResult.data as { id: string; title: string | null; url: string | null } | null
      if (jamData) {
        const jam: JamInfo = { id: jamData.id, title: jamData.title ?? null, url: jamData.url ?? null }
        postsWithJam = postsWithJam.map((p) => ({ ...p, jam }))
      }
      setAvailabilityPosts(postsWithJam)
      if (appsData) setApplications((appsData as ApplicationRow[]).map((r) => mapApplicationRow(r, profileMap)))
      if (rawInvitesData) setInvitations((rawInvitesData as InvitationRow[]).map(mapInvitationRow))
      if (sentAppsData) {
        setSentApplications(
          (sentAppsData as SentApplicationRow[]).map((a) => {
            const t = Array.isArray(a.teams) ? a.teams[0] ?? undefined : a.teams ?? undefined
            return {
              id: a.id,
              status: a.status,
              target_role: a.target_role ?? undefined,
              teams: t
                ? { team_name: t.team_name ?? undefined, discord_link: t.discord_link ?? undefined }
                : undefined,
            }
          }),
        )
      }

      if (authSession.user && !dailyXpClaimRef.current) {
        dailyXpClaimRef.current = true
        void claimDailyLoginXp().then((res) => {
          if (!res.ok && res.error) {
            return
          }
          if (res.ok && res.reward && gamificationRewardHasToast(res.reward)) {
            showGamificationRewards("DAILY_LOGIN", res.reward)
          }
        })
      }
    } catch (err) {
      toast.error("Error loading the dashboard.", {
        description: err instanceof Error ? err.message : "Please refresh the page.",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  // Offer to disable availability when user has joined a team (application accepted)
  // Persist in localStorage so the prompt is not shown again after the user has responded (e.g. on refresh)
  useEffect(() => {
    if (loading) return
    const userId = session?.user?.id
    const storageKey = userId ? `gamejam_availability_prompt_seen_${userId}` : null
    if (storageKey && typeof window !== "undefined") {
      const alreadySeen = localStorage.getItem(storageKey) === "true"
      if (alreadySeen) {
        setHasShownAvailabilityPrompt(true)
        return
      }
    }
    if (hasShownAvailabilityPrompt) return
    const hasAcceptedApp = sentApplications.some((a) => a.status === "accepted")
    const hasAvailability = availabilityPosts.length > 0
    if (hasAcceptedApp && hasAvailability) {
      setAvailabilityModalContext(null)
      setShowAvailabilityModal(true)
      setHasShownAvailabilityPrompt(true)
      if (storageKey && typeof window !== "undefined") {
        localStorage.setItem(storageKey, "true")
      }
    }
  }, [loading, session?.user?.id, sentApplications, availabilityPosts, hasShownAvailabilityPrompt])

  const handleDeleteTeam = async (id: string) => {
    try {
      const { error } = await supabase.from("teams").delete().eq("id", id)
      if (error) {
        toast.error("Could not delete the team.", { description: error.message })
        return
      }
      setTeams((prev) => prev.filter((t) => t.id !== id))
      setTeamIdToDelete(null)
      toast.success("Team deleted.")
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    }
  }

  const handleDeleteTeamClick = (id: string) => {
    setTeamIdToDelete(id)
  }

  const handleRenewTeam = async (id: string) => {
    const { error } = await supabase
      .from("teams")
      .update({ expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() })
      .eq("id", id)

    if (error) throw new Error(error.message)
    loadData()
    toast.success("Listing renewed.", { description: "Your listing is now visible for another 30 days." })
  }

  const handleLeaveTeam = async (id: string) => {
    if (!session?.user) {
      toast.error("You must be logged in to leave a squad.")
      return
    }

    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", id)
        .eq("user_id", session.user.id)

      if (error) {
        toast.error("Could not leave the squad.", { description: error.message })
        return
      }

      // Also remove the accepted join request so the role slot becomes available again
      await supabase
        .from("join_requests")
        .delete()
        .eq("team_id", id)
        .eq("sender_id", session.user.id)
        .eq("type", "application")
        .eq("status", "accepted")

      setTeams((prev) => prev.filter((t) => t.id !== id))
      toast.success("You left this squad.", {
        description: "You can join or create new squads from your dashboard.",
      })
    } catch (err) {
      toast.error("An error occurred.", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    }
  }

  const handleDeleteAvailabilityPost = async (postId: string) => {
    try {
      const { error } = await supabase.from("availability_posts").delete().eq("id", postId)
      if (error) {
        toast.error("Could not remove announcement.", { description: error.message })
        return
      }
      setAvailabilityPosts((prev) => prev.filter((p) => p.id !== postId))
      setAvailabilityPostIdToDelete(null)
      toast.success("Announcement removed.")
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    }
  }

  const handleDeleteAvailabilityPostClick = (postId: string) => {
    setAvailabilityPostIdToDelete(postId)
  }

  const handleAcceptApplication = async (id: string) => {
    try {
      const applicantLabel =
        applications.find((a) => a.id === id)?.username ?? "The jammer"
      const result = await acceptJoinApplication(id)
      if (!result.success) {
        toast.error("Could not accept the application.", { description: result.error })
        return
      }

      setApplications((prev) => prev.filter((a) => a.id !== id))
      if (result.ownerGamification && gamificationRewardHasToast(result.ownerGamification)) {
        showGamificationRewards("TEAM_ROSTER_COMPLETE", result.ownerGamification)
      }
      toast.success("Application accepted!", {
        description: `${applicantLabel} joined your team.`,
      })
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    }
  }

  const handleDeclineApplication = async (id: string) => {
    try {
      const { data: request } = await supabase
        .from("join_requests")
        .select("sender_id")
        .eq("id", id)
        .single()

      const { error } = await supabase.from("join_requests").update({ status: 'rejected' }).eq("id", id)
      if (error) {
        toast.error("Could not decline the application.", { description: error.message })
        return
      }

      // Email notification to the declined applicant (async, non-blocking)
      if (request?.sender_id) {
        void notifyApplicantDeclined(request.sender_id)
      }

      setApplications((prev) => prev.filter((a) => a.id !== id))
      toast.success("Application declined.", { icon: "?" })
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    }
  }

  const handleAcceptInvitation = async (invitation: InvitationData) => {
    try {
      const result = await acceptTeamInvitation(invitation.id)
      if (!result.success) {
        toast.error("Could not join the team.", { description: result.error })
        return
      }

      setInvitations((prev) => prev.filter((i) => i.id !== invitation.id))
      loadData()
      if (result.gamification && gamificationRewardHasToast(result.gamification)) {
        showGamificationRewards("JOIN_TEAM", result.gamification)
      }
      toast.success(`You joined ${invitation.squadName}!`, {
        description: invitation.discordLink ? "Check the Discord link to connect." : undefined,
      })
      setAvailabilityModalContext(invitation.squadName)
      setHasShownAvailabilityPrompt(true)
      setShowAvailabilityModal(true)
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    }
  }

  const persistAvailabilityPromptSeen = () => {
    const userId = session?.user?.id
    if (userId && typeof window !== "undefined") {
      localStorage.setItem(`gamejam_availability_prompt_seen_${userId}`, "true")
    }
  }

  const handleAvailabilityModalConfirm = async () => {
    if (!session?.user) return
    persistAvailabilityPromptSeen()
    try {
      const { error } = await supabase
        .from("availability_posts")
        .delete()
        .eq("user_id", session.user.id)
      if (error) {
        toast.error("Could not update your profile.", { description: error.message })
        return
      }
      setAvailabilityPosts([])
      toast.success("You're no longer on the Available Players list.")
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    } finally {
      setShowAvailabilityModal(false)
      setAvailabilityModalContext(null)
    }
  }

  const handleAvailabilityModalCancel = () => {
    persistAvailabilityPromptSeen()
    setShowAvailabilityModal(false)
    setAvailabilityModalContext(null)
  }

  const handleDeclineInvitation = async (id: string) => {
    try {
      const { data: request } = await supabase
        .from("join_requests")
        .select("id, team_id")
        .eq("id", id)
        .single()

      const { error } = await supabase.from("join_requests").update({ status: "rejected" }).eq("id", id)
      if (error) {
        toast.error("Could not decline the invitation.", { description: error.message })
        return
      }

      // Notification in-app pour le proprietaire : invitation declinee
      const currentUserName =
        session?.user?.user_metadata?.username ??
        session?.user?.user_metadata?.user_name ??
        session?.user?.user_metadata?.full_name ??
        session?.user?.user_metadata?.name ??
        (session?.user?.email ? session.user.email.split("@")[0] : null)

      if (request?.team_id && currentUserName) {
        void notifyOwnerInvitationDeclined(request.team_id, currentUserName)
      }

      setInvitations((prev) => prev.filter((i) => i.id !== id))
      toast.success("Invitation declined.", { icon: "?" })
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
      }
  }

  if (loading) {
    return <DashboardLoadingSkeleton />
  }

  const toActionCount = applications.length + invitations.length
  const waitingResponseCount = sentApplications.filter((s) => s.status === "pending").length
  const activityTotal = toActionCount + waitingResponseCount

  const meta = session?.user?.user_metadata as Record<string, string> | undefined
  const displayName =
    profile?.username?.trim() ||
    meta?.username?.trim() ||
    meta?.user_name?.trim() ||
    meta?.full_name?.trim() ||
    meta?.name?.trim() ||
    (session?.user?.email ? session.user.email.split("@")[0] : null) ||
    "Jammer"
  const headerXp = typeof profile?.xp === "number" ? profile.xp : 0
  const headerTitle = profile?.current_title?.trim() || "Rookie Jammer"

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 md:pt-16">
        {/* Hero section with identity + KPIs */}
        <section className="px-4 py-6 md:py-8 lg:px-6">
          <div className="mx-auto max-w-5xl space-y-4 md:space-y-6">
            {/* Compact Identity Header */}
            {session?.user?.id && profile ? (
              <DashboardIdentityHeader
                displayName={displayName}
                avatarUrl={profile.avatar_url ?? null}
                currentTitle={headerTitle}
                xp={headerXp}
              />
            ) : null}

            {/* 3 KPI Cards */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {/* Teams KPI */}
              <Card className="glass-card border-teal/20 bg-teal/5">
                <CardContent className="flex items-center gap-2 p-3 md:gap-3 md:p-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal/15 md:size-10">
                    <Users2 className="size-4 text-teal md:size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-muted-foreground md:text-xs">Teams</p>
                    <p className="text-lg font-bold tabular-nums md:text-xl">{teams.length}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Activity KPI */}
              <Card className="glass-card border-peach/20 bg-peach/5">
                <CardContent className="flex items-center gap-2 p-3 md:gap-3 md:p-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-peach/15 md:size-10">
                    <Inbox className="size-4 text-peach md:size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="text-[10px] font-medium text-muted-foreground md:text-xs">Activity</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                            aria-label="Activity info"
                          >
                            <Info className="size-2.5 md:size-3" aria-hidden />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-56 text-xs">
                          <p><span className="font-semibold">{toActionCount}</span> to action</p>
                          <p><span className="font-semibold">{waitingResponseCount}</span> waiting</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-lg font-bold tabular-nums md:text-xl">{activityTotal}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Availability KPI */}
              <Card className="glass-card border-lavender/20 bg-lavender/5">
                <CardContent className="flex items-center gap-2 p-3 md:gap-3 md:p-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-lavender/15 md:size-10">
                    <UserSearch className="size-4 text-lavender md:size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-muted-foreground md:text-xs">Available</p>
                    <p className="text-lg font-bold tabular-nums md:text-xl">{availabilityPosts.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="px-4 pb-8 lg:px-6 lg:pb-12">
          <div className="mx-auto max-w-5xl">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="glass mb-4 flex h-auto w-full touch-pan-x items-center justify-start gap-1 overflow-x-auto overscroll-x-contain rounded-xl p-1.5 [-webkit-overflow-scrolling:touch] md:mb-6 md:w-fit">
                <DashboardTabTrigger
                  value="squads"
                  tooltipLabel="My Squads"
                  showTooltip={compactTabBar}
                  className={cn(
                    "shrink-0 items-center rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
                    "data-[state=active]:border-teal/30 data-[state=active]:bg-background/80 data-[state=active]:text-teal data-[state=active]:shadow-sm",
                  )}
                  icon={<Users2 className="mr-1.5 size-4 shrink-0 text-teal" aria-hidden />}
                  label="Squads"
                />
                <DashboardTabTrigger
                  value="inbox"
                  tooltipLabel="Inbox"
                  showTooltip={compactTabBar}
                  className={cn(
                    "shrink-0 items-center rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
                    "data-[state=active]:border-peach/30 data-[state=active]:bg-background/80 data-[state=active]:text-peach data-[state=active]:shadow-sm",
                  )}
                  icon={<Inbox className="mr-1.5 size-4 shrink-0 text-peach" aria-hidden />}
                  label="Inbox"
                />
                <DashboardTabTrigger
                  value="availability"
                  tooltipLabel="Availability"
                  showTooltip={compactTabBar}
                  className={cn(
                    "shrink-0 items-center rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
                    "data-[state=active]:border-lavender/30 data-[state=active]:bg-background/80 data-[state=active]:text-lavender data-[state=active]:shadow-sm",
                  )}
                  icon={<UserSearch className="mr-1.5 size-4 shrink-0 text-lavender" aria-hidden />}
                  label="Available"
                />
                <DashboardTabTrigger
                  value="achievements"
                  tooltipLabel="Achievements"
                  showTooltip={compactTabBar}
                  className={cn(
                    "shrink-0 items-center rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
                    "data-[state=active]:border-amber-500/30 data-[state=active]:bg-background/80 data-[state=active]:text-amber-500 data-[state=active]:shadow-sm",
                  )}
                  icon={<Trophy className="mr-1.5 size-4 shrink-0 text-amber-500" aria-hidden />}
                  label="Achievements"
                />
                <DashboardTabTrigger
                  value="settings"
                  tooltipLabel="Settings"
                  showTooltip={compactTabBar}
                  className={cn(
                    "shrink-0 items-center rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
                    "data-[state=active]:border-slate-400/30 data-[state=active]:bg-background/80 data-[state=active]:text-slate-500 data-[state=active]:shadow-sm dark:data-[state=active]:text-slate-300",
                  )}
                  icon={<Settings2 className="mr-1.5 size-4 shrink-0 text-slate-400" aria-hidden />}
                  label="Settings"
                />
              </TabsList>

              <TabsContent value="squads" className="mt-0">
                {teams.length === 0 && availabilityPosts.length === 0 ? (
                  <DashboardEmptyState />
                ) : (
                  <DashboardMyTeams
                    teams={teams}
                    onDelete={handleDeleteTeamClick}
                    onRenew={handleRenewTeam}
                    onLeave={handleLeaveTeam}
                  />
                )}
              </TabsContent>

              <TabsContent value="inbox" className="mt-0 flex flex-col gap-4 md:gap-6">
                <PushNotificationBanner />
                <DashboardIncomingApplications
                  applications={applications}
                  onAccept={handleAcceptApplication}
                  onDecline={handleDeclineApplication}
                />
                <DashboardSquadInvitations
                  invitations={invitations}
                  onAccept={handleAcceptInvitation}
                  onDecline={handleDeclineInvitation}
                />
                <SentApplicationsSection sentApplications={sentApplications} />
              </TabsContent>

              <TabsContent value="availability" className="mt-0 flex flex-col gap-4 md:gap-6">
                <DashboardRecommendedTeams teams={recommendedTeams} />
                <DashboardMyAvailability
                  availabilityPosts={availabilityPosts}
                  onDeletePost={handleDeleteAvailabilityPostClick}
                  profileAvatarUrl={profile?.avatar_url ?? null}
                />
              </TabsContent>

              <TabsContent value="achievements" className="mt-0 flex flex-col gap-4 md:gap-6">
                {session?.user?.id ? (
                  <>
                    <GamificationDashboardFull
                      userId={session.user.id}
                      onDataChanged={() => void loadData()}
                    />
                    <ProfileGamification userId={session.user.id} badgesOnly />
                  </>
                ) : null}
              </TabsContent>

              <TabsContent value="settings" className="mt-0 flex w-full flex-col">
                <ProfileSettings
                  profile={profile}
                  onProfileUpdated={loadData}
                  displayNameFallback={
                    meta?.username?.trim() ||
                    meta?.user_name?.trim() ||
                    meta?.full_name?.trim() ||
                    meta?.name?.trim() ||
                    (session?.user?.email ? session.user.email.split("@")[0] : null)
                  }
                />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <OnboardingModal
        open={showOnboardingModal}
        onOpenChange={setShowOnboardingModal}
        profile={profile}
      />

      <AlertDialog open={showAvailabilityModal} onOpenChange={(open) => !open && handleAvailabilityModalCancel()}>
        <AlertDialogContent className="glass-card rounded-2xl border-border/40">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-success/15">
                <UserMinus className="size-5 text-success" />
              </div>
              <AlertDialogTitle className="text-left">
                Congratulations! You&apos;ve joined the team.
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              {availabilityModalContext ? (
                <>You&apos;ve joined {availabilityModalContext}. </>
              ) : null}
              Would you like to remove your profile from the &quot;Available Players&quot; list to stop receiving requests?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:justify-end">
            <AlertDialogCancel onClick={handleAvailabilityModalCancel} className="rounded-xl">
              No, keep it
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAvailabilityModalConfirm} className="rounded-xl bg-primary">
              Yes, remove me
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={teamIdToDelete !== null} onOpenChange={(open) => !open && setTeamIdToDelete(null)}>
        <AlertDialogContent className="glass-card rounded-2xl border-border/40">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/15">
                <Trash2 className="size-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-left">Delete this team?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              This action cannot be undone. The team listing will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:justify-end">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => teamIdToDelete && handleDeleteTeam(teamIdToDelete)}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={availabilityPostIdToDelete !== null} onOpenChange={(open) => !open && setAvailabilityPostIdToDelete(null)}>
        <AlertDialogContent className="glass-card rounded-2xl border-border/40">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/15">
                <Trash2 className="size-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-left">Remove this availability announcement?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              Your announcement will be removed from the Available Players list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:justify-end">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => availabilityPostIdToDelete && handleDeleteAvailabilityPost(availabilityPostIdToDelete)}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
