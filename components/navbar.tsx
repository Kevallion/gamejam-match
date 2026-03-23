"use client"

/* eslint-disable react-hooks/set-state-in-effect */

import { Bell, Gamepad2, Hand, LayoutDashboard, Loader2, LogIn, LogOut, Menu, Monitor, Moon, PenLine, Sun, UserSearch, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { subscribeToAuthComplete } from "@/lib/auth-utils"
import { AuthModal } from "@/components/auth-modal"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { useNotifications } from "@/hooks/use-notifications"
import { JammerLevelBadge, JammerTitleBadge } from "@/components/profile-card"
import { levelFromTotalXp } from "@/lib/gamification-level"

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

  if (fromMeta) return fromMeta

  if (user?.email) {
    const [local] = user.email.split("@")
    if (local) return local
  }

  return "Jammer"
}

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<NavbarProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 hidden md:block">
        <nav className="glass flex items-center gap-2 rounded-2xl px-3 py-2 shadow-lg shadow-black/5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 px-2 text-foreground transition-colors hover:text-primary">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/15">
              <Gamepad2 className="size-4 text-primary" />
            </div>
            <span className="text-base font-extrabold tracking-tight">GameJamCrew</span>
          </Link>

          {/* Separator */}
          <div className="h-6 w-px bg-border/50 mx-1" />

          {/* Nav Links */}
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" asChild size="sm" className="gap-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10">
              <Link href="/"><Users className="size-3.5" />Teams</Link>
            </Button>
            <Button variant="ghost" asChild size="sm" className="gap-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10">
              <Link href="/find-members"><UserSearch className="size-3.5" />Members</Link>
            </Button>
            <Button variant="ghost" asChild size="sm" className="gap-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10">
              <Link href="/create-team"><PenLine className="size-3.5" />Post Team</Link>
            </Button>
            <Button variant="ghost" asChild size="sm" className="gap-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10">
              <Link href="/create-profile"><Hand className="size-3.5" />Available</Link>
            </Button>
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-border/50 mx-1" />

          {/* Actions */}
          <div className="flex items-center gap-1">
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
                    <Sun className="mr-2 size-4" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 size-4" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="mr-2 size-4" />
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
              <DropdownMenu onOpenChange={(open) => open && refetchNotifications()}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative size-8 rounded-xl hover:bg-white/10">
                    <Bell className="size-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-peach text-peach-foreground px-1 text-[10px] font-bold">
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

                  {notifLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : notifications.filter((n) => !n.is_read).length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No new notifications
                    </p>
                  ) : (
                    <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto">
                      {notifications
                        .filter((n) => !n.is_read)
                        .map((notif) => (
                        <DropdownMenuItem key={notif.id} asChild>
                          <Link
                            href={notif.link || "/dashboard"}
                            onClick={() => dismissNotification(notif.id)}
                            className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 text-left focus:bg-accent"
                          >
                            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium leading-snug text-foreground line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                                {notif.type}
                              </p>
                            </div>
                          </Link>
                        </DropdownMenuItem>
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
                    <Link
                      href={unreadCount > 0 ? "/dashboard?tab=inbox" : "/dashboard"}
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl px-2 py-1 text-xs font-semibold text-primary hover:text-primary/90"
                    >
                      <LayoutDashboard className="size-3.5" />
                      View all
                    </Link>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Auth */}
            {!mounted || loading ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground mx-2" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 rounded-xl hover:bg-white/10 max-w-48">
                    <div className="flex items-center gap-2">
                      <JammerLevelBadge level={navLevel} />
                      <span className="truncate text-sm font-medium">{displayName}</span>
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
                    <LogOut className="size-4 mr-2" />
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
      <header className="sticky top-0 z-40 w-full glass md:hidden">
        <nav className="flex h-14 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/15">
              <Gamepad2 className="size-4 text-primary" />
            </div>
            <span className="text-base font-extrabold tracking-tight">GameJamCrew</span>
          </Link>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1">
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
                    <Sun className="mr-2 size-4" />Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 size-4" />Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="mr-2 size-4" />System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Notifications */}
            {mounted && user && (
              <DropdownMenu onOpenChange={(open) => open && refetchNotifications()}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative size-9 rounded-xl">
                    <Bell className="size-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-peach text-peach-foreground px-1 text-[10px] font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 rounded-2xl p-2">
                  <DropdownMenuLabel className="flex items-center gap-2 px-2 py-1.5 text-sm font-bold">
                    <Bell className="size-4 text-primary" />
                    Notifications
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : notifications.filter((n) => !n.is_read).length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No new notifications
                    </p>
                  ) : (
                    <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                      {notifications.filter((n) => !n.is_read).slice(0, 5).map((notif) => (
                        <DropdownMenuItem key={notif.id} asChild>
                          <Link
                            href={notif.link || "/dashboard"}
                            onClick={() => dismissNotification(notif.id)}
                            className="flex items-start gap-2 rounded-xl px-2 py-2"
                          >
                            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                            <p className="text-sm line-clamp-2">{notif.message}</p>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <Link
                    href="/dashboard?tab=inbox"
                    className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-primary"
                  >
                    View all notifications
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="size-9 rounded-xl">
                  <Menu className="size-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col w-[min(100vw-2rem,320px)] glass-card border-l-0 px-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-1 flex-col pt-4 px-4">
                  {/* User Info */}
                  <div className="pb-4 border-b border-border/40">
                    {!mounted || loading ? (
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    ) : user ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <JammerLevelBadge level={navLevel} />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">{displayName}</p>
                            <JammerTitleBadge title={navTitle} className="text-xs" />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button asChild size="sm" className="flex-1 rounded-xl bg-teal text-teal-foreground hover:bg-teal/90">
                            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                              <LayoutDashboard className="size-4 mr-1.5" />
                              Dashboard
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                          >
                            <LogOut className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                        className="w-full rounded-xl bg-teal text-teal-foreground hover:bg-teal/90"
                      >
                        <LogIn className="size-4 mr-2" />
                        Sign In
                      </Button>
                    )}
                  </div>

                  {/* Nav Links */}
                  <nav className="mt-4 flex flex-col gap-1">
                    <Link
                      href="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                    >
                      <Users className="size-5" />
                      <span className="font-medium">Find Teams</span>
                    </Link>
                    <Link
                      href="/find-members"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                    >
                      <UserSearch className="size-5" />
                      <span className="font-medium">Find Members</span>
                    </Link>
                    <Link
                      href="/create-team"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                    >
                      <PenLine className="size-5" />
                      <span className="font-medium">Post a Team</span>
                    </Link>
                    <Link
                      href="/create-profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                    >
                      <Hand className="size-5" />
                      <span className="font-medium">I{"'"}m Available</span>
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      {mounted && <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />}
    </>
  )
}
