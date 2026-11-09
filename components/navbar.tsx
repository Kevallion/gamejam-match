"use client"

/* eslint-disable react-hooks/set-state-in-effect */

import { Bell, Gamepad2, Hand, Heart, LayoutDashboard, LoaderCircle, LogIn, LogOut, Menu, MessageSquareText, Monitor, Moon, PenLine, Sparkles, Sun, UserRoundSearch, UsersRound } from "lucide-react"
import { FEEDBACK_URL } from "@/components/FeedbackButton"
import { SupportNavbarPopover } from "@/components/support-navbar-popover"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { subscribeToAuthComplete } from "@/lib/auth-utils"
import { AuthModal } from "@/components/auth-modal"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { useNotifications } from "@/hooks/use-notifications"
import { NavbarNotificationRow } from "@/components/navbar-notification-row"
import { JammerLevelBadge, JammerTitleBadge } from "@/components/profile-card"
import { levelFromTotalXp } from "@/lib/gamification-level"

const NAV_ITEMS = [
  { href: "/teams", label: "Explore", icon: UsersRound },
  { href: "/find-members", label: "Members", icon: UserRoundSearch },
  { href: "/create-team", label: "Create a Squad", icon: PenLine },
  { href: "/create-profile", label: "Available", icon: Hand },
  { href: "/showcase", label: "How it works", icon: Sparkles },
] as const

type NavbarProfile = {
  username?: string | null
  avatar_url?: string | null
  xp?: number | null
  current_title?: string | null
}

function getDisplayName(user: User | null, profile: NavbarProfile | null): string {
  const fromProfile = profile?.username?.trim()
  if (fromProfile) return fromProfile

  const meta = user?.user_metadata as Record<string, string> | undefined
  const fromMeta =
    meta?.full_name?.trim() ||
    meta?.name?.trim() ||
    meta?.user_name?.trim() ||
    meta?.username?.trim()

  if (fromMeta && !fromMeta.includes("@") && !fromMeta.includes("+")) return fromMeta

  return "Jammer"
}

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<NavbarProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { setTheme } = useTheme()
  const {
    notifications,
    unreadCount,
    loading: notifLoading,
    refetch: refetchNotifications,
    dismissNotification,
    markAllAsRead,
  } = useNotifications(user?.id ?? null)

  useEffect(() => {
    async function loadProfileForUser(authUser: User | null) {
      if (!authUser) {
        setProfile(null)
        return
      }

      const { data } = await supabase
        .from("profiles")
        .select("username, avatar_url, xp, current_title")
        .eq("id", authUser.id)
        .maybeSingle()

      setProfile(data ?? null)
    }

    setMounted(true)

    async function getUserAndProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      const authUser = session?.user || null
      setUser(authUser)
      await loadProfileForUser(authUser)
      setLoading(false)
    }
    void getUserAndProfile()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user || null
      setUser(authUser)
      void loadProfileForUser(authUser)
    })

    // Refresh session when OAuth auth completes in popup (mobile)
    const unsubscribe = subscribeToAuthComplete(() => {
      void getUserAndProfile()
    })

    return () => {
      authListener.subscription.unsubscribe()
      unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace("/")
  }

  const displayName = getDisplayName(user, profile)
  const navXp = typeof profile?.xp === "number" ? profile.xp : 0
  const navLevel = levelFromTotalXp(navXp)
  const navTitle =
    profile?.current_title?.trim() ||
    (user ? "Rookie Jammer" : "")

  return (
    <>
      {/* Floating Desktop Navbar - Hidden on mobile */}
      <header className="fixed top-4 left-1/2 z-50 hidden w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 px-2 lg:block">
        <nav className="glass-navbar flex min-w-0 w-full items-center gap-2 overflow-x-auto overflow-y-hidden rounded-2xl px-3 py-2 shadow-lg shadow-black/5 scrollbar-none">
          {/* Logo */}
          <Link href="/" aria-label="GameJamCrew home" className="flex shrink-0 items-center gap-2 px-2 text-foreground transition-colors hover:text-primary">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/15">
              <Gamepad2 className="size-4 text-primary" />
            </div>
            {/* Wordmark only from xl: keeps the bar within the viewport at lg (1024-1279 px) */}
            <span className="hidden text-base font-extrabold tracking-tight xl:inline">GameJamCrew</span>
          </Link>

          {/* Separator */}
          <div className="mx-1 h-6 w-px shrink-0 bg-border/50" />

          {/* Nav Links */}
          <div className="flex shrink-0 items-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <Button key={item.href} variant="ghost" asChild size="sm" className="gap-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10">
                  <Link href={item.href}>
                    <Icon className="hidden size-3.5 xl:block" />
                    {item.label}
                  </Link>
                </Button>
              )
            })}
          </div>

          {/* Separator */}
          <div className="mx-1 h-6 w-px shrink-0 bg-border/50" />

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1">
            {mounted ? (
              <SupportNavbarPopover className="size-8" />
            ) : (
              <Button variant="ghost" size="icon" className="size-8 rounded-xl" disabled aria-label="Support the project">
                <Heart className="size-4 opacity-30" />
              </Button>
            )}
            {/* Theme switcher */}
            {mounted ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 rounded-xl hover:bg-white/10">
                    <span className="relative flex size-4">
                      <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute inset-0 size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </span>
                    <span className="sr-only">Change theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="size-4" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="size-4" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="size-4" />
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="size-8 rounded-xl" disabled>
                <Sun className="size-4" />
                <span className="sr-only">Change theme</span>
              </Button>
            )}

            {/* Notifications */}
            {mounted && user && (
              <DropdownMenu
                modal={false}
                onOpenChange={(open) => open && refetchNotifications()}
              >
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative size-8 rounded-xl hover:bg-white/10">
                    <Bell className="size-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-peach text-peach-foreground px-1 text-xs font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2">
                  <DropdownMenuLabel className="flex items-center gap-2 px-2 py-1.5 text-sm font-bold">
                    <Bell className="size-4 text-primary" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                        {unreadCount}
                      </span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {notifLoading && notifications.length === 0 ? (
                    <div className="space-y-2 px-1 py-2">
                      <Skeleton className="h-12 w-full rounded-xl" />
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                  ) : notifications.filter((n) => !n.is_read).length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      You&apos;re all caught up
                    </p>
                  ) : (
                    <div className="flex max-h-72 flex-col gap-1 overflow-y-auto pr-0.5">
                      {notifications
                        .filter((n) => !n.is_read)
                        .map((notif) => (
                          <NavbarNotificationRow
                            key={notif.id}
                            notification={notif}
                            onMarkRead={(id) => void dismissNotification(id)}
                          />
                        ))}
                    </div>
                  )}

                  <DropdownMenuSeparator />
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => void markAllAsRead()}
                      disabled={unreadCount === 0}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Mark all as read
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(unreadCount > 0 ? "/dashboard?tab=inbox" : "/dashboard")
                      }
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl px-2 py-1 text-xs font-semibold text-primary hover:text-primary/90"
                    >
                      <LayoutDashboard className="size-3.5" />
                      View all
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Auth */}
            {!mounted || loading ? (
              <LoaderCircle className="size-4 animate-spin text-muted-foreground mx-2" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-w-0 max-w-48 shrink gap-2 overflow-hidden rounded-xl hover:bg-white/10"
                  >
                    <div className="flex min-w-0 max-w-full items-center gap-2">
                      <JammerLevelBadge level={navLevel} />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{displayName}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                  <DropdownMenuLabel className="px-2 py-1.5">
                    <p className="text-sm font-medium text-foreground">{displayName}</p>
                    <JammerTitleBadge title={navTitle} className="mt-1 text-xs" />
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 rounded-xl">
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-destructive focus:text-destructive rounded-xl"
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setAuthModalOpen(true)} size="sm" className="gap-1.5 rounded-xl bg-teal text-teal-foreground hover:bg-teal/90">
                <LogIn className="size-3.5" />
                Sign In
              </Button>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Header - Simple top bar for branding + actions */}
      <header className="sticky top-0 z-40 w-full glass-navbar lg:hidden">
        <nav className="flex h-14 min-w-0 items-center justify-between gap-2 px-4">
          {/* Logo */}
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-foreground">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/15">
              <Gamepad2 className="size-4 text-primary" />
            </div>
            <span className="truncate text-base font-extrabold tracking-tight">GameJamCrew</span>
          </Link>

          {/* Mobile Actions */}
          <div className="flex shrink-0 items-center gap-1">
            {mounted ? <SupportNavbarPopover className="size-9" /> : (
              <Button variant="ghost" size="icon" className="size-9 rounded-xl" disabled aria-label="Support the project">
                <Heart className="size-4 opacity-30" />
              </Button>
            )}
            {/* Theme */}
            {mounted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-9 rounded-xl">
                    <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Change theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="size-4" />Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="size-4" />Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="size-4" />System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Notifications */}
            {mounted && user && (
              <DropdownMenu
                modal={false}
                onOpenChange={(open) => open && refetchNotifications()}
              >
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative size-9 rounded-xl" aria-label="Notifications">
                    <Bell className="size-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-peach text-peach-foreground px-1 text-xs font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 rounded-2xl p-2">
                  <DropdownMenuLabel className="flex items-center gap-2 px-2 py-1.5 text-sm font-bold">
                    <Bell className="size-4 text-primary" />
                    Notifications
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifLoading && notifications.length === 0 ? (
                    <div className="space-y-2 px-1 py-2">
                      <Skeleton className="h-10 w-full rounded-xl" />
                      <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                  ) : notifications.filter((n) => !n.is_read).length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      You&apos;re all caught up
                    </p>
                  ) : (
                    <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
                      {notifications
                        .filter((n) => !n.is_read)
                        .slice(0, 5)
                        .map((notif) => (
                          <NavbarNotificationRow
                            key={notif.id}
                            notification={notif}
                            onMarkRead={(id) => void dismissNotification(id)}
                            compact
                          />
                        ))}
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard?tab=inbox")}
                    className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-primary"
                  >
                    View all notifications
                  </button>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Menu — hidden when signed in (app shell / Me hub replaces burger). */}
            {mounted && !user ? (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-9 rounded-xl">
                    <Menu className="size-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex w-[min(100vw-2rem,320px)] flex-col glass-card border-l-0 px-0 pt-14">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex min-h-0 flex-1 flex-col pt-4 px-4">
                    {/* User Info */}
                    <div className="border-b border-border/40 pb-4">
                      {!mounted || loading ? (
                        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
                      ) : user ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <JammerLevelBadge level={navLevel} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold text-foreground">{displayName}</p>
                              <JammerTitleBadge title={navTitle} className="text-xs" />
                            </div>
                          </div>
                          <Button asChild size="sm" className="w-full rounded-xl bg-teal text-teal-foreground hover:bg-teal/90">
                            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                              <LayoutDashboard className="size-4" />
                              Dashboard
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                          className="w-full rounded-xl bg-teal text-teal-foreground hover:bg-teal/90"
                        >
                          <LogIn className="size-4" />
                          Sign In
                        </Button>
                      )}
                    </div>

                    {/* Nav Links */}
                    <nav className="mt-4 flex flex-col gap-1">
                      {NAV_ITEMS.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                          >
                            <Icon className="size-5" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        )
                      })}
                      <a
                        href={FEEDBACK_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                      >
                        <MessageSquareText className="size-5" />
                        <span className="font-medium">Feedback</span>
                      </a>
                    </nav>

                    {user ? (
                      <div className="mt-auto border-t border-border/40 px-0 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-11 w-full justify-center rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setLogoutConfirmOpen(true)}
                        >
                          <LogOut className="size-4" />
                          Log out
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </SheetContent>
              </Sheet>
            ) : !user ? (
              <Button variant="ghost" size="icon" className="size-9 rounded-xl" disabled aria-label="Open menu">
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            ) : (
              <Button asChild variant="ghost" size="icon" className="size-9 rounded-xl" aria-label="Me">
                <Link href="/dashboard?hub=me">
                  <LayoutDashboard className="size-5" />
                </Link>
              </Button>
            )}
          </div>
        </nav>
      </header>

      <AlertDialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
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
                setLogoutConfirmOpen(false)
                setMobileMenuOpen(false)
                handleSignOut()
              }}
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {mounted && <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />}
    </>
  )
}
