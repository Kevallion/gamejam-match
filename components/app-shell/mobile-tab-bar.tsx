"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useState } from "react"
import { AppIcon } from "@/components/ui/app-icon"
import { CreateSheet } from "@/components/app-shell/create-sheet"
import { MOBILE_TABS, tabFromPathname } from "@/components/app-shell/nav-config"
import { cn } from "@/lib/utils"

const BAR_PX = 64

export function MobileTabBar({
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
  const hubMe = searchParams.get("hub") === "me"

  const isActive = (id: string) => {
    if (id === "create") return false
    if (id === "me") return hubMe || tab === "availability" || tab === "achievements" || tab === "settings"
    if (id === "home") return pathname.startsWith("/dashboard") && !hubMe && tab === "squads"
    if (id === "inbox") return pathname.startsWith("/dashboard") && tab === "inbox" && !hubMe
    if (id === "explore") {
      return (
        pathname.startsWith("/teams") ||
        pathname.startsWith("/find-members") ||
        pathname.startsWith("/showcase")
      )
    }
    return false
  }

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-card/90 backdrop-blur-md md:hidden"
        style={{
          height: `calc(${BAR_PX}px + env(safe-area-inset-bottom, 0px))`,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
        aria-label="App navigation"
      >
        <div className="grid h-16 grid-cols-5">
          {MOBILE_TABS.map((item) => {
            if (item.create) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="flex min-h-11 flex-col items-center justify-center gap-0.5 px-1 text-[12px] font-semibold text-muted-foreground transition-colors active:scale-95"
                  aria-label="Create"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-teal text-teal-foreground shadow-sm">
                    <AppIcon icon={item.icon} size="lg" className="text-teal-foreground" />
                  </span>
                  <span className="sr-only">{item.label}</span>
                </button>
              )
            }

            const active = isActive(item.id)
            const href = item.href ?? "/"
            return (
              <Link
                key={item.id}
                href={href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-11 flex-col items-center justify-center gap-0.5 px-0.5 text-[12px] font-semibold transition-colors active:scale-95",
                  active ? "text-teal" : "text-muted-foreground",
                )}
              >
                {active ? (
                  <span className="absolute inset-x-2 top-1 h-0.5 rounded-full bg-teal" aria-hidden />
                ) : null}
                <span className="relative">
                  <AppIcon icon={item.icon} size="lg" tone={active ? "teal" : "muted"} />
                  {item.id === "inbox" && inboxCount > 0 ? (
                    <span className="absolute -right-2.5 -top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-peach px-1 text-[10px] font-bold text-peach-foreground">
                      {inboxCount > 9 ? "9+" : inboxCount}
                    </span>
                  ) : null}
                </span>
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <CreateSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        availabilityCount={availabilityCount}
      />
    </>
  )
}

export const MOBILE_TAB_BAR_OFFSET_CLASS =
  "pb-[calc(64px+env(safe-area-inset-bottom,0px)+1rem)] md:pb-8"
