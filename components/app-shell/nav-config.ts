import type { LucideIcon } from "lucide-react"
import { ICON } from "@/lib/icons"

/** Canonical dashboard tab query values (URLs stay stable). */
export type DashboardTabValue =
  | "squads"
  | "inbox"
  | "availability"
  | "achievements"
  | "settings"

export type AppNavId =
  | "home"
  | "explore"
  | "create"
  | "inbox"
  | "me"
  | "my-posts"
  | "achievements"
  | "settings"
  | "more"

export function dashboardHref(tab: DashboardTabValue = "squads"): string {
  if (tab === "squads") return "/dashboard"
  return `/dashboard?tab=${tab}`
}

/** Existing availability announcement form, opened on the My posts tab. */
export const COMPOSE_AVAILABILITY_HREF = "/dashboard?tab=availability&new=1"

/** True for the signed-in dashboard and the populated dev preview fixture. */
export function isDashboardPath(pathname: string): boolean {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/dev/dashboard-preview")
}

export function tabFromPathname(pathname: string, search: string): DashboardTabValue | null {
  if (!isDashboardPath(pathname)) return null
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
  const raw = (params.get("tab") ?? "").trim().toLowerCase()
  if (!raw || raw === "squads" || raw === "overview" || raw === "teams") return "squads"
  if (raw === "requests") return "inbox"
  if (raw === "available") return "availability"
  if (raw === "profile") return "settings"
  if (
    raw === "inbox" ||
    raw === "availability" ||
    raw === "achievements" ||
    raw === "settings"
  ) {
    return raw
  }
  return "squads"
}

export function sectionTitleForPath(pathname: string, search: string): string {
  const hubMe =
    new URLSearchParams(search.startsWith("?") ? search.slice(1) : search).get("hub") === "me"
  if (hubMe) return "Me"
  if (pathname.startsWith("/find-members") || pathname.startsWith("/directory")) return "Explore"
  if (pathname.startsWith("/teams") || pathname.startsWith("/create-team")) return "Squads"
  if (pathname.startsWith("/jammer")) return "Jammer"
  if (pathname.startsWith("/showcase")) return "How it works"
  if (pathname.startsWith("/create-profile")) return "Profile"
  if (pathname.startsWith("/invitation")) return "Invitation"
  return sectionTitleForTab(tabFromPathname(pathname, search), false)
}

export function sectionTitleForTab(tab: DashboardTabValue | null, meHub = false): string {
  if (meHub) return "Me"
  switch (tab) {
    case "inbox":
      return "Inbox"
    case "availability":
      return "My posts"
    case "achievements":
      return "Achievements"
    case "settings":
      return "Settings"
    case "squads":
    default:
      return "Home"
  }
}

export const MOBILE_TABS: {
  id: Exclude<AppNavId, "my-posts" | "achievements" | "settings">
  label: string
  href?: string
  icon: LucideIcon
  create?: boolean
  more?: boolean
  badge?: "inbox"
}[] = [
  { id: "home", label: "Home", href: dashboardHref("squads"), icon: ICON.dashboard },
  { id: "explore", label: "Explore", href: "/find-members", icon: ICON.findJammers },
  { id: "create", label: "Create", icon: ICON.create, create: true },
  { id: "inbox", label: "Inbox", href: dashboardHref("inbox"), icon: ICON.applications, badge: "inbox" },
  { id: "more", label: "More", icon: ICON.more, more: true },
]

export const RAIL_ITEMS: {
  id: AppNavId
  label: string
  href: string
  icon: LucideIcon
  badge?: "inbox"
}[] = [
  { id: "home", label: "Home", href: dashboardHref("squads"), icon: ICON.dashboard },
  { id: "explore", label: "Explore", href: "/teams", icon: ICON.squad },
  { id: "inbox", label: "Inbox", href: dashboardHref("inbox"), icon: ICON.applications, badge: "inbox" },
  { id: "my-posts", label: "My posts", href: dashboardHref("availability"), icon: ICON.available },
  // Short label so the 88px tablet rail does not truncate ("Achievements" → "Achieve...")
  { id: "achievements", label: "Badges", href: dashboardHref("achievements"), icon: ICON.achievement },
  { id: "settings", label: "Settings", href: dashboardHref("settings"), icon: ICON.settings },
]

export const SIDEBAR_DASHBOARD: {
  id: AppNavId
  label: string
  href: string
  icon: LucideIcon
  badge?: "inbox"
}[] = [
  { id: "home", label: "Home", href: dashboardHref("squads"), icon: ICON.dashboard },
  { id: "inbox", label: "Inbox", href: dashboardHref("inbox"), icon: ICON.applications, badge: "inbox" },
  { id: "my-posts", label: "My posts", href: dashboardHref("availability"), icon: ICON.available },
  { id: "achievements", label: "Achievements", href: dashboardHref("achievements"), icon: ICON.achievement },
  { id: "settings", label: "Settings", href: dashboardHref("settings"), icon: ICON.settings },
]

export const SIDEBAR_EXPLORE: {
  label: string
  href: string
  icon: LucideIcon
}[] = [
  { label: "Squads", href: "/teams", icon: ICON.squad },
  { label: "Members", href: "/find-members", icon: ICON.findJammers },
  { label: "How it works", href: "/showcase", icon: ICON.recommended },
]

export type HotbarSlotId = "home" | "squads" | "inbox" | "rewards" | "explore"

/**
 * Nav 2 floating hotbar (desktop numbered 1–5 + create).
 * Same destinations as the previous rail / sidebar explore links.
 * Settings & My posts remain reachable via the Me hub (avatar).
 */
export const HOTBAR_SLOTS: {
  key: "1" | "2" | "3" | "4" | "5"
  id: HotbarSlotId
  label: string
  href: string
  icon: LucideIcon
  badge?: "inbox"
  /** Desktop-only slots (hidden on the compact mobile hotbar). */
  desktopOnly?: boolean
}[] = [
  { key: "1", id: "home", label: "Home", href: dashboardHref("squads"), icon: ICON.dashboard },
  { key: "2", id: "squads", label: "Squads", href: "/teams", icon: ICON.squad },
  { key: "3", id: "inbox", label: "Inbox", href: dashboardHref("inbox"), icon: ICON.applications, badge: "inbox" },
  { key: "4", id: "rewards", label: "Rewards", href: dashboardHref("achievements"), icon: ICON.achievement },
  {
    key: "5",
    id: "explore",
    label: "Explore",
    href: "/find-members",
    icon: ICON.findJammers,
    desktopOnly: true,
  },
]

/** Destinations grouped behind the mobile More sheet (5th slot). */
export const MORE_SHEET_ITEMS: {
  id: MoreSheetItemId
  label: string
  hint: string
  href: string
  icon: LucideIcon
}[] = [
  { id: "squads", label: "Squads", hint: "Browse open squads", href: "/teams", icon: ICON.squad },
  {
    id: "rewards",
    label: "Rewards",
    hint: "Badges, level, and XP",
    href: dashboardHref("achievements"),
    icon: ICON.achievement,
  },
  {
    id: "me",
    label: "Me",
    hint: "Your hub, posts, and profile",
    href: "/dashboard?hub=me",
    icon: ICON.jammer,
  },
  {
    id: "settings",
    label: "Settings",
    hint: "Account, privacy, and preferences",
    href: dashboardHref("settings"),
    icon: ICON.settings,
  },
]

export type MoreSheetItemId = "squads" | "rewards" | "me" | "settings"

/** Which More-sheet row is current. */
export function moreSheetActiveId(pathname: string, search: string): MoreSheetItemId | null {
  const tab = tabFromPathname(pathname, search)
  const hubMe =
    new URLSearchParams(search.startsWith("?") ? search.slice(1) : search).get("hub") === "me"

  if (pathname.startsWith("/teams") || pathname.startsWith("/create-team")) return "squads"
  if (!isDashboardPath(pathname)) return null
  if (hubMe) return "me"
  if (tab === "achievements") return "rewards"
  if (tab === "settings") return "settings"
  return null
}

/** Resolve which hotbar slot is active for the current route. */
export function hotbarActiveId(pathname: string, search: string): HotbarSlotId | null {
  const tab = tabFromPathname(pathname, search)
  const hubMe =
    new URLSearchParams(search.startsWith("?") ? search.slice(1) : search).get("hub") === "me"

  if (pathname.startsWith("/find-members") || pathname.startsWith("/directory") || pathname.startsWith("/showcase")) return "explore"
  if (pathname.startsWith("/teams") || pathname.startsWith("/create-team")) return "squads"
  if (!isDashboardPath(pathname)) return null
  if (hubMe) return null
  if (tab === "inbox") return "inbox"
  if (tab === "achievements") return "rewards"
  if (tab === "availability" || tab === "settings") return null
  return "home"
}

export type MobileHotbarId = "home" | "explore" | "inbox" | "more"

/** Mobile hotbar highlight: More is lit on Jams, Squads, Rewards, Me, Settings, and My posts. */
export function mobileHotbarActiveId(pathname: string, search: string): MobileHotbarId | null {
  const tab = tabFromPathname(pathname, search)
  const hubMe =
    new URLSearchParams(search.startsWith("?") ? search.slice(1) : search).get("hub") === "me"

  if (
    pathname.startsWith("/find-members") ||
    pathname.startsWith("/directory") ||
    pathname.startsWith("/showcase")
  ) {
    return "explore"
  }
  if (pathname.startsWith("/teams") || pathname.startsWith("/create-team")) return "more"
  if (!isDashboardPath(pathname)) return null
  if (hubMe || tab === "settings" || tab === "availability" || tab === "achievements") return "more"
  if (tab === "inbox") return "inbox"
  return "home"
}
