"use client"

import type { ReactNode } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { AppHeader } from "@/components/app-shell/app-header"
import { AppSidebar } from "@/components/app-shell/app-sidebar"
import { MobileTabBar, MOBILE_TAB_BAR_OFFSET_CLASS } from "@/components/app-shell/mobile-tab-bar"
import { NavRail } from "@/components/app-shell/nav-rail"
import { MeHub } from "@/components/app-shell/me-hub"
import {
  sectionTitleForTab,
  tabFromPathname,
} from "@/components/app-shell/nav-config"
import type { NormalizedNotificationRow } from "@/hooks/use-notifications"
import { levelFromTotalXp } from "@/lib/gamification-level"
import { cn } from "@/lib/utils"

export type AppShellAccount = {
  userId: string
  displayName: string
  avatarUrl?: string | null
  xp?: number
  currentTitle?: string | null
}

type AppShellProps = {
  account: AppShellAccount
  children: ReactNode
  inboxCount?: number
  availabilityCount?: number
  notifications: NormalizedNotificationRow[]
  unreadCount: number
  notifLoading: boolean
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onRefetchNotifications?: () => void
  /** When true, render Me hub instead of children on mobile hub route. */
  showMeHub?: boolean
  className?: string
}

export function AppShell({
  account,
  children,
  inboxCount = 0,
  availabilityCount = 0,
  notifications,
  unreadCount,
  notifLoading,
  onMarkRead,
  onMarkAllRead,
  onRefetchNotifications,
  showMeHub,
  className,
}: AppShellProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = tabFromPathname(pathname, searchParams.toString())
  const hubMe = showMeHub ?? searchParams.get("hub") === "me"
  const title = sectionTitleForTab(tab, hubMe)
  const xp = account.xp ?? 0
  const level = levelFromTotalXp(xp)
  const levelLabel = `Lvl ${level} · ${account.currentTitle?.trim() || "Rookie Jammer"}`
  const isHomeGreeting = !hubMe && tab === "squads" && pathname.startsWith("/dashboard")

  return (
    <div className={cn("flex min-h-dvh min-w-0 bg-background", className)}>
      <NavRail inboxCount={inboxCount} availabilityCount={availabilityCount} />
      <AppSidebar
        userId={account.userId}
        displayName={account.displayName}
        avatarUrl={account.avatarUrl}
        xp={xp}
        currentTitle={account.currentTitle}
        inboxCount={inboxCount}
        availabilityCount={availabilityCount}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          title={title}
          greetingName={isHomeGreeting ? account.displayName : null}
          levelLabel={isHomeGreeting ? levelLabel : null}
          avatarUrl={account.avatarUrl}
          userId={account.userId}
          notifications={notifications}
          unreadCount={unreadCount}
          notifLoading={notifLoading}
          onMarkRead={onMarkRead}
          onMarkAllRead={onMarkAllRead}
          onRefetch={onRefetchNotifications}
        />

        <main className={cn("min-w-0 flex-1", MOBILE_TAB_BAR_OFFSET_CLASS, "md:pb-8")}>
          {hubMe ? (
            <div className="px-4 py-4">
              <MeHub
                userId={account.userId}
                displayName={account.displayName}
                avatarUrl={account.avatarUrl}
                xp={xp}
                currentTitle={account.currentTitle}
                availabilityCount={availabilityCount}
              />
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      <MobileTabBar inboxCount={inboxCount} availabilityCount={availabilityCount} />
    </div>
  )
}
