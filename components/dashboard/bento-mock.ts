/**
 * T7c MOCK — fictional demo data for the Bento home. TO REMOVE / REPLACE IN T9.
 *
 * Every name, squad, jam and number below is invented. No Supabase call, no real user data.
 * Single import point: `components/dashboard-client.tsx` (`data={BENTO_MOCK}`).
 * To remove: delete this file and that prop; the cards fall back to their T7 placeholders.
 *
 * T7c v4: site concepts are aligned with the real code —
 * - badges: real ids from `BADGE_DICTIONARY` / `public/badges/*.svg` (only earned/locked is mocked);
 * - XP: sums of `XP_BY_ACTION` (lib/gamification.ts), level from `lib/gamification-level.ts`;
 * - titles: `TITLE_CATALOG` (lib/gamification-titles-catalog.ts);
 * - quests: real XP actions with their real XP (the "quest" list itself is a Bento concept).
 */
import type { BentoDashboardData } from "@/components/dashboard/bento-data"
import { gamificationLevelProgress } from "@/lib/gamification-level"

/**
 * Fictional total XP, built from real XP_BY_ACTION values:
 * COMPLETE_PROFILE 50 + CREATE_TEAM 100 + JOIN_TEAM 2×50 + INVITE_MEMBER 5×20
 * + POST_ANNOUNCEMENT 30 + DAILY_LOGIN 14×10 = 520 XP → Level 5 (400–625).
 */
const MOCK_TOTAL_XP = 520
const MOCK_LEVEL = gamificationLevelProgress(MOCK_TOTAL_XP)

export const BENTO_MOCK: BentoDashboardData = {
  level: {
    level: MOCK_LEVEL.level,
    // Real titles: "Captain" (TEAM_ROSTER_COMPLETE), next level title "Veteran" at Level 10.
    title: "Captain",
    nextTitle: "Veteran",
    nextTitleLevel: 10,
    // Same semantics as the site's Achievements header: XP inside the level / level span.
    xp: MOCK_LEVEL.xpInLevel,
    xpForNextLevel: MOCK_LEVEL.span,
    seasonRank: 128,
    streakDays: 3,
    kudos: 12,
    xpThisWeek: 30,
  },
  kpis: {
    activeSquads: { value: 3, hint: "1 founded · 2 joined" },
    jamsJoined: { value: 7, hint: "3 this year" },
    gamesShipped: { value: 4, hint: "57% ship rate" },
    applications: { value: 3, hint: "2 pending" },
  },
  liveJam: {
    name: "Cozy Winter Jam 2026",
    theme: "Lost & Found",
    endsIn: "1d 14h",
    elapsedPercent: 68,
    squadName: "Pixel Pickles",
    squadMembers: 4,
    squadMax: 5,
    entries: 312,
  },
  upcoming: [
    { id: "u1", name: "Tiny Tales Jam", month: "Nov", day: "24", startsIn: "Starts in 7 days", duration: "48h", tone: "lavender" },
    { id: "u2", name: "Retro Arcade Week", month: "Dec", day: "02", startsIn: "Starts in 15 days", duration: "7 days", tone: "peach" },
    { id: "u3", name: "Sound Only Jam", month: "Dec", day: "12", startsIn: "Starts in 25 days", duration: "72h", tone: "mint" },
  ],
  // Real XP actions + real XP (XP_BY_ACTION). Progress is fictional.
  quests: [
    { id: "q1", title: "Join a squad as Audio", detail: "A third role unlocks Multi-Tool", xp: 50, progress: 0, total: 1 },
    { id: "q2", title: "Post an announcement", detail: "Tell squads you're available", xp: 30, progress: 0, total: 1 },
    { id: "q3", title: "Invite a jammer", detail: "Fill an open role on your squad", xp: 20, progress: 0, total: 1 },
    { id: "q4", title: "Daily login", detail: "Keep your streak going", xp: 10, progress: 0, total: 1 },
  ],
  // Real badge ids, same order and state as the reference shelf: 6 earned / 10.
  badges: [
    { id: "early_bird", earned: true },
    { id: "founder", earned: true },
    { id: "team_player", earned: true },
    { id: "captain", earned: true },
    { id: "recruiter", earned: true },
    { id: "supporter", earned: true },
    { id: "multi_tool", earned: false },
    { id: "jam_champion", earned: false },
    { id: "stalwart", earned: false },
    { id: "golden_heart", earned: false },
  ],
  // Inputs of the site's `badgeProgressLine` → closest unlock = Multi-Tool 2/3 (Stalwart 3/5 is behind).
  badgeProgress: {
    dailyStreak: 3,
    invitesSent: 5,
    distinctRoles: 2,
    squadListings: 1,
    onboardingDone: true,
  },
  // Weekly sums of real XP actions; total = 520 (MOCK_TOTAL_XP), last week = xpThisWeek.
  xpWeekly: [
    { label: "W40", xp: 160 },
    { label: "W41", xp: 80 },
    { label: "W42", xp: 70 },
    { label: "W43", xp: 60 },
    { label: "W44", xp: 50 },
    { label: "W45", xp: 30 },
    { label: "W46", xp: 40 },
    { label: "W47", xp: 30 },
  ],
  feed: [
    { id: "f1", actor: "Leo Marchetti", initials: "LM", text: "joined Pixel Pickles", time: "2h ago", tone: "lavender" },
    { id: "f2", actor: "Sana Ilunga", initials: "SI", text: "shipped Lantern Drift", time: "5h ago", tone: "peach" },
    { id: "f3", actor: "Theo Varga", initials: "TV", text: "gave you kudos", time: "Yesterday", tone: "pink" },
  ],
  squads: [
    { id: "s1", name: "Pixel Pickles", initials: "PP", jam: "Cozy Winter Jam 2026", members: 4, maxMembers: 5, status: "Jamming now", tone: "pink" },
    { id: "s2", name: "Moss & Gears", initials: "MG", jam: "Tiny Tales Jam", members: 3, maxMembers: 4, status: "Looking for audio", tone: "mint" },
    { id: "s3", name: "Byte Bakers", initials: "BB", jam: "Retro Arcade Week", members: 4, maxMembers: 4, status: "Roster full", tone: "lavender" },
  ],
  match: {
    squadName: "Moonlit Moths",
    jam: "Tiny Tales Jam",
    role: "Sound designer",
    fitPercent: 92,
    reason: "Godot · English · your audio role",
    memberInitials: ["AK", "RN", "JB"],
  },
}
