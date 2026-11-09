"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useState } from "react"
import { CreateSheet } from "@/components/app-shell/create-sheet"
import { RAIL_ITEMS, tabFromPathname } from "@/components/app-shell/nav-config"
import { FEEDBACK_URL } from "@/components/FeedbackButton"
import { AppIcon } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"

export function NavRail({
  inboxCount = 0,
  availabilityCount = 0,
}: {
  inboxCount?: number
  availabilityCount?: number
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [createOpen, setCreateOpen] = useState(false)
  const tab = tabFromPathname(pathname, searchParams.toString())

  const activeId = (() => {
    if (pathname.startsWith("/teams") || pathname.startsWith("/find-members")) return "explore"
    if (!pathname.startsWith("/dashboard")) return null
    if (tab === "inbox") return "inbox"
    if (tab === "availability") return "my-posts"
    if (tab === "achievements") return "achievements"
    if (tab === "settings") return "settings"
    return "home"
  })()

  return (
    <>
      <aside
        className="sticky top-0 z-30 hidden h-dvh w-[88px] shrink-0 flex-col border-r border-border/50 bg-card/80 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md md:flex lg:hidden"
        aria-label="App rail"
      >
        <div className="flex flex-col items-center gap-1 px-2 pt-3">
          <Link
            href="/dashboard"
            className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary"
            aria-label="GameJamCrew home"
          >
            <AppIcon icon={ICON.jam} size="md" tone="primary" />
          </Link>

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-3 flex size-14 flex-col items-center justify-center rounded-2xl bg-teal text-teal-foreground shadow-sm transition-transform active:scale-95"
            aria-label="Create"
          >
            <AppIcon icon={ICON.create} size="xl" className="text-teal-foreground" />
          </button>
          <span className="mt-1 text-[11px] font-semibold text-muted-foreground">Create</span>
        </div>

        <nav className="mt-6 flex flex-1 flex-col items-center gap-1 px-2">
          {RAIL_ITEMS.map((item) => {
            const active = activeId === item.id
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "relative flex w-full flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-semibold transition-colors",
                  active ? "bg-teal/15 text-teal" : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
              >
                <span className="relative">
                  <AppIcon icon={item.icon} size="md" tone={active ? "teal" : undefined} />
                  {item.badge === "inbox" && inboxCount > 0 ? (
                    <span className="absolute -right-2.5 -top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-peach px-1 text-[10px] font-bold text-peach-foreground">
                      {inboxCount > 9 ? "9+" : inboxCount}
                    </span>
                  ) : null}
                </span>
                <span className="max-w-full truncate text-center leading-tight">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto flex flex-col items-center gap-3 px-2 pb-4 text-[11px] font-medium text-muted-foreground">
          <Link href="/showcase" className="hover:text-foreground">
            Help
          </Link>
          <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
            Feedback
          </a>
        </div>
      </aside>

      <CreateSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        availabilityCount={availabilityCount}
      />
    </>
  )
}
