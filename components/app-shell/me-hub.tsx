"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useState, useSyncExternalStore } from "react"
import { toast } from "sonner"
import { FEEDBACK_URL } from "@/components/FeedbackButton"
import { JammerLevelBadge, JammerTitleBadge } from "@/components/profile-card"
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
import { Progress } from "@/components/ui/progress"
import { UserAvatar } from "@/components/user-avatar"
import { dashboardHref } from "@/components/app-shell/nav-config"
import { ICON } from "@/lib/icons"
import { gamificationLevelProgress, levelFromTotalXp } from "@/lib/gamification-level"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

type MeHubProps = {
  userId: string
  displayName: string
  avatarUrl?: string | null
  xp?: number
  currentTitle?: string | null
  availabilityCount?: number
  badgeUnlocked?: number
  badgeTotal?: number
  className?: string
}

function HubRow({
  href,
  label,
  meta,
  icon,
  external,
  onClick,
}: {
  href?: string
  label: string
  meta?: string
  icon: typeof ICON.jammer
  external?: boolean
  onClick?: () => void
}) {
  const content = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary/80">
        <AppIcon icon={icon} size="md" tone="muted" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        {meta ? <span className="block text-xs text-muted-foreground">{meta}</span> : null}
      </span>
      <AppIcon icon={ICON.navRight} size="sm" tone="muted" />
    </>
  )

  const className =
    "flex min-h-11 items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-white/5"

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn("w-full", className)}>
        {content}
      </button>
    )
  }

  if (external && href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    )
  }

  return (
    <Link href={href ?? "#"} className={className}>
      {content}
    </Link>
  )
}

export function MeHub({
  userId,
  displayName,
  avatarUrl,
  xp = 0,
  currentTitle,
  availabilityCount = 0,
  badgeUnlocked = 0,
  badgeTotal = 0,
  className,
}: MeHubProps) {
  const router = useRouter()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const themeMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const level = levelFromTotalXp(xp)
  const progress = gamificationLevelProgress(xp)
  const title = currentTitle?.trim() || "Rookie Jammer"
  const themeLabel = !themeMounted
    ? "…"
    : (theme === "system" ? resolvedTheme : theme) === "light"
      ? "Light"
      : "Dark"

  const cycleTheme = () => {
    const current = theme === "system" ? resolvedTheme : theme
    setTheme(current === "dark" ? "light" : "dark")
  }

  const handleInviteFriend = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://gamejamcrew.com"
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: "GameJamCrew",
          text: "Find your next game jam squad",
          url: shareUrl,
        })
        return
      }
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Invite link copied")
    } catch {
      // User cancelled share or clipboard unavailable
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace("/")
  }

  return (
    <div className={cn("mx-auto w-full max-w-lg space-y-4", className)}>
      <section className="rounded-2xl border border-border/50 bg-card p-4">
        <div className="flex items-center gap-3">
          <UserAvatar
            src={avatarUrl ?? null}
            fallbackName={displayName}
            size="lg"
            className="size-12 rounded-2xl ring-2 ring-border/40"
          />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-base font-bold text-foreground">{displayName}</p>
              <JammerLevelBadge level={level} />
            </div>
            <JammerTitleBadge title={title} className="mt-0.5 text-xs" />
          </div>
        </div>
        <Progress value={progress.progressPercent} className="mt-3 h-1.5 bg-muted/80" />
        <Link
          href={`/jammer/${userId}`}
          className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-teal hover:underline"
        >
          View public profile
          <AppIcon icon={ICON.navRight} size="sm" className="ml-1 text-teal" />
        </Link>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border/50 bg-card">
        <HubRow
          href={dashboardHref("availability")}
          label="My posts"
          meta={`${availabilityCount}/3 active`}
          icon={ICON.available}
        />
        <div className="mx-4 border-t border-border/40" />
        <HubRow
          href={dashboardHref("achievements")}
          label="Achievements"
          meta={badgeTotal > 0 ? `${badgeUnlocked}/${badgeTotal}` : undefined}
          icon={ICON.achievement}
        />
        <div className="mx-4 border-t border-border/40" />
        <HubRow href={dashboardHref("settings")} label="Settings" icon={ICON.settings} />
        <div className="mx-4 border-t border-border/40" />
        <HubRow label="Invite a friend" icon={ICON.share} onClick={() => void handleInviteFriend()} />
      </section>

      <section className="overflow-hidden rounded-2xl border border-border/50 bg-card">
        <HubRow href="/showcase" label="How it works" icon={ICON.recommended} />
        <div className="mx-4 border-t border-border/40" />
        <HubRow href={FEEDBACK_URL} label="Feedback" icon={ICON.note} external />
        <div className="mx-4 border-t border-border/40" />
        <HubRow
          label={`Theme · ${themeLabel}`}
          icon={ICON.settings}
          onClick={cycleTheme}
        />
      </section>

      <Button
        type="button"
        variant="outline"
        className="h-12 w-full rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setLogoutOpen(true)}
      >
        <AppIcon icon={ICON.signOut} size="md" className="mr-2" />
        Log out
      </Button>

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
    </div>
  )
}
