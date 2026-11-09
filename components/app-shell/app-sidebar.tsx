"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { useState } from "react"
import {
  SIDEBAR_DASHBOARD,
  SIDEBAR_EXPLORE,
  tabFromPathname,
} from "@/components/app-shell/nav-config"
import { CreateSheet } from "@/components/app-shell/create-sheet"
import { FEEDBACK_URL } from "@/components/FeedbackButton"
import { AppIcon } from "@/components/ui/app-icon"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar } from "@/components/user-avatar"
import { ICON } from "@/lib/icons"
import { levelFromTotalXp } from "@/lib/gamification-level"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

type AppSidebarProps = {
  userId: string
  displayName: string
  avatarUrl?: string | null
  xp?: number
  currentTitle?: string | null
  inboxCount?: number
  availabilityCount?: number
}

export function AppSidebar({
  userId,
  displayName,
  avatarUrl,
  xp = 0,
  currentTitle,
  inboxCount = 0,
  availabilityCount = 0,
}: AppSidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [createOpen, setCreateOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const tab = tabFromPathname(pathname, searchParams.toString())
  const level = levelFromTotalXp(xp)
  const title = currentTitle?.trim() || "Rookie Jammer"
  const themeLabel = (theme === "system" ? resolvedTheme : theme) === "light" ? "Light" : "Dark"

  const dashboardActive = (id: string) => {
    if (!pathname.startsWith("/dashboard")) return false
    if (id === "home") return tab === "squads"
    if (id === "inbox") return tab === "inbox"
    if (id === "my-posts") return tab === "availability"
    if (id === "achievements") return tab === "achievements"
    if (id === "settings") return tab === "settings"
    return false
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace("/")
  }

  return (
    <>
      <aside
        className="sticky top-0 z-30 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-border/50 bg-card/90 backdrop-blur-md lg:flex"
        aria-label="App sidebar"
      >
        <div className="flex items-center gap-2.5 px-4 pt-5">
          <Link
            href="/dashboard"
            className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary"
            aria-label="GameJamCrew"
          >
            <AppIcon icon={ICON.jam} size="md" tone="primary" />
          </Link>
          <Link href="/dashboard" className="truncate text-base font-extrabold tracking-tight text-foreground">
            GameJamCrew
          </Link>
        </div>

        <div className="px-4 pt-4">
          <Button
            type="button"
            className="h-11 w-full rounded-xl bg-teal text-teal-foreground hover:bg-teal/90"
            onClick={() => setCreateOpen(true)}
          >
            <AppIcon icon={ICON.create} size="md" className="mr-1.5 text-teal-foreground" />
            Create
          </Button>
        </div>

        <nav className="mt-6 flex-1 space-y-6 overflow-y-auto px-3 pb-4">
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Dashboard
            </p>
            <ul className="mt-2 space-y-0.5">
              {SIDEBAR_DASHBOARD.map((item) => {
                const active = dashboardActive(item.id)
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
                        active
                          ? "bg-teal/15 text-teal"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                      )}
                    >
                      <AppIcon icon={item.icon} size="md" tone={active ? "teal" : undefined} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge === "inbox" && inboxCount > 0 ? (
                        <span className="rounded-full bg-peach px-2 py-0.5 text-[11px] font-bold text-peach-foreground">
                          {inboxCount > 9 ? "9+" : inboxCount}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Explore
            </p>
            <ul className="mt-2 space-y-0.5">
              {SIDEBAR_EXPLORE.map((item) => {
                const active = pathname.startsWith(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
                        active
                          ? "bg-white/5 text-foreground"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                      )}
                    >
                      <AppIcon icon={item.icon} size="md" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        <div className="mt-auto space-y-2 border-t border-border/40 px-3 py-3">
          <a
            href={FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            <AppIcon icon={ICON.note} size="md" />
            Feedback
          </a>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-2xl border border-border/50 bg-card px-2.5 py-2 text-left transition-colors hover:border-teal/30"
              >
                <UserAvatar
                  src={avatarUrl ?? null}
                  fallbackName={displayName}
                  size="md"
                  className="size-9 rounded-xl"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-foreground">{displayName}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    Lvl {level} · {title}
                  </span>
                </span>
                <AppIcon icon={ICON.more} size="sm" tone="muted" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56 rounded-2xl p-2">
              <DropdownMenuItem asChild>
                <Link href={`/jammer/${userId}`} className="rounded-xl">
                  Public profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-xl"
                onClick={() => setTheme(themeLabel === "Dark" ? "light" : "dark")}
              >
                Theme · {themeLabel}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="rounded-xl text-destructive focus:text-destructive"
                onClick={() => setLogoutOpen(true)}
              >
                <AppIcon icon={ICON.signOut} size="sm" className="mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <CreateSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        availabilityCount={availabilityCount}
      />

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="rounded-2xl border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of GameJamCrew on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setLogoutOpen(false)
                void handleSignOut()
              }}
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
