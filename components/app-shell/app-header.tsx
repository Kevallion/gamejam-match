"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { AppSearch } from "@/components/app-shell/app-search"
import { AppIcon } from "@/components/ui/app-icon"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationsPanel } from "@/components/notifications-panel"
import { UserAvatar } from "@/components/user-avatar"
import type { NormalizedNotificationRow } from "@/hooks/use-notifications"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"

type AppHeaderProps = {
  title: string
  subtitle?: string | null
  /** Greeting mode for Home on mobile */
  greetingName?: string | null
  /** When true, greeting is hidden from xl up (desktop Bento owns the greeting). */
  hideGreetingDesktop?: boolean
  levelLabel?: string | null
  avatarUrl?: string | null
  /** Stable name for the avatar fallback (never the page title). */
  displayName?: string | null
  userId?: string | null
  /** Prefer Me hub for Settings / My posts after rail removal. */
  meHubHref?: string | null
  notifications: NormalizedNotificationRow[]
  unreadCount: number
  notifLoading: boolean
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onRefetch?: () => void
  className?: string
}

function ThemeButton() {
  const { setTheme } = useTheme()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-11 rounded-xl" aria-label="Change theme">
          <span className="relative flex size-4">
            <svg
              viewBox="0 0 24 24"
              className="size-4 rotate-0 scale-100 transition-transform motion-reduce:transition-none dark:-rotate-90 dark:scale-0 motion-reduce:transition-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
            <svg
              viewBox="0 0 24 24"
              className="absolute inset-0 size-4 rotate-90 scale-0 transition-transform motion-reduce:transition-none dark:rotate-0 dark:scale-100 motion-reduce:transition-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
            </svg>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppHeader({
  title,
  subtitle,
  greetingName,
  hideGreetingDesktop = false,
  avatarUrl,
  displayName,
  userId,
  meHubHref,
  notifications,
  unreadCount,
  notifLoading,
  onMarkRead,
  onMarkAllRead,
  onRefetch,
  className,
}: AppHeaderProps) {
  const avatarHref = meHubHref ?? (userId ? `/jammer/${userId}` : null)
  const avatarFallback = displayName?.trim() || greetingName?.trim() || "Jammer"
  const titleText = greetingName
    ? `Hey ${greetingName.split(/\s+/)[0] || greetingName}`
    : title

  const bell = (
    <Button
      variant="ghost"
      size="icon"
      className="relative size-11 rounded-xl"
      aria-label="Notifications"
    >
      <AppIcon icon={ICON.notifications} size="md" />
      {unreadCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-peach px-1 text-xs font-bold tabular-nums text-peach-foreground">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Button>
  )

  const avatar = (
    <UserAvatar
      src={avatarUrl ?? null}
      fallbackName={avatarFallback}
      size="md"
      className="size-9 rounded-[14px] border-2 border-[var(--neo-shadow)] shadow-[3px_3px_0_0_var(--neo-shadow)]"
    />
  )

  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b border-border bg-background",
        "pt-[env(safe-area-inset-top,0px)]",
        className,
      )}
    >
      <div className="relative mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-3 app-desktop:h-16 app-desktop:gap-3 app-desktop:px-6 xl:px-10">
        <Link
          href="/dashboard"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl app-desktop:w-auto app-desktop:gap-2 app-desktop:justify-start"
          aria-label="GameJamCrew home"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-primary text-primary-foreground shadow-[3px_3px_0_0_var(--neo-shadow)]">
            <AppIcon icon={ICON.jam} size="md" className="text-primary-foreground" />
          </span>
          <span className="hidden truncate font-display text-base font-extrabold tracking-tight app-desktop:inline">
            GameJamCrew
          </span>
        </Link>

        <div
          className={cn(
            "min-w-0 flex-1",
            "app-desktop:max-w-[240px] app-desktop:flex-none",
            greetingName && hideGreetingDesktop && "app-desktop:hidden",
          )}
        >
          <h1
            className="truncate font-display text-xl font-extrabold tracking-tight text-foreground app-desktop:text-2xl"
            title={subtitle ? `${titleText} — ${subtitle}` : titleText}
          >
            {titleText}
          </h1>
        </div>

        <div className="hidden min-w-0 flex-1 app-desktop:block">
          <AppSearch variant="desktop" />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <AppSearch variant="mobile" />
          <div className="md:hidden">
            <NotificationsPanel
              variant="mobile"
              notifications={notifications}
              unreadCount={unreadCount}
              loading={notifLoading}
              onMarkRead={onMarkRead}
              onMarkAllRead={onMarkAllRead}
              onOpenChange={(open) => open && onRefetch?.()}
            >
              {bell}
            </NotificationsPanel>
          </div>

          <div className="hidden md:block lg:hidden">
            <NotificationsPanel
              variant="tablet"
              notifications={notifications}
              unreadCount={unreadCount}
              loading={notifLoading}
              onMarkRead={onMarkRead}
              onMarkAllRead={onMarkAllRead}
              onOpenChange={(open) => open && onRefetch?.()}
            >
              {bell}
            </NotificationsPanel>
          </div>

          <div className="hidden lg:block">
            <NotificationsPanel
              variant="desktop"
              notifications={notifications}
              unreadCount={unreadCount}
              loading={notifLoading}
              onMarkRead={onMarkRead}
              onMarkAllRead={onMarkAllRead}
              onOpenChange={(open) => open && onRefetch?.()}
            >
              {bell}
            </NotificationsPanel>
          </div>

          <ThemeButton />

          {avatarHref ? (
            <Link
              href={avatarHref}
              className="flex size-11 items-center justify-center"
              aria-label={meHubHref ? "Me" : "Public profile"}
            >
              {avatar}
            </Link>
          ) : (
            <span className="flex size-11 items-center justify-center">{avatar}</span>
          )}
        </div>
      </div>
    </header>
  )
}