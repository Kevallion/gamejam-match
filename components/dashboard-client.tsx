"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import type { TeamData } from "@/components/dashboard-my-teams"
import { DashboardSquadsCompact } from "@/components/dashboard-squads-compact"
import { DashboardRecommendedTeams } from "@/components/dashboard-recommended-teams"
import { DashboardAvailabilityCompact } from "@/components/dashboard-availability-compact"
import { DashboardInboxCompact } from "@/components/dashboard-inbox-compact"
import type { ApplicationData } from "@/components/dashboard-incoming-applications"
import type { InvitationData } from "@/components/dashboard-squad-invitations"
import type {
  SentApplicationOutboxItem,
  SentInvitationOutboxItem,
} from "@/components/dashboard-sent-outbox"
import { Trash2, Trophy, UserMinus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { cancelJoinRequest } from "@/app/actions/join-request-actions"
import {
  markNotificationsReadForJoinRequest,
  notifyApplicantDeclined,
  notifyOwnerInvitationDeclined,
} from "@/app/actions/team-actions"
import {
  acceptJoinApplication,
  acceptTeamInvitation,
  leaveTeam,
} from "@/app/actions/team-membership-actions"
import { readOwnDiscordUsername } from "@/lib/profile-discord"
import { claimDailyLoginXp } from "@/app/actions/gamification-actions"
import { OnboardingModal } from "@/components/onboarding-modal"
import { ProfileSettings, type ProfileSettingsProfile } from "@/components/profile-settings"
import { ProfileGamification } from "@/components/profile-gamification"
import {
  GamificationDashboardFull,
} from "@/components/gamification-dashboard"
import { PushNotificationBanner } from "@/components/push-notification-banner"
import { buildDashboardNextSteps, DashboardNextSteps } from "@/components/dashboard-next-steps"
import { MonthlyKudosLeaderboard } from "@/components/monthly-kudos-leaderboard"
import type { Session } from "@supabase/supabase-js"
import { showGamificationRewards } from "@/components/gamification-reward-toasts"
import { gamificationRewardHasToast } from "@/lib/gamification-reward-types"
import { toast } from "sonner"
import { ENGINE_OPTIONS, EXPERIENCE_STYLES, ROLE_STYLES, parseProgrammingLanguages } from "@/lib/constants"
import { isMissingColumnError } from "@/lib/optional-column"
import { JammerTitleBadge, JammerLevelBadge } from "@/components/profile-card"
import { levelFromTotalXp } from "@/lib/gamification-level"
import {
  fetchDashboardJoinRequests,
  getRecommendedTeams,
  type SmartMatchRoleInput,
  type SmartRecommendedTeam,
} from "@/lib/queries"
import { discordLinkFromEmbed } from "@/lib/team-discord"
import { kudosCountsMapFromRpcRows, type KudosCounts } from "@/lib/kudos"
import {
  NOTIFICATION_ENRICHED_SELECT,
  fetchNotificationsAsNormalized,
  type EnrichedNotificationRow,
  type NormalizedNotificationFeedItem,
} from "@/lib/notifications-enriched"

const LEVEL_STYLES = EXPERIENCE_STYLES
const FALLBACK_ROLE = { label: "Other", emoji: "?", color: "bg-muted text-muted-foreground" }
const FALLBACK_LEVEL = EXPERIENCE_STYLES["beginner"]

type TeamRow = {
  id: string
  user_id: string
  team_name: string | null
  game_name: string | null
  engine: string | null
  language: string | null
  description: string | null
  team_vibe?: string | null
  expires_at?: string | null
  looking_for: unknown
  discord_link?: string | null
  team_discord_links?:
    | { discord_link?: string | null }
    | { discord_link?: string | null }[]
    | null
  jam_start_date?: string | null
  jam_end_date?: string | null
  created_at?: string | null
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
  message?: string | null
  teams?: {
    team_name?: string | null
    game_name?: string | null
    discord_link?: string | null
    engine?: string | null
    description?: string | null
    team_vibe?: string | null
    experience_required?: string | null
    external_jams?: { title?: string | null } | { title?: string | null }[] | null
  } | null
}

type MembershipRow = {
  team_id: string | null
}

export type JamInfo = { id: string; title: string | null; url: string | null }

export type AvailabilityPostRow = {
  id: string
  user_id: string
  availability: string
  expires_at: string
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

export type DashboardFixture = {
  displayName: string
  profile: ProfileSettingsProfile
  teams: TeamData[]
  availabilityPosts: AvailabilityPostRow[]
  applications: ApplicationData[]
  invitations: InvitationData[]
  sentApplications: SentApplicationOutboxItem[]
  sentInvitations: SentInvitationOutboxItem[]
  recommendedTeams: SmartRecommendedTeam[]
  gamification: { xp: number; currentTitle: string; unlockedTitles: string[] }
  badges: { badge_id: string; earned_at: string }[]
  kudos: { userId: string; username: string; total: number }[]
}

type DashboardClientProps = {
  defaultTab?: string | null
  /** Dev-only populated preview. Production dashboard never passes this. */
  fixture?: DashboardFixture | null
}

const VALID_TABS = ["squads", "inbox", "availability", "achievements", "settings"] as const

const LEGACY_TAB_TO_CURRENT: Record<string, (typeof VALID_TABS)[number]> = {
  requests: "inbox",
  overview: "squads",
  teams: "squads",
  profile: "settings",
  available: "availability",
}

function resolveDashboardTab(raw: string | null | undefined): (typeof VALID_TABS)[number] {
  const key = (raw ?? "").trim().toLowerCase()
  const mapped = LEGACY_TAB_TO_CURRENT[key]
  if (mapped) return mapped
  if ((VALID_TABS as readonly string[]).includes(key)) {
    return key as (typeof VALID_TABS)[number]
  }
  return "squads"
}

function DashboardLoadingSkeleton() {
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background">
      <Navbar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full min-w-0 max-w-6xl space-y-4 px-4 py-6 lg:px-6 lg:pt-24">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </main>
    </div>
  )
}

function greetingLabel(date: Date): string {
  const hour = date.getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

function DashboardHeader({
  displayName,
  level,
  title,
  actionHref,
  actionLabel,
}: {
  displayName: string
  level: number
  title: string
  actionHref: string
  actionLabel: string
}) {
  const now = new Date()
  const greeting = greetingLabel(now)
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now)

  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p suppressHydrationWarning className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {dateLabel}
        </p>
        <div className="mt-1 flex min-w-0 items-center gap-2">
          <h1 suppressHydrationWarning className="min-w-0 truncate text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {greeting}, {displayName}
          </h1>
          <JammerLevelBadge level={level} className="shrink-0" />
        </div>
        <JammerTitleBadge title={title} className="mt-1 min-w-0 truncate text-sm" />
      </div>
      <Button asChild className="h-11 w-full min-w-0 max-w-full rounded-xl bg-teal text-teal-foreground hover:bg-teal/90 sm:w-auto">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  )
}

function DashboardStats({
  toAnswer,
  waiting,
  squads,
  posts,
  onSelect,
}: {
  toAnswer: number
  waiting: number
  squads: number
  posts: number
  onSelect: (tab: string) => void
}) {
  const items = [
    { id: "inbox", label: "To answer", value: toAnswer, hint: "Applications and invites", urgent: toAnswer > 0 },
    { id: "inbox", label: "Waiting", value: waiting, hint: "Sent, still pending", urgent: false },
    { id: "squads", label: "Squads", value: squads, hint: "You belong to", urgent: false },
    { id: "availability", label: "Posts", value: posts, hint: "Availability, max 3", urgent: false },
  ]
  return (
    <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onSelect(item.id)}
          className={cn(
            "min-w-0 rounded-2xl border bg-card px-3 py-3 text-left shadow-sm transition-colors motion-reduce:transition-none",
            item.urgent ? "border-peach/40 bg-peach/10" : "border-border/60 hover:border-teal/30",
          )}
        >
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-foreground">{item.value}</p>
          <p className="truncate text-xs text-muted-foreground">{item.hint}</p>
        </button>
      ))}
    </div>
  )
}

function ResponsiveConfirmDrawer({
  open,
  isMobile,
  icon,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  confirmClassName,
}: {
  open: boolean
  isMobile: boolean
  icon: ReactNode
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  confirmClassName?: string
}) {
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(o) => !o && onCancel()}>
        <DrawerContent className="rounded-t-3xl border-border/40 bg-card">
          <DrawerHeader className="text-left">
            <div className="flex items-center gap-3">
              {icon}
              <DrawerTitle>{title}</DrawerTitle>
            </div>
            <DrawerDescription className="mt-2">{description}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="flex-row gap-3 pb-8">
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1 rounded-xl" onClick={onCancel}>
                {cancelLabel}
              </Button>
            </DrawerClose>
            <Button className={cn("flex-1 rounded-xl", confirmClassName)} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent className="glass-card rounded-2xl border-border/40">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {icon}
            <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2 sm:justify-end">
          <AlertDialogCancel onClick={onCancel} className="rounded-xl">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={cn("rounded-xl", confirmClassName)}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ─── Mobile Section Title (shown when bottom bar is active) ──────────────────

export function DashboardClient({ defaultTab: defaultTabProp, fixture = null }: DashboardClientProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get("tab")
  const highlightRequestId = searchParams.get("highlightRequest")

  const urlTab = useMemo(
    () => resolveDashboardTab(tabFromUrl ?? defaultTabProp),
    [tabFromUrl, defaultTabProp],
  )
  const [activeTab, setActiveTab] = useState(urlTab)

  useEffect(() => {
    setActiveTab(urlTab)
  }, [urlTab])

  useEffect(() => {
    const raw = (tabFromUrl ?? "").trim().toLowerCase()
    const mapped = LEGACY_TAB_TO_CURRENT[raw]
    if (!mapped) return
    const params = new URLSearchParams(searchParams.toString())
    if (mapped === "squads") {
      params.delete("tab")
    } else {
      params.set("tab", mapped)
    }
    const qs = params.toString()
    const nextUrl = qs ? `${pathname}?${qs}` : pathname
    const currentQs = searchParams.toString()
    const currentUrl = currentQs ? `${pathname}?${currentQs}` : pathname
    if (nextUrl === currentUrl) return
    router.replace(nextUrl, { scroll: false })
  }, [tabFromUrl, pathname, router, searchParams])

  const handleTabChange = useCallback(
    (value: string) => {
      const next = resolveDashboardTab(value)
      setActiveTab(next)
      const params = new URLSearchParams(searchParams.toString())
      if (next === "squads") {
        params.delete("tab")
      } else {
        params.set("tab", next)
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const [session, setSession] = useState<Session | null>(
    fixture
      ? ({ user: { id: "preview-user", user_metadata: { username: fixture.displayName } } } as unknown as Session)
      : null,
  )
  const [teams, setTeams] = useState<TeamData[]>(fixture?.teams ?? [])
  const [availabilityPosts, setAvailabilityPosts] = useState<AvailabilityPostRow[]>(fixture?.availabilityPosts ?? [])
  const [applications, setApplications] = useState<ApplicationData[]>(fixture?.applications ?? [])
  const [invitations, setInvitations] = useState<InvitationData[]>(fixture?.invitations ?? [])
  const [sentApplications, setSentApplications] = useState<SentApplicationOutboxItem[]>(fixture?.sentApplications ?? [])
  const [busyInboxRequestId, setBusyInboxRequestId] = useState<string | null>(null)
  const [leaveTeamId, setLeaveTeamId] = useState<string | null>(null)
  const [leavingTeam, setLeavingTeam] = useState(false)
  const [sentInvitationsOutbox, setSentInvitationsOutbox] = useState<SentInvitationOutboxItem[]>(fixture?.sentInvitations ?? [])
  const [cancellingSentRequestId, setCancellingSentRequestId] = useState<string | null>(null)
  const [, setActivityNotifications] = useState<NormalizedNotificationFeedItem[]>([])
  const [loading, setLoading] = useState(!fixture)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [availabilityModalContext, setAvailabilityModalContext] = useState<string | null>(null)
  const [hasShownAvailabilityPrompt, setHasShownAvailabilityPrompt] = useState(false)
  const [availabilityPostIdToDelete, setAvailabilityPostIdToDelete] = useState<string | null>(null)
  const [renewingAvailabilityPostId, setRenewingAvailabilityPostId] = useState<string | null>(null)
  const [recommendedTeams, setRecommendedTeams] = useState<SmartRecommendedTeam[]>(fixture?.recommendedTeams ?? [])
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [profile, setProfile] = useState<ProfileSettingsProfile | null>(fixture?.profile ?? null)

  const dailyXpClaimRef = useRef(false)
  const isMobile = useIsMobile()

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
      discord_link: discordLinkFromEmbed(t.team_discord_links) ?? t.discord_link ?? null,
      isOwner: t.user_id === authUserId,
      jamStartDate: t.jam_start_date ?? null,
      jamEndDate: t.jam_end_date ?? null,
      createdAt: t.created_at ?? null,
      teamVibe: t.team_vibe ?? null,
      expiresAt: t.expires_at ?? null,
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
      teamName: r.teams?.team_name || "Unknown squad",
      role: targetRole,
      motivation: r.message || "No motivation provided.",
      createdAt: r.created_at,
    }
  }

  const mapInvitationRow = (r: InvitationRow): InvitationData => {
    const eng = r.teams?.engine?.trim()
    const engineLabel = eng
      ? (ENGINE_OPTIONS.find((o) => o.value === eng)?.label ?? eng)
      : null
    const jamRaw = r.teams?.external_jams
    const jamRow = Array.isArray(jamRaw) ? jamRaw[0] : jamRaw
    const expKey = r.teams?.experience_required?.trim().toLowerCase()
    const expLabel = expKey
      ? (EXPERIENCE_STYLES[expKey]?.label ?? r.teams?.experience_required ?? null)
      : null
    return {
      id: r.id,
      team_id: r.team_id,
      squadName: r.teams?.team_name || "Unknown Squad",
      gameName: r.teams?.game_name ?? null,
      discordLink: r.teams?.discord_link ?? null,
      targetRole: r.target_role ?? null,
      captainMessage: r.message ?? null,
      engineLabel,
      jamTitle: jamRow?.title ?? null,
      description: r.teams?.description ?? null,
      teamVibe: r.teams?.team_vibe ?? null,
      experienceRequired: expLabel,
    }
  }

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
        profileQueryResult,
        joinBundleResult,
        { data: postsData },
        { data: notifRaw, error: notifErr },
      ] = await Promise.all([
        supabase.from("team_members").select("team_id").eq("user_id", uid),
        (async () => {
          const withRoles =
            "id, has_completed_onboarding, onboarding_version, jam_id, username, avatar_url, default_role, default_engine, engine, default_language, portfolio_url, jam_style, xp, current_title, profile_roles(role, experience_level, is_primary)"
          const withLanguages = await supabase
            .from("profiles")
            .select(`${withRoles}, programming_languages`)
            .eq("id", uid)
            .maybeSingle()
          if (withLanguages.error && isMissingColumnError(withLanguages.error, "programming_languages")) {
            return supabase.from("profiles").select(withRoles).eq("id", uid).maybeSingle()
          }
          return withLanguages
        })(),
        fetchDashboardJoinRequests(uid, supabase),
        supabase
          .from("availability_posts")
          .select("id, user_id, availability, expires_at, role, experience, jam_style, engine, language, bio, portfolio_link")
          .eq("user_id", uid)
          .order("updated_at", { ascending: false }),
        supabase
          .from("notifications")
          .select(NOTIFICATION_ENRICHED_SELECT)
          .eq("user_id", uid)
          .order("created_at", { ascending: false })
          .limit(40),
      ])
      let profileData = profileQueryResult.data as
        | {
            id: string
            has_completed_onboarding?: boolean | null
            onboarding_version?: number | null
            jam_id?: string | null
            username?: string | null
            avatar_url?: string | null
            discord_username?: string | null
            default_role?: string | null
            default_engine?: string | null
            engine?: string | null
            default_language?: string | null
            programming_languages?: string[] | null
            portfolio_url?: string | null
            jam_style?: string | null
            xp?: number | null
            current_title?: string | null
            profile_roles?: SmartMatchRoleInput[] | null
          }
        | null

      // Fallback for environments where `profile_roles` relation is not yet available.
      if (profileQueryResult.error) {
        const { data: fallbackProfileData, error: fallbackProfileError } = await supabase
          .from("profiles")
          .select(
            "id, has_completed_onboarding, onboarding_version, jam_id, username, avatar_url, default_role, default_engine, engine, default_language, portfolio_url, jam_style, xp, current_title",
          )
          .eq("id", uid)
          .maybeSingle()

        if (!fallbackProfileError) {
          profileData = fallbackProfileData
            ? { ...fallbackProfileData, profile_roles: [] }
            : null
        }
      }

      const ownDiscord = await readOwnDiscordUsername(supabase, uid)

      if (!notifErr && notifRaw) {
        const normalized = await fetchNotificationsAsNormalized(
          supabase,
          notifRaw as EnrichedNotificationRow[],
        )
        setActivityNotifications(normalized)
      } else {
        setActivityNotifications([])
      }

      if (joinBundleResult.error) {
        toast.error("Could not load inbox data.", { description: joinBundleResult.error })
      }

      const bundle = joinBundleResult.data ?? {
        incomingApplications: [],
        incomingInvitations: [],
        sentApplications: [],
        sentInvitations: [],
      }

      const appsData = bundle.incomingApplications
      const rawInvitesData = bundle.incomingInvitations
      const sentAppsData = bundle.sentApplications

      const memberTeamIds = [
        ...new Set((membershipRows as MembershipRow[] | null)?.map((m) => m.team_id).filter(Boolean) ?? []),
      ] as string[]

      let teamsQuery = supabase
        .from("teams")
        .select("*, team_members(count), team_discord_links(discord_link)")
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

      const inviteeIdsForSent = [
        ...new Set(bundle.sentInvitations.map((s) => s.sender_id).filter(Boolean)),
      ] as string[]
      const senderIds = [...new Set(((appsData || []) as ApplicationRow[]).map((a) => a.sender_id).filter(Boolean))]
      const profileIds = [...new Set([...senderIds, ...inviteeIdsForSent])]
      const profileMap: Record<string, { username?: string; avatar_url?: string }> = {}
      if (profileIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", profileIds)
        for (const p of profilesData || []) {
          profileMap[p.id] = { username: p.username, avatar_url: p.avatar_url ?? undefined }
        }
      }

      const profilePrefs = profileData as {
        default_role?: string | null
        default_engine?: string | null
        engine?: string | null
        profile_roles?: SmartMatchRoleInput[] | null
      } | null
      const { teams: smartMatches } = await getRecommendedTeams({
        id: uid,
        default_role: profilePrefs?.default_role ?? null,
        profile_roles: profilePrefs?.profile_roles ?? [],
        default_engine: profilePrefs?.default_engine ?? null,
        profile_engine: profilePrefs?.engine ?? null,
        excludeTeamIds: Array.from(merged.keys()),
      })
      setRecommendedTeams(smartMatches)

      // Show onboarding only for users that never completed it.
      if (!profileData) {
        setShowOnboardingModal(true)
      } else {
        const hasCompletedOnboarding = profileData.has_completed_onboarding === true
        setShowOnboardingModal(!hasCompletedOnboarding)
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
              discord_username: ownDiscord,
              avatar_url: sessionAvatarUrl || profileData.avatar_url,
              default_role: (profileData as { default_role?: string | null }).default_role,
              jam_style: (profileData as { jam_style?: string | null }).jam_style ?? null,
              profile_roles: (
                ((profileData as { profile_roles?: SmartMatchRoleInput[] | null }).profile_roles ?? [])
                  .filter((role) => role?.role?.trim())
                  .map((role) => ({
                    role: (role.role ?? "").trim(),
                    experience_level: (role.experience_level ?? "regular").trim() || "regular",
                    is_primary: role.is_primary === true,
                  }))
                  .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
              ),
              default_engine: (profileData as { default_engine?: string | null }).default_engine,
              default_language: (profileData as { default_language?: string | null }).default_language,
              programming_languages: parseProgrammingLanguages(
                (profileData as { programming_languages?: unknown }).programming_languages,
              ),
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
                jam_style: null,
                profile_roles: [],
                default_engine: null,
                default_language: null,
                programming_languages: [],
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

      const seenSentTeams = new Set<string>()
      const latestSentApps = sentAppsData.filter((a) => {
        const teamId = a.team_id ?? ""
        if (teamId && seenSentTeams.has(teamId)) return false
        if (teamId) seenSentTeams.add(teamId)
        if (a.status === "accepted" && teamId && !memberTeamIds.includes(teamId)) return false
        return true
      })
      setSentApplications(
        latestSentApps.map((a) => {
          const t = Array.isArray(a.teams) ? a.teams[0] ?? undefined : a.teams ?? undefined
          return {
            id: a.id,
            status: a.status,
            target_role: a.target_role ?? null,
            teamName: t?.team_name || "Unknown squad",
            discord_link: t?.discord_link ?? null,
          } satisfies SentApplicationOutboxItem
        }),
      )

      const seenInvites = new Set<string>()
      const latestInvites = bundle.sentInvitations.filter((row) => {
        const key = `${row.team_id}:${row.sender_id ?? ""}`
        if (seenInvites.has(key)) return false
        seenInvites.add(key)
        return true
      })
      setSentInvitationsOutbox(
        latestInvites.map((row) => {
          const inviteeId = row.sender_id ?? ""
          const prof = inviteeId ? profileMap[inviteeId] : undefined
          const tm = row.teams
          const teamMeta = Array.isArray(tm) ? tm[0] : tm
          return {
            id: row.id,
            status: row.status,
            target_role: row.target_role ?? null,
            teamName: teamMeta?.team_name || "Unknown squad",
            inviteeUserId: inviteeId,
            inviteeUsername: prof?.username?.trim() || row.sender_name?.trim() || "Jammer",
            inviteeAvatarUrl: prof?.avatar_url ?? null,
          } satisfies SentInvitationOutboxItem
        }),
      )

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
    if (fixture) return
    void loadData()
  }, [loadData, fixture])

  useEffect(() => {
    const uid = session?.user?.id
    if (!uid || fixture) return
    let cancelled = false
    const refreshActivity = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select(NOTIFICATION_ENRICHED_SELECT)
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(40)
      if (cancelled || error || !data) return
      const normalized = await fetchNotificationsAsNormalized(
        supabase,
        data as EnrichedNotificationRow[],
      )
      if (!cancelled) setActivityNotifications(normalized)
    }
    const channel = supabase
      .channel(`dashboard-activity-${uid}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` },
        () => {
          void refreshActivity()
        },
      )
      .subscribe()
    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [session?.user?.id, fixture])

  useEffect(() => {
    if (loading || activeTab !== "inbox" || !highlightRequestId?.trim()) return
    const rid = highlightRequestId.trim()
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(`inbox-request-${rid}`)
      if (!el) return
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      el.classList.add("ring-2", "ring-teal/50", "ring-offset-2", "ring-offset-background", "rounded-2xl")
      window.setTimeout(() => {
        el.classList.remove("ring-2", "ring-teal/50", "ring-offset-2", "ring-offset-background", "rounded-2xl")
      }, 3200)
    })
    return () => cancelAnimationFrame(frame)
  }, [loading, activeTab, highlightRequestId, applications.length, invitations.length])

  // Offer to disable availability when user has joined a team (application accepted)
  // Persist in localStorage so the prompt is not shown again after the user has responded (e.g. on refresh)
  useEffect(() => {
    if (loading || fixture) return
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
  }, [loading, fixture, session?.user?.id, sentApplications, availabilityPosts, hasShownAvailabilityPrompt])

  const handleCancelPendingSentRequest = async (id: string) => {
    setCancellingSentRequestId(id)
    setSentApplications((prev) => prev.filter((a) => a.id !== id))
    setSentInvitationsOutbox((prev) => prev.filter((i) => i.id !== id))

    try {
      const result = await cancelJoinRequest(id)
      if (!result.success) {
        toast.error("Could not cancel this request.", { description: result.error })
        void loadData()
        return
      }
      toast.success("Request cancelled.", {
        description: "Your pending application or invitation has been removed.",
      })
      void loadData()
    } catch (err) {
      toast.error("An error occurred.", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
      void loadData()
    } finally {
      setCancellingSentRequestId(null)
    }
  }

  const handleLeaveTeam = (id: string) => {
    if (!session?.user) {
      toast.error("You must be logged in to leave a squad.")
      return
    }
    setLeaveTeamId(id)
  }

  const confirmLeaveTeam = async () => {
    if (!leaveTeamId || leavingTeam) return
    setLeavingTeam(true)
    try {
      const result = await leaveTeam(leaveTeamId)
      if (!result.success) {
        toast.error("Could not leave the squad.", { description: result.error })
        return
      }
      setTeams((prev) => prev.filter((t) => t.id !== leaveTeamId))
      toast.success("You left this squad.", {
        description: "The squad owner has been notified.",
      })
      setLeaveTeamId(null)
      void loadData()
    } catch (err) {
      toast.error("An error occurred.", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setLeavingTeam(false)
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

  const handleRenewAvailabilityPost = async (postId: string) => {
    if (!session?.user) {
      toast.error("You must be logged in.")
      return
    }
    const post = availabilityPosts.find((p) => p.id === postId)
    const parsedExp = post?.expires_at ? new Date(post.expires_at).getTime() : NaN
    const currentExpMs = Number.isFinite(parsedExp) ? parsedExp : Date.now()
    const baseMs = Math.max(Date.now(), currentExpMs)
    const newExpires = new Date(baseMs + 30 * 24 * 60 * 60 * 1000).toISOString()
    setRenewingAvailabilityPostId(postId)
    try {
      const { error } = await supabase
        .from("availability_posts")
        .update({ expires_at: newExpires })
        .eq("id", postId)
        .eq("user_id", session.user.id)
      if (error) {
        toast.error("Could not renew announcement.", { description: error.message })
        return
      }
      await loadData()
      toast.success("Announcement renewed.", {
        description: "Your post stays visible on Available Players for another 30 days.",
      })
    } catch (err) {
      toast.error("An error occurred.", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setRenewingAvailabilityPostId(null)
    }
  }

  const handleAcceptApplication = async (id: string) => {
    if (busyInboxRequestId) return
    const removed = applications.find((a) => a.id === id)
    const applicantLabel = removed?.username ?? "The jammer"
    setBusyInboxRequestId(id)
    setApplications((prev) => prev.filter((a) => a.id !== id))
    try {
      const result = await acceptJoinApplication(id)
      if (!result.success) {
        if (removed) setApplications((prev) => [removed, ...prev.filter((a) => a.id !== removed.id)])
        toast.error("Could not accept the application.", { description: result.error })
        return
      }

      if (result.ownerGamification && gamificationRewardHasToast(result.ownerGamification)) {
        showGamificationRewards("TEAM_ROSTER_COMPLETE", result.ownerGamification)
      }
      toast.success("Application accepted!", {
        description: `${applicantLabel} joined your squad.`,
      })
      void loadData()
    } catch (err) {
      if (removed) setApplications((prev) => [removed, ...prev.filter((a) => a.id !== removed.id)])
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    } finally {
      setBusyInboxRequestId(null)
    }
  }

  const handleDeclineApplication = async (id: string) => {
    if (busyInboxRequestId) return
    const removed = applications.find((a) => a.id === id)
    setBusyInboxRequestId(id)
    setApplications((prev) => prev.filter((a) => a.id !== id))
    try {
      const { data: request } = await supabase
        .from("join_requests")
        .select("sender_id, team_id, teams(team_name)")
        .eq("id", id)
        .single()

      const { error } = await supabase.from("join_requests").update({ status: 'rejected' }).eq("id", id)
      if (error) {
        if (removed) setApplications((prev) => [removed, ...prev.filter((a) => a.id !== removed.id)])
        toast.error("Could not decline the application.", { description: error.message })
        return
      }

      void markNotificationsReadForJoinRequest(id)

      // Email notification to the declined applicant (async, non-blocking)
      if (request?.sender_id) {
        const teamMeta = request.teams as { team_name?: string | null } | { team_name?: string | null }[] | null
        const tn = Array.isArray(teamMeta) ? (teamMeta[0]?.team_name ?? null) : (teamMeta?.team_name ?? null)
        void notifyApplicantDeclined(
          request.sender_id as string,
          (request.team_id as string | null) ?? null,
          session?.user?.id ?? null,
          tn,
        )
      }

      toast.success("Application declined.")
    } catch (err) {
      if (removed) setApplications((prev) => [removed, ...prev.filter((a) => a.id !== removed.id)])
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    } finally {
      setBusyInboxRequestId(null)
    }
  }

  const handleAcceptInvitation = async (invitation: InvitationData) => {
    if (busyInboxRequestId) return
    setBusyInboxRequestId(invitation.id)
    try {
      const result = await acceptTeamInvitation(invitation.id)
      if (!result.success) {
        toast.error("Could not join the squad.", { description: result.error })
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
    } finally {
      setBusyInboxRequestId(null)
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
    if (busyInboxRequestId) return
    const removed = invitations.find((item) => item.id === id)
    setBusyInboxRequestId(id)
    setInvitations((prev) => prev.filter((item) => item.id !== id))
    try {
      const { data: request } = await supabase
        .from("join_requests")
        .select("id, team_id")
        .eq("id", id)
        .single()

      const { error } = await supabase.from("join_requests").update({ status: "rejected" }).eq("id", id)
      if (error) {
        if (removed) setInvitations((prev) => [removed, ...prev.filter((item) => item.id !== removed.id)])
        toast.error("Could not decline the invitation.", { description: error.message })
        return
      }

      void markNotificationsReadForJoinRequest(id)

      if (request?.team_id) {
        void notifyOwnerInvitationDeclined(
          request.team_id,
          profile?.username?.trim() || "",
          session?.user?.id ?? null,
        )
      }

      toast.success("Invitation declined.", {
        description: "The squad captain has been notified.",
      })
    } catch (err) {
      if (removed) setInvitations((prev) => [removed, ...prev.filter((item) => item.id !== removed.id)])
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    } finally {
      setBusyInboxRequestId(null)
    }
  }

  if (loading) {
    return <DashboardLoadingSkeleton />
  }

  const toActionCount = applications.length + invitations.length
  const waitingResponseCount =
    sentApplications.filter((s) => s.status === "pending").length +
    sentInvitationsOutbox.filter((s) => s.status === "pending").length
  const activityTotal = toActionCount + waitingResponseCount

  const meta = session?.user?.user_metadata as Record<string, string> | undefined
  const displayName =
    profile?.username?.trim() ||
    meta?.username?.trim() ||
    meta?.user_name?.trim() ||
    meta?.full_name?.trim() ||
    meta?.name?.trim() ||
    "Jammer"
  const headerTitle = profile?.current_title?.trim() || "Rookie Jammer"
  const headerLevel = levelFromTotalXp(typeof profile?.xp === "number" ? profile.xp : 0)
  const setupSteps = buildDashboardNextSteps({
    hasTeam: teams.length > 0,
    hasAvailability: availabilityPosts.length > 0,
    hasDiscord: Boolean(profile?.discord_username?.trim()),
    hasPortfolio: Boolean(profile?.portfolio_url?.trim()),
    hasInboxActivity: activityTotal > 0,
  })
  const nextStep = setupSteps.find((step) => !step.done)
  const primary = toActionCount > 0
    ? { href: "/dashboard?tab=inbox", label: `Review inbox (${toActionCount})` }
    : nextStep
      ? { href: nextStep.href, label: nextStep.label }
      : { href: "/teams", label: "Browse squads" }

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background">
      <Navbar />
      <main className="min-w-0 flex-1 overflow-x-clip">
        <section className="mx-auto w-full min-w-0 max-w-6xl space-y-4 px-4 py-6 lg:space-y-6 lg:px-6 lg:pt-24">
          <DashboardHeader
            displayName={displayName}
            level={headerLevel}
            title={headerTitle}
            actionHref={primary.href}
            actionLabel={primary.label}
          />
          <DashboardStats
            toAnswer={toActionCount}
            waiting={waitingResponseCount}
            squads={teams.length}
            posts={availabilityPosts.length}
            onSelect={handleTabChange}
          />
          <Tabs value={activeTab} onValueChange={handleTabChange} className="min-w-0 max-w-full gap-4">
            <div className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
              <TabsList className="h-auto w-max min-w-full max-w-none flex-nowrap justify-start gap-1 rounded-xl bg-card p-1 md:w-max md:min-w-0 md:justify-start">
                {(
                  [
                    ["squads", "Squads"],
                    ["inbox", toActionCount > 0 ? `Inbox ${toActionCount}` : "Inbox"],
                    ["availability", "Available"],
                    ["achievements", "Achievements"],
                    ["settings", "Settings"],
                  ] as const
                ).map(([value, label]) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="h-10 shrink-0 rounded-lg px-3 text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="squads" className="mt-0 min-w-0 max-w-full space-y-4">
              <DashboardSquadsCompact teams={teams} onLeave={handleLeaveTeam} />
              {nextStep ? (
                <DashboardNextSteps
                  hasTeam={teams.length > 0}
                  hasAvailability={availabilityPosts.length > 0}
                  hasDiscord={Boolean(profile?.discord_username?.trim())}
                  hasPortfolio={Boolean(profile?.portfolio_url?.trim())}
                  hasInboxActivity={activityTotal > 0}
                />
              ) : null}
            </TabsContent>

            <TabsContent value="inbox" className="mt-0 flex min-w-0 max-w-full flex-col gap-4">
              <PushNotificationBanner />
              <DashboardInboxCompact
                applications={applications}
                invitations={invitations}
                sentApplications={sentApplications}
                sentInvitations={sentInvitationsOutbox}
                cancellingSentRequestId={cancellingSentRequestId}
                onAcceptApplication={handleAcceptApplication}
                onDeclineApplication={handleDeclineApplication}
                onAcceptInvitation={handleAcceptInvitation}
                onDeclineInvitation={handleDeclineInvitation}
                busyRequestId={busyInboxRequestId}
                onCancelPendingSentRequest={handleCancelPendingSentRequest}
              />
            </TabsContent>

            <TabsContent value="availability" className="mt-0 flex min-w-0 max-w-full flex-col gap-4">
              <DashboardAvailabilityCompact
                posts={availabilityPosts}
                onDeletePost={handleDeleteAvailabilityPostClick}
                onRenewPost={handleRenewAvailabilityPost}
                renewingPostId={renewingAvailabilityPostId}
                profileAvatarUrl={profile?.avatar_url ?? null}
              />
              <DashboardRecommendedTeams teams={recommendedTeams} compact className="min-w-0 max-w-full" />
            </TabsContent>

            <TabsContent value="achievements" className="mt-0 flex min-w-0 max-w-full flex-col gap-4">
              {session?.user?.id ? (
                <>
                  <GamificationDashboardFull
                    userId={session.user.id}
                    onDataChanged={() => void loadData()}
                    snapshot={fixture?.gamification ?? null}
                  />
                  <MonthlyKudosLeaderboard snapshotRows={fixture?.kudos ?? null} />
                  <ProfileGamification
                    userId={session.user.id}
                    badgesOnly
                    snapshotBadges={fixture?.badges ?? null}
                  />
                </>
              ) : (
                <Card className="min-w-0 border-border/60 bg-card shadow-sm">
                  <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                    <Trophy className="size-6 text-amber-500" aria-hidden />
                    <p className="max-w-sm text-sm text-muted-foreground">Sign in to see your level, titles, and badges.</p>
                    <Button asChild className="h-11 rounded-xl bg-teal text-teal-foreground hover:bg-teal/90">
                      <Link href="/">Sign in</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="settings" className="mt-0 flex w-full min-w-0 max-w-full flex-col">
              <ProfileSettings
                profile={profile}
                onProfileUpdated={(patch) => {
                  if (patch && "discord_username" in patch) {
                    setProfile((prev) =>
                      prev ? { ...prev, discord_username: patch.discord_username ?? null } : prev,
                    )
                  }
                  void loadData()
                }}
                displayNameFallback={displayName}
              />
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <OnboardingModal
        open={showOnboardingModal}
        onOpenChange={setShowOnboardingModal}
        profile={profile}
      />

      <ResponsiveConfirmDrawer
        open={showAvailabilityModal}
        isMobile={isMobile}
        icon={
          <div className="flex size-10 items-center justify-center rounded-xl bg-success/15">
            <UserMinus className="size-5 text-success" />
          </div>
        }
        title="Congratulations! You've joined the squad."
        description={
          (availabilityModalContext ? `You've joined ${availabilityModalContext}. ` : "") +
          'Would you like to remove your profile from the "Available Players" list to stop receiving requests?'
        }
        confirmLabel="Yes, remove me"
        cancelLabel="No, keep it"
        onConfirm={handleAvailabilityModalConfirm}
        onCancel={handleAvailabilityModalCancel}
        confirmClassName="bg-primary"
      />

      <ResponsiveConfirmDrawer
        open={leaveTeamId !== null}
        isMobile={isMobile}
        icon={
          <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/15">
            <UserMinus className="size-5 text-destructive" />
          </div>
        }
        title="Leave this squad?"
        description="You will be removed from the squad. The owner is notified, and this cannot be undone from here."
        confirmLabel={leavingTeam ? "Leaving..." : "Leave squad"}
        cancelLabel="Stay"
        onConfirm={() => void confirmLeaveTeam()}
        onCancel={() => {
          if (!leavingTeam) setLeaveTeamId(null)
        }}
        confirmClassName="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      />

      <ResponsiveConfirmDrawer
        open={availabilityPostIdToDelete !== null}
        isMobile={isMobile}
        icon={
          <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/15">
            <Trash2 className="size-5 text-destructive" />
          </div>
        }
        title="Remove this availability announcement?"
        description="Your announcement will be removed from the Available Players list."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={() => availabilityPostIdToDelete && handleDeleteAvailabilityPost(availabilityPostIdToDelete)}
        onCancel={() => setAvailabilityPostIdToDelete(null)}
        confirmClassName="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      />
    </div>
  )
}
