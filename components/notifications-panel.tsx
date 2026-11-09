"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { NavbarNotificationRow } from "@/components/navbar-notification-row"
import { AppIcon } from "@/components/ui/app-icon"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import type { NormalizedNotificationRow } from "@/hooks/use-notifications"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"

type NotificationsPanelProps = {
  notifications: NormalizedNotificationRow[]
  unreadCount: number
  loading: boolean
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onOpenChange?: (open: boolean) => void
  /** Controlled open state (optional). */
  open?: boolean
  children: React.ReactNode
  /** mobile = bottom sheet, tablet = side sheet, desktop = popover */
  variant: "mobile" | "tablet" | "desktop"
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

function groupLabel(iso: string): "Today" | "Yesterday" | "Earlier" {
  const created = new Date(iso)
  if (!Number.isFinite(created.getTime())) return "Earlier"
  const today = startOfDay(new Date())
  const day = startOfDay(created)
  const diffDays = Math.round((today - day) / 86400000)
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  return "Earlier"
}

function NotificationsBody({
  notifications,
  unreadCount,
  loading,
  onMarkRead,
  onMarkAllRead,
  filter,
  setFilter,
  onOpenInbox,
  compact,
}: {
  notifications: NormalizedNotificationRow[]
  unreadCount: number
  loading: boolean
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  filter: "all" | "unread"
  setFilter: (f: "all" | "unread") => void
  onOpenInbox: () => void
  compact?: boolean
}) {
  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.is_read)
    return notifications
  }, [notifications, filter])

  const groups = useMemo(() => {
    const map = new Map<string, NormalizedNotificationRow[]>()
    for (const n of filtered) {
      const key = groupLabel(n.created_at)
      const list = map.get(key) ?? []
      list.push(n)
      map.set(key, list)
    }
    return (["Today", "Yesterday", "Earlier"] as const)
      .map((label) => ({ label, items: map.get(label) ?? [] }))
      .filter((g) => g.items.length > 0)
  }, [filtered])

  const showInitialSkeleton = loading && notifications.length === 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 px-1 pb-3">
        <div className="flex rounded-xl bg-secondary/60 p-1">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "min-h-9 rounded-lg px-3 text-xs font-semibold transition-colors",
              filter === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={cn(
              "min-h-9 rounded-lg px-3 text-xs font-semibold transition-colors",
              filter === "unread" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            Unread{unreadCount > 0 ? ` · ${unreadCount}` : ""}
          </button>
        </div>
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={unreadCount === 0}
          className="min-h-9 text-xs font-semibold text-teal disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mark all read
        </button>
      </div>

      <div className={cn("min-h-0 flex-1 overflow-y-auto pr-0.5", compact ? "max-h-80" : "max-h-[70vh]")}>
        {showInitialSkeleton ? (
          <div className="space-y-2 py-2">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ) : groups.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">You&apos;re all caught up</p>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((n) => (
                    <div key={n.id} className="relative">
                      {!n.is_read ? (
                        <span
                          className="absolute left-1 top-1/2 z-10 size-2 -translate-y-1/2 rounded-full bg-teal"
                          aria-hidden
                        />
                      ) : null}
                      <NavbarNotificationRow
                        notification={n}
                        onMarkRead={onMarkRead}
                        compact={compact}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        className="mt-3 h-11 w-full rounded-xl"
        onClick={onOpenInbox}
      >
        Open inbox
      </Button>
    </div>
  )
}

export function NotificationsPanel({
  notifications,
  unreadCount,
  loading,
  onMarkRead,
  onMarkAllRead,
  onOpenChange,
  open: openProp,
  children,
  variant,
}: NotificationsPanelProps) {
  const router = useRouter()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const open = openProp ?? uncontrolledOpen
  const setOpen = (next: boolean) => {
    onOpenChange?.(next)
    if (openProp === undefined) setUncontrolledOpen(next)
  }

  const body = (
    <NotificationsBody
      notifications={notifications}
      unreadCount={unreadCount}
      loading={loading}
      onMarkRead={onMarkRead}
      onMarkAllRead={onMarkAllRead}
      filter={filter}
      setFilter={setFilter}
      compact={variant === "desktop"}
      onOpenInbox={() => {
        setOpen(false)
        router.push("/dashboard?tab=inbox")
      }}
    />
  )

  if (variant === "mobile") {
    return (
      <>
        <button type="button" onClick={() => setOpen(true)} className="contents">
          {children}
        </button>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="flex max-h-[85vh] flex-col rounded-t-3xl border-border/50 bg-card pb-[env(safe-area-inset-bottom,0px)]">
            <DrawerHeader className="flex-row items-center justify-between text-left">
              <DrawerTitle className="flex items-center gap-2 text-lg font-bold">
                <AppIcon icon={ICON.notifications} size="md" tone="primary" />
                Notifications
              </DrawerTitle>
            </DrawerHeader>
            <div className="min-h-0 flex-1 px-4 pb-4">{body}</div>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  if (variant === "tablet") {
    return (
      <>
        <button type="button" onClick={() => setOpen(true)} className="contents">
          {children}
        </button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="right"
            className="flex w-[min(100vw-5.5rem,400px)] flex-col border-border/50 bg-card p-0 sm:max-w-[400px]"
          >
            <SheetHeader className="border-b border-border/40 px-4 py-4 text-left">
              <SheetTitle className="flex items-center gap-2 text-lg font-bold">
                <AppIcon icon={ICON.notifications} size="md" tone="primary" />
                Notifications
              </SheetTitle>
            </SheetHeader>
            <div className="min-h-0 flex-1 px-4 py-4">{body}</div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[392px] rounded-2xl border-border/50 bg-card p-4 shadow-xl"
      >
        <div className="mb-2 flex items-center gap-2">
          <AppIcon icon={ICON.notifications} size="md" tone="primary" />
          <p className="text-sm font-bold text-foreground">Notifications</p>
        </div>
        {body}
      </PopoverContent>
    </Popover>
  )
}
