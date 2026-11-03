"use client"

import Link from "next/link"
import { Gamepad2, Inbox, LayoutDashboard, Settings2, Trophy, UserSearch } from "lucide-react"
import { cn } from "@/lib/utils"

export const DASHBOARD_NAV_ITEMS = [
  {
    value: "squads",
    label: "Overview",
    icon: LayoutDashboard,
    activeClass: "bg-teal/15 text-teal",
    idleIcon: "text-teal",
  },
  {
    value: "inbox",
    label: "Inbox",
    icon: Inbox,
    activeClass: "bg-peach/15 text-peach",
    idleIcon: "text-peach",
  },
  {
    value: "availability",
    label: "Availability",
    icon: UserSearch,
    activeClass: "bg-lavender/15 text-lavender",
    idleIcon: "text-lavender",
  },
  {
    value: "achievements",
    label: "Achievements",
    icon: Trophy,
    activeClass: "bg-amber-500/15 text-amber-500",
    idleIcon: "text-amber-500",
  },
  {
    value: "settings",
    label: "Settings",
    icon: Settings2,
    activeClass: "bg-secondary text-foreground",
    idleIcon: "text-muted-foreground",
  },
] as const

type DashboardNavProps = {
  activeTab: string
  onTabChange: (tab: string) => void
  inboxCount: number
}

function InboxCount({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-peach px-1 text-[11px] font-bold text-peach-foreground">
      {count > 9 ? "9+" : count}
    </span>
  )
}

export function DashboardSidebar({ activeTab, onTabChange, inboxCount }: DashboardNavProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/50 bg-card/50 lg:flex">
      <div className="flex h-full min-h-0 flex-col px-3 py-4">
        <Link href="/" className="mb-6 flex min-w-0 items-center gap-2 px-2 text-foreground">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <Gamepad2 className="size-4 text-primary" aria-hidden />
          </span>
          <span className="truncate text-base font-extrabold tracking-tight">GameJamCrew</span>
        </Link>
        <nav aria-label="Dashboard" className="flex min-w-0 flex-1 flex-col gap-1">
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.value
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onTabChange(item.value)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-11 w-full min-w-0 items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition-colors motion-reduce:transition-none",
                  isActive ? item.activeClass : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
              >
                <Icon className={cn("size-4 shrink-0", isActive ? "text-current" : item.idleIcon)} aria-hidden />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.value === "inbox" ? <InboxCount count={inboxCount} /> : null}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

export function DashboardBottomNav({ activeTab, onTabChange, inboxCount }: DashboardNavProps) {
  return (
    <nav
      aria-label="Dashboard"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="grid grid-cols-5">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.value
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onTabChange(item.value)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 text-[10px] font-semibold leading-tight",
                isActive ? item.activeClass : "text-muted-foreground",
              )}
            >
              <span className="relative">
                <Icon className="size-5" aria-hidden />
                {item.value === "inbox" && inboxCount > 0 ? (
                  <span className="absolute -right-2.5 -top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-peach px-1 text-[10px] font-bold text-peach-foreground">
                    {inboxCount > 9 ? "9+" : inboxCount}
                  </span>
                ) : null}
              </span>
              <span className="max-w-full whitespace-normal text-center">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
