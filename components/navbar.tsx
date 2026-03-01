"use client"

import {
  Gamepad2, Users, UserSearch, LogIn, PenLine, Hand,
  LogOut, Loader2, LayoutDashboard, Sun, Moon, Monitor, Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
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
  const { setTheme } = useTheme()

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
    const { error } = await supabase.auth.signInWithOAuth({ provider: "discord" })
    if (error) alert("Erreur de connexion : " + error.message)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

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
          {NAV_LINKS.map(({ href, icon: Icon, label }) => (
            <Button key={href} variant="ghost" asChild className="gap-2 rounded-xl text-muted-foreground hover:text-foreground">
              <Link href={href}><Icon className="size-4" />{label}</Link>
            </Button>
          ))}
        </div>

        {/* Right side: theme toggle + auth + mobile menu */}
        <div className="flex items-center gap-2">

          {/* Theme toggle */}
          {mounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <span className="relative flex size-4">
                    <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute inset-0 size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </span>
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 size-4" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 size-4" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="mr-2 size-4" /> System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" className="rounded-xl" disabled>
              <Sun className="size-4" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          {/* Auth — desktop only */}
          <div className="hidden md:flex items-center gap-3">
            {!mounted || loading ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : user ? (
              <>
                <span className="hidden text-sm font-medium text-muted-foreground lg:inline-block">
                  Hello, <span className="text-foreground">{user.user_metadata.full_name || "Jammer"}</span>!
                </span>
                <Button asChild variant="outline" className="gap-2 rounded-xl border-primary/30 text-primary hover:bg-primary/10">
                  <Link href="/dashboard"><LayoutDashboard className="size-4" />Dashboard</Link>
                </Button>
                <Button onClick={handleSignOut} variant="outline" className="gap-2 rounded-xl text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10">
                  <LogOut className="size-4" />Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={handleSignIn} className="gap-2 rounded-xl bg-[#5865F2] text-white hover:bg-[#4752C4]">
                <LogIn className="size-4" />Sign in with Discord
              </Button>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="flex w-72 flex-col border-border/50 bg-card p-0">
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
                {NAV_LINKS.map(({ href, icon: Icon, label }) => (
                  <SheetClose key={href} asChild>
                    <Link
                      href={href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Icon className="size-4" />
                      {label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              {/* Auth section at bottom */}
              <div className="mt-auto border-t border-border/50 p-4">
                {!mounted || loading ? (
                  <div className="flex justify-center py-3">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                ) : user ? (
                  <div className="flex flex-col gap-1">
                    <p className="mb-2 truncate px-3 text-xs text-muted-foreground">
                      Signed in as <span className="font-semibold text-foreground">{user.user_metadata.full_name || "Jammer"}</span>
                    </p>
                    <Separator className="mb-2" />
                    <SheetClose asChild>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                      >
                        <LayoutDashboard className="size-4" />Dashboard
                      </Link>
                    </SheetClose>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <LogOut className="size-4" />Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4752C4]"
                  >
                    <LogIn className="size-4" />Sign in with Discord
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