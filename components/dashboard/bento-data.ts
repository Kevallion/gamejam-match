import type { BadgeProgressSnapshot } from "@/lib/gamification-badge-progress"

/**
 * Shape of the data the Bento home renders.
 * DS-3a: built from real data by `buildBentoDashboardData` (bento-real.ts): the
 * gamification snapshot (lib/gamification-snapshot.ts) plus the dashboard's squads,
 * applications, posts and notifications. No fictional data.
 * When `BentoDashboard` gets no `data` (still loading), every card shows its skeleton;
 * a null field or an empty list shows that card's empty state.
 */

export type BentoTone = "teal" | "pink" | "lavender" | "peach" | "mint"

export type BentoLevel = {
  level: number
  title: string
  nextTitle: string | null
  nextTitleLevel: number | null
  xp: number
  xpForNextLevel: number
  /** No season ranking exists yet: null. */
  seasonRank: number | null
  streakDays: number
  kudos: number
  /** No XP ledger exists yet: null. */
  xpThisWeek: number | null
}

export type BentoKpi = { value: number | null; hint: string }

export type BentoKpis = {
  activeSquads: BentoKpi
  jamsJoined: BentoKpi
  gamesShipped: BentoKpi
  applications: BentoKpi
}

export type BentoLiveJam = {
  name: string
  theme: string | null
  endsIn: string
  elapsedPercent: number
  squadName: string
  squadMembers: number
  squadMax: number
  entries: number | null
}

export type BentoQuest = {
  id: string
  title: string
  detail: string
  xp: number
  progress: number
  total: number
}

/** A real site badge id (`BADGE_DICTIONARY` key); only earned/locked is data. */
export type BentoBadge = {
  id: string
  earned: boolean
}

export type BentoXpWeek = { label: string; xp: number }

export type BentoUpcomingJam = {
  id: string
  name: string
  month: string
  day: string
  startsIn: string
  duration: string
  tone: BentoTone
}

export type BentoFeedItem = {
  id: string
  actor: string
  initials: string
  text: string
  time: string
  tone: BentoTone
}

export type BentoSquad = {
  id: string
  name: string
  initials: string
  jam: string
  members: number
  maxMembers: number
  status: string
  tone: BentoTone
  isOwner: boolean
}

export type BentoSquadMatch = {
  squadName: string
  jam: string
  role: string
  fitPercent: number
  reason: string
  memberInitials: string[]
}

export type BentoDashboardData = {
  level: BentoLevel
  kpis: BentoKpis
  liveJam: BentoLiveJam | null
  upcoming: BentoUpcomingJam[]
  quests: BentoQuest[]
  badges: BentoBadge[]
  /** Inputs of the site's `badgeProgressLine` (lib/gamification-badge-progress.ts). */
  badgeProgress: BadgeProgressSnapshot
  xpWeekly: BentoXpWeek[]
  feed: BentoFeedItem[]
  squads: BentoSquad[]
  match: BentoSquadMatch | null
}
