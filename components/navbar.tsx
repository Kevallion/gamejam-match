"use client"

import {
  Gamepad2, Users, UserSearch, LogIn, PenLine, Hand,
  LogOut, Loader2, LayoutDashboard, Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { User } from "@supabase/supabase-js"

const NAV_LINKS = [
  { href: "/", icon: Users, label: "Find Teams" },
  { href: "/find-members", icon: UserSearch, label: "Find Members" },
  { href: "/create-team", icon: PenLine, label: "Post a Team" },
  { href: "/create-profile", icon: Hand, label: "I'm Available" },
]

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)

    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: "discord" })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 text-foreground transition-colors hover:text-primary">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15">
            <Gamepad2 className="size-5 text-primary" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">JamSquad</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, icon: Icon, label }) => {
            const active = isActive(href)
            return (
              <Button
                key={href}
                variant="ghost"
                asChild
                aria-current={active ? "page" : undefined}
                className={cn(
                  "gap-2 rounded-xl transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Link href={href}>
                  <Icon className="size-4" />
                  {label}
                </Link>
              </Button>
            )
          })}

          {/* Dashboard link — only when logged in */}
          {mounted && !loading && user && (
            <Button
              variant="ghost"
              asChild
              aria-current={isActive("/dashboard") ? "page" : undefined}
              className={cn(
                "gap-2 rounded-xl transition-colors",
                isActive("/dashboard")
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Link href="/dashboard">
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
            </Button>
          )}
        </div>

        {/* Right side: auth + mobile menu */}
        <div className="flex items-center gap-2">

          {/* Auth area — desktop */}
          <div className="hidden items-center gap-3 md:flex">
            {!mounted || loading ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : user ? (
              <>
                <span className="hidden text-sm font-medium text-muted-foreground lg:inline-block">
                  Hello, <span className="text-foreground">{user.user_metadata.full_name || "Jammer"}</span>!
                </span>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="gap-2 rounded-xl text-muted-foreground hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="size-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                onClick={handleSignIn}
                className="gap-2 rounded-xl bg-pink font-semibold text-pink-foreground hover:bg-pink/85"
              >
                <LogIn className="size-4" />
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile hamburger — Sheet opens from the LEFT */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="flex w-72 flex-col border-border/50 bg-card p-0">
              <SheetHeader className="border-b border-border/50 px-5 py-4">
                <SheetTitle className="flex items-center gap-2.5 text-left text-base">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary/15">
                    <Gamepad2 className="size-4 text-primary" />
                  </div>
                  JamSquad
                </SheetTitle>
              </SheetHeader>

              {/* Nav links */}
              <nav className="flex flex-col gap-1 p-4">
                {NAV_LINKS.map(({ href, icon: Icon, label }) => {
                  const active = isActive(href)
                  return (
                    <SheetClose key={href} asChild>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                        )}
                      >
                        <Icon className="size-4" />
                        {label}
                      </Link>
                    </SheetClose>
                  )
                })}

                {/* Dashboard — logged-in users only */}
                {mounted && !loading && user && (
                  <SheetClose asChild>
                    <Link
                      href="/dashboard"
                      aria-current={isActive("/dashboard") ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive("/dashboard")
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      )}
                    >
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Link>
                  </SheetClose>
                )}
              </nav>

              {/* Auth section — always at bottom */}
              <div className="mt-auto border-t border-border/50 p-4">
                {!mounted || loading ? (
                  <div className="flex justify-center py-3">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                ) : user ? (
                  <div className="flex flex-col gap-1">
                    <p className="mb-2 truncate px-3 text-xs text-muted-foreground">
                      Signed in as{" "}
                      <span className="font-semibold text-foreground">
                        {user.user_metadata.full_name || "Jammer"}
                      </span>
                    </p>
                    <Separator className="mb-2" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <LogOut className="size-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink px-4 py-2.5 text-sm font-semibold text-pink-foreground transition-colors hover:bg-pink/85"
                  >
                    <LogIn className="size-4" />
                    Sign In
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>

        </div>
      </nav>
    </header>
  )
}
