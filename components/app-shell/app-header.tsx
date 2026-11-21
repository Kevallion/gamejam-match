"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
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
  levelLabel?: string | null
  avatarUrl?: string | null
  userId?: string | null
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
              className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
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
              className="absolute inset-0 size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
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
  levelLabel,
  avatarUrl,
  userId,
  notifications,
  unreadCount,
  notifLoading,
  onMarkRead,
  onMarkAllRead,
  onRefetch,
  className,
}: AppHeaderProps) {
  const bell = (
    <Button
      variant="ghost"
      size="icon"
      className="relative size-11 rounded-xl"
      aria-label="Notifications"
    >
      <AppIcon icon={ICON.notifications} size="md" />
      {unreadCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-peach px-1 text-[10px] font-bold text-peach-foreground">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Button>
  )

  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b border-border/40 bg-background/90 backdrop-blur-md",
        "pt-[env(safe-area-inset-top,0px)]",
        className,
      )}
    >
      <div className="flex h-14 items-center gap-3 px-4 md:h-16 md:px-6">
        <div className="min-w-0 flex-1">
          {greetingName ? (
            <div className="flex min-w-0 items-center gap-2.5">
              {userId ? (
                <Link href={`/jammer/${userId}`} className="shrink-0">
                  <UserAvatar
                    src={avatarUrl ?? null}
                    fallbackName={greetingName}
                    size="md"
                    className="size-8 rounded-full"
                  />
                </Link>
              ) : (
                <UserAvatar
                  src={avatarUrl ?? null}
                  fallbackName={greetingName}
                  size="md"
                  className="size-8 rounded-full"
                />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">Hi {greetingName}</p>
                {levelLabel ? (
                  <p className="truncate text-[11px] font-medium text-peach">{levelLabel}</p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight text-foreground md:text-[22px]">
                {title}
              </h1>
              {subtitle ? (
                <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
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

          <div className="hidden lg:block">
            <ThemeButton />
          </div>

          {userId && !greetingName ? (
            <Link
              href={`/jammer/${userId}`}
              className="ml-1 hidden size-11 items-center justify-center md:flex lg:hidden"
              aria-label="Public profile"
            >
              <UserAvatar
                src={avatarUrl ?? null}
                fallbackName={title}
                size="md"
                className="size-9 rounded-full"
              />
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  )
}
