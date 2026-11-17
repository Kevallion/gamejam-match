import type { BadgeProgressSnapshot } from "@/lib/gamification-badge-progress"

/**
 * Shape of the data the Bento home renders.
 * T7c: filled from `bento-mock.ts` (fictional). T9 wires the real server query to this type.
 * When `BentoDashboard` gets no `data`, every card falls back to its T7 placeholder.
 */

export type BentoTone = "teal" | "pink" | "lavender" | "peach" | "mint"

export type BentoLevel = {
  level: number
  title: string
  nextTitle: string
  nextTitleLevel: number
  xp: number
  xpForNextLevel: number
  seasonRank: number
  streakDays: number
  kudos: number
  xpThisWeek: number
}

export type BentoKpis = {
  activeSquads: { value: number; hint: string }
  jamsJoined: { value: number; hint: string }
  gamesShipped: { value: number; hint: string }
  applications: { value: number; hint: string }
}

export type BentoLiveJam = {
  name: string
  theme: string
  endsIn: string
  elapsedPercent: number
  squadName: string
  squadMembers: number
  squadMax: number
  entries: number
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
  liveJam: BentoLiveJam
  upcoming: BentoUpcomingJam[]
  quests: BentoQuest[]
  badges: BentoBadge[]
  /** Inputs of the site's `badgeProgressLine` (lib/gamification-badge-progress.ts). */
  badgeProgress: BadgeProgressSnapshot
  xpWeekly: BentoXpWeek[]
  feed: BentoFeedItem[]
  squads: BentoSquad[]
  match: BentoSquadMatch
}
