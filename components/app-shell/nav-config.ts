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

export function dashboardHref(tab: DashboardTabValue = "squads"): string {
  if (tab === "squads") return "/dashboard"
  return `/dashboard?tab=${tab}`
}

export function tabFromPathname(pathname: string, search: string): DashboardTabValue | null {
  if (!pathname.startsWith("/dashboard")) return null
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
}[] = [
  { id: "home", label: "Home", href: dashboardHref("squads"), icon: ICON.dashboard },
  { id: "explore", label: "Explore", href: "/teams", icon: ICON.squad },
  { id: "create", label: "Create", icon: ICON.create, create: true },
  { id: "inbox", label: "Inbox", href: dashboardHref("inbox"), icon: ICON.applications },
  { id: "me", label: "Me", href: "/dashboard?hub=me", icon: ICON.jammer },
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
