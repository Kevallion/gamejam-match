/**
 * DS-3a: builds the Bento home data from real sources only (replaces bento-mock.ts).
 *
 * - level / XP / title / streak / kudos / badges / badge progress: the gamification
 *   snapshot (`getMyGamificationSnapshot`, lib/gamification-snapshot.ts), the same
 *   source as Rewards; Me (app shell) uses the same profiles.xp and level curve.
 * - KPIs, squads, live / upcoming jams: the squads the dashboard already loads.
 * - quests: real XP actions (XP_BY_ACTION) with the user's real progress.
 * - crew feed: the user's latest notifications.
 * - Not tracked anywhere yet, so null / empty (the card shows its empty state):
 *   season rank, XP this week, XP per week, games shipped, jam themes and entries,
 *   squad match fit.
 */
import type {
  BentoDashboardData,
  BentoFeedItem,
  BentoLiveJam,
  BentoQuest,
  BentoSquad,
  BentoTone,
  BentoUpcomingJam,
} from "@/components/dashboard/bento-data"
import { ALL_BADGE_IDS } from "@/components/profile-gamification"
import { XP_BY_ACTION } from "@/lib/gamification"
import type { GamificationSnapshot } from "@/lib/gamification-snapshot"
import type { NormalizedNotificationFeedItem } from "@/lib/notifications-enriched"

export type BentoSquadInput = {
  id: string
  name: string
  jam: string
  members: number
  maxMembers: number
  isOwner: boolean
  jamStartDate: string | null
  jamEndDate: string | null
}

export type BentoRealInput = {
  snapshot: GamificationSnapshot | null
  squads: BentoSquadInput[]
  /** Applications the user sent (latest per squad). */
  sentApplications: { status: string | null }[]
  hasActiveAvailabilityPost: boolean
  notifications: NormalizedNotificationFeedItem[]
  now?: Date
}

const TONES: BentoTone[] = ["teal", "pink", "lavender", "peach", "mint"]
const DAY_MS = 24 * 60 * 60 * 1000
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function initials(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? "?").slice(0, 2)
  return letters.toUpperCase()
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function durationLabel(ms: number): string {
  const hours = Math.max(0, Math.round(ms / (60 * 60 * 1000)))
  if (hours < 1) return "less than 1h"
  if (hours < 72) return `${hours}h`
  return `${Math.round(hours / 24)} days`
}

function remainingLabel(ms: number): string {
  const totalHours = Math.max(0, Math.floor(ms / (60 * 60 * 1000)))
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`
}

function relativeTime(iso: string, now: Date): string {
  const d = toDate(iso)
  if (!d) return ""
  const diff = Math.max(0, now.getTime() - d.getTime())
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

function squadStatus(squad: BentoSquadInput, now: Date): string {
  const start = toDate(squad.jamStartDate)
  const end = toDate(squad.jamEndDate)
  if (start && end && start <= now && now <= end) return "Jamming now"
  if (end && end < now) return "Jam ended"
  const open = Math.max(0, squad.maxMembers - squad.members)
  if (open === 0) return "Roster full"
  return `Looking for ${open} more`
}

function buildQuests(input: BentoRealInput): BentoQuest[] {
  const s = input.snapshot
  const owned = input.squads.filter((sq) => sq.isOwner).length
  const joined = input.squads.length - owned
  const candidates: (BentoQuest & { done: boolean })[] = [
    {
      id: "complete_profile",
      title: "Complete your profile",
      detail: "Finish onboarding to unlock Early Bird",
      xp: XP_BY_ACTION.COMPLETE_PROFILE,
      progress: s?.badgeProgress.onboardingDone ? 1 : 0,
      total: 1,
      done: s?.badgeProgress.onboardingDone === true,
    },
    {
      id: "daily_login",
      title: "Daily login",
      detail: s && s.dailyStreak > 0 ? `${s.dailyStreak}-day streak so far` : "Start a login streak",
      xp: XP_BY_ACTION.DAILY_LOGIN,
      progress: s?.dailyLoginClaimedToday ? 1 : 0,
      total: 1,
      // Unknown claim state: keep it listed.
      done: s?.dailyLoginClaimedToday === true,
    },
    {
      id: "post_announcement",
      title: "Post an announcement",
      detail: "Tell squads you're available",
      xp: XP_BY_ACTION.POST_ANNOUNCEMENT,
      progress: input.hasActiveAvailabilityPost ? 1 : 0,
      total: 1,
      done: input.hasActiveAvailabilityPost,
    },
    {
      id: "join_team",
      title: "Join a squad",
      detail: "Apply to a squad that needs your role",
      xp: XP_BY_ACTION.JOIN_TEAM,
      progress: joined > 0 ? 1 : 0,
      total: 1,
      done: joined > 0,
    },
    {
      id: "create_team",
      title: "Create a squad",
      detail: "Publish a squad listing",
      xp: XP_BY_ACTION.CREATE_TEAM,
      progress: owned > 0 ? 1 : 0,
      total: 1,
      done: owned > 0,
    },
    {
      id: "invite_member",
      title: "Invite 5 jammers",
      detail: "Recruiter badge at 5 invites",
      xp: XP_BY_ACTION.INVITE_MEMBER,
      progress: Math.min(s?.invitesSent ?? 0, 5),
      total: 5,
      done: (s?.invitesSent ?? 0) >= 5,
    },
  ]
  return candidates
    .filter((q) => !q.done)
    .slice(0, 4)
    .map((q) => ({ id: q.id, title: q.title, detail: q.detail, xp: q.xp, progress: q.progress, total: q.total }))
}

function buildFeed(notifications: NormalizedNotificationFeedItem[], now: Date): BentoFeedItem[] {
  return notifications.slice(0, 4).map((n, i) => {
    const actor = n.senderResolved?.username?.trim() || n.teamResolved?.team_name?.trim() || "GameJamCrew"
    return {
      id: n.id,
      actor,
      initials: initials(actor),
      text: n.message?.trim() || "New activity",
      time: relativeTime(n.created_at, now),
      tone: TONES[i % TONES.length],
    }
  })
}

export function buildBentoDashboardData(input: BentoRealInput): BentoDashboardData {
  const now = input.now ?? new Date()
  const s = input.snapshot
  const owned = input.squads.filter((sq) => sq.isOwner).length
  const joined = input.squads.length - owned
  const jams = new Set(input.squads.map((sq) => sq.jam.trim().toLowerCase()).filter(Boolean))
  const pendingApps = input.sentApplications.filter((a) => (a.status ?? "pending") === "pending").length

  const squads: BentoSquad[] = input.squads.map((sq, i) => ({
    id: sq.id,
    name: sq.name,
    initials: initials(sq.name),
    jam: sq.jam || "No jam set",
    members: sq.members,
    maxMembers: Math.max(sq.maxMembers, sq.members),
    status: squadStatus(sq, now),
    tone: TONES[i % TONES.length],
    isOwner: sq.isOwner,
  }))

  let liveJam: BentoLiveJam | null = null
  const upcoming: BentoUpcomingJam[] = []
  const sortedByStart = [...input.squads].sort(
    (a, b) => (toDate(a.jamStartDate)?.getTime() ?? Infinity) - (toDate(b.jamStartDate)?.getTime() ?? Infinity),
  )
  for (const sq of sortedByStart) {
    const start = toDate(sq.jamStartDate)
    const end = toDate(sq.jamEndDate)
    if (!start) continue
    if (end && start <= now && now <= end && !liveJam) {
      const span = Math.max(1, end.getTime() - start.getTime())
      liveJam = {
        name: sq.jam || sq.name,
        theme: null,
        endsIn: remainingLabel(end.getTime() - now.getTime()),
        elapsedPercent: Math.round(((now.getTime() - start.getTime()) / span) * 100),
        squadName: sq.name,
        squadMembers: sq.members,
        squadMax: Math.max(sq.maxMembers, sq.members),
        entries: null,
      }
    } else if (start > now && upcoming.length < 3) {
      const days = Math.ceil((start.getTime() - now.getTime()) / DAY_MS)
      upcoming.push({
        id: sq.id,
        name: sq.jam || sq.name,
        month: MONTHS[start.getMonth()],
        day: String(start.getDate()).padStart(2, "0"),
        startsIn: days <= 1 ? "Starts tomorrow" : `Starts in ${days} days`,
        duration: end ? durationLabel(end.getTime() - start.getTime()) : "Open",
        tone: TONES[(upcoming.length + 2) % TONES.length],
      })
    }
  }

  const earned = new Set(s?.earnedBadgeIds ?? [])

  return {
    level: {
      level: s?.level ?? 1,
      title: s?.currentTitle ?? "Rookie Jammer",
      nextTitle: s?.nextLevelTitle?.title ?? null,
      nextTitleLevel: s?.nextLevelTitle?.level ?? null,
      xp: s?.xpInLevel ?? 0,
      xpForNextLevel: s?.levelSpan ?? 25,
      seasonRank: null,
      streakDays: s?.dailyStreak ?? 0,
      kudos: s?.kudosReceived ?? 0,
      xpThisWeek: null,
    },
    kpis: {
      activeSquads: {
        value: input.squads.length,
        hint: input.squads.length > 0 ? `${owned} founded · ${joined} joined` : "None yet",
      },
      jamsJoined: { value: jams.size, hint: jams.size > 0 ? "From your squads" : "None yet" },
      gamesShipped: { value: null, hint: "Not tracked yet" },
      applications: {
        value: input.sentApplications.length,
        hint: input.sentApplications.length > 0 ? `${pendingApps} pending` : "None sent",
      },
    },
    liveJam,
    upcoming,
    quests: buildQuests(input),
    badges: ALL_BADGE_IDS.map((id) => ({ id, earned: earned.has(id) })),
    badgeProgress: s?.badgeProgress ?? {
      dailyStreak: 0,
      invitesSent: 0,
      distinctRoles: 0,
      squadListings: 0,
      onboardingDone: false,
    },
    xpWeekly: [],
    feed: buildFeed(input.notifications, now),
    squads,
    match: null,
  }
}