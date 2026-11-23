"use client"

import type { ReactNode } from "react"
import Link from "next/link"
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
import { AppIcon } from "@/components/ui/app-icon"
import type { NormalizedNotificationRow } from "@/hooks/use-notifications"
import { ICON } from "@/lib/icons"
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
      {/* Slim top chrome (logo + search). Home greeting lives in BentoDashboard on desktop. */}
      <div className="hidden items-center gap-3 px-6 pt-5 lg:flex xl:px-10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 font-black tracking-tight"
          aria-label="GameJamCrew home"
        >
          <span className="grid size-[34px] place-items-center rounded-xl border border-border bg-primary text-primary-foreground shadow-[3px_3px_0_0_var(--neo-shadow)]">
            <AppIcon icon={ICON.jam} size="md" className="text-primary-foreground" />
          </span>
          <span className="text-[17px]">GameJamCrew</span>
        </Link>
        <div className="flex-1" />
        <div
          className={cn(
            "flex h-11 max-w-[380px] flex-1 items-center gap-2.5 rounded-xl border border-border bg-card px-3.5",
            "text-[13px] font-bold text-muted-foreground shadow-[3px_3px_0_0_var(--neo-shadow)]",
          )}
          aria-hidden
        >
          <AppIcon icon={ICON.search} size="sm" tone="muted" />
          <span className="truncate">Search jams, squads, members</span>
          <span className="ml-auto rounded-md border border-border px-1.5 text-[11px] font-black">
            /
          </span>
        </div>
      </div>

      <AppHeader
        title={title}
        greetingName={isHomeGreeting ? account.displayName : null}
        hideGreetingDesktop={isHomeGreeting}
        levelLabel={isHomeGreeting ? levelLabel : null}
        avatarUrl={account.avatarUrl}
        userId={account.userId}
        meHubHref="/dashboard?hub=me"
        notifications={notifications}
        unreadCount={unreadCount}
        notifLoading={notifLoading}
        onMarkRead={onMarkRead}
        onMarkAllRead={onMarkAllRead}
        onRefetch={onRefetchNotifications}
        className={cn(isHomeGreeting && "lg:border-0 lg:bg-transparent lg:backdrop-blur-none")}
      />

      <main
        className={cn(
          "mx-auto w-full min-w-0 max-w-[1280px] flex-1 px-4 lg:px-6 xl:px-10",
          BENTO_HOTBAR_OFFSET_CLASS,
        )}
      >
        {hubMe ? (
          <div className="py-4">
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
          <div className="min-w-0 py-3 md:py-4">{children}</div>
        )}
      </main>

      <BentoHotbar inboxCount={inboxCount} availabilityCount={availabilityCount} />
    </div>
  )
}
