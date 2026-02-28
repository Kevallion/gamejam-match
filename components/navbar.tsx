"use client"

import { Gamepad2, Users, UserSearch, LogIn, PenLine, Hand } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-foreground transition-colors hover:text-primary"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15">
            <Gamepad2 className="size-5 text-primary" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">
            JamSquad
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Button
            variant="ghost"
            asChild
            className="gap-2 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Link href="/">
              <Users className="size-4" />
              Find Teams
            </Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="gap-2 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Link href="/find-members">
              <UserSearch className="size-4" />
              Find Members
            </Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="gap-2 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Link href="/create-team">
              <PenLine className="size-4" />
              Post a Team
            </Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="gap-2 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Link href="/create-profile">
              <Hand className="size-4" />
              I{"'"}m Available
            </Link>
          </Button>
        </div>

        <Button className="gap-2 rounded-xl bg-pink text-pink-foreground hover:bg-pink/80">
          <LogIn className="size-4" />
          Sign In
        </Button>
      </nav>
    </header>
  )
}
