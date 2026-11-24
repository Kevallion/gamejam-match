"use client"

import type { ReactNode } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { AppHeader } from "@/components/app-shell/app-header"
import { MeHub } from "@/components/app-shell/me-hub"
import {
  isDashboardPath,
  sectionTitleForPath,
  tabFromPathname,
} from "@/components/app-shell/nav-config"
import {
  BentoHotbar,
  BENTO_HOTBAR_OFFSET_CLASS,
} from "@/components/dashboard/bento-hotbar"
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

/**
 * Dashboard chrome — Bento Nav 2 hotbar (replaces sidebar / rail / mobile tabs).
 * Legacy AppSidebar / NavRail / MobileTabBar remain in the codebase unused by this shell.
 */
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
  const title = sectionTitleForPath(pathname, searchParams.toString())
  const xp = account.xp ?? 0
  const level = levelFromTotalXp(xp)
  const levelLabel = `Lvl ${level} · ${account.currentTitle?.trim() || "Rookie Jammer"}`
  const isHomeGreeting = !hubMe && tab === "squads" && isDashboardPath(pathname)

  return (
    <div
      className={cn(
        "app-shell flex min-h-dvh min-w-0 flex-col bg-background",
        "bg-[radial-gradient(circle_at_15%_0%,color-mix(in_oklch,var(--lavender)_12%,transparent),transparent_40%),radial-gradient(circle_at_95%_30%,color-mix(in_oklch,var(--teal)_8%,transparent),transparent_35%)]",
        className,
      )}
    >
      <AppHeader
        title={title}
        greetingName={isHomeGreeting ? account.displayName : null}
        hideGreetingDesktop={isHomeGreeting}
        levelLabel={isHomeGreeting ? levelLabel : null}
        avatarUrl={account.avatarUrl}
        displayName={account.displayName}
        userId={account.userId}
        meHubHref="/dashboard?hub=me"
        notifications={notifications}
        unreadCount={unreadCount}
        notifLoading={notifLoading}
        onMarkRead={onMarkRead}
        onMarkAllRead={onMarkAllRead}
        onRefetch={onRefetchNotifications}
        className={cn(isHomeGreeting && "app-desktop:border-0 app-desktop:bg-transparent app-desktop:backdrop-blur-none")}
      />

      <main
        className={cn(
          "mx-auto flex w-full min-w-0 max-w-[1280px] flex-1 flex-col px-4 lg:px-6 xl:px-10",
          BENTO_HOTBAR_OFFSET_CLASS,
        )}
      >
        {hubMe ? (
          <div className="min-w-0 flex-1 py-4">
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
          <div className="min-w-0 flex-1 py-3 md:py-4">{children}</div>
        )}
        <div className="app-shell-hotbar-spacer" aria-hidden />
      </main>

      <BentoHotbar inboxCount={inboxCount} availabilityCount={availabilityCount} />
    </div>
  )
}
