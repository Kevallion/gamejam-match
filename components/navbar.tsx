"use client"

import { Bell, Gamepad2, Hand, LayoutDashboard, Loader2, LogIn, LogOut, Monitor, Moon, PenLine, Sun, UserSearch, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { useNotifications } from "@/hooks/use-notifications"
import { toast } from "sonner"

const ROLE_LABELS: Record<string, string> = {
  developer: "Developer",
  "2d-artist": "2D Artist",
  "3d-artist": "3D Artist",
  audio: "Audio",
  writer: "Writer",
  "game-design": "Game Designer",
  "ui-ux": "UI/UX",
  qa: "QA",
}

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { setTheme } = useTheme()
  const { notifications, unreadCount, loading: notifLoading } = useNotifications(user?.id ?? null)

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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
    })
    if (error) toast.error("Erreur de connexion", { description: error.message })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-foreground transition-colors hover:text-primary">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15">
            <Gamepad2 className="size-5 text-primary" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">GameJamCrew</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" asChild className="gap-2 rounded-xl text-muted-foreground hover:text-foreground">
            <Link href="/"><Users className="size-4" />Find Teams</Link>
          </Button>
          <Button variant="ghost" asChild className="gap-2 rounded-xl text-muted-foreground hover:text-foreground">
            <Link href="/find-members"><UserSearch className="size-4" />Find Members</Link>
          </Button>
          <Button variant="ghost" asChild className="gap-2 rounded-xl text-muted-foreground hover:text-foreground">
            <Link href="/create-team"><PenLine className="size-4" />Post a Team</Link>
          </Button>
          <Button variant="ghost" asChild className="gap-2 rounded-xl text-muted-foreground hover:text-foreground">
            <Link href="/create-profile"><Hand className="size-4" />I{"'"}m Available</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          {mounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <span className="relative flex size-4">
                    <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute inset-0 size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </span>
                  <span className="sr-only">Changer le thème</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 size-4" />
                  Clair
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 size-4" />
                  Sombre
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="mr-2 size-4" />
                  Système
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" className="rounded-xl" disabled>
              <span className="relative flex size-4">
                <Sun className="size-4" />
              </span>
              <span className="sr-only">Changer le thème</span>
            </Button>
          )}

          {/* Bell notifications — visible uniquement quand l'utilisateur est connecté */}
          {mounted && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-xl">
                  <Bell className="size-4" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-primary" />
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
                ) : notifications.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Aucune nouvelle notification
                  </p>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    {notifications.map((notif) => (
                      <DropdownMenuItem key={notif.id} asChild>
                        <Link
                          href="/dashboard"
                          className="flex cursor-pointer flex-col gap-0.5 rounded-xl px-3 py-2.5 focus:bg-accent"
                        >
                          <span className="text-sm font-medium leading-snug text-foreground">
                            {notif.kind === "application" ? (
                              <>
                                <span className="text-primary">{notif.senderName || "Quelqu'un"}</span>
                                {" a candidaté pour "}
                                <span className="font-bold">{notif.teamName}</span>
                              </>
                            ) : (
                              <>
                                <span className="font-bold">{notif.teamName}</span>
                                {" t'a invité(e)"}
                              </>
                            )}
                          </span>
                          {notif.targetRole && (
                            <span className="text-xs text-muted-foreground">
                              Rôle : {ROLE_LABELS[notif.targetRole] ?? notif.targetRole}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard"
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-primary"
                  >
                    <LayoutDashboard className="size-3.5" />
                    Voir tout dans le Dashboard
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Auth buttons */}
          {!mounted || loading ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm font-medium text-muted-foreground md:inline-block">
                Hello, <span className="text-foreground">{user.user_metadata.full_name || 'Jammer'}</span> !
              </span>

              <Button asChild variant="outline" className="gap-2 rounded-xl border-primary/30 text-primary hover:bg-primary/10">
                <Link href="/dashboard">
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Link>
              </Button>

              <Button onClick={handleSignOut} variant="outline" className="gap-2 rounded-xl text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10">
                <LogOut className="size-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button onClick={handleSignIn} className="gap-2 rounded-xl bg-[#5865F2] text-white hover:bg-[#4752C4]">
              <LogIn className="size-4" />
              Sign in with Discord
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}
