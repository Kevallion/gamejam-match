"use client"

import Link from "next/link"
import { AppIcon } from "@/components/ui/app-icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserAvatar } from "@/components/user-avatar"
import type { ApplicationData } from "@/components/dashboard-incoming-applications"
import type { InvitationData } from "@/components/dashboard-squad-invitations"
import { ICON } from "@/lib/icons"

type TodoAvailabilityPost = {
  id: string
  expires_at: string
  role?: string | null
  jam?: { title?: string | null } | null
}

function daysUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function DashboardTodo({
  applications,
  invitations,
  availabilityPosts,
  onAcceptApplication,
  onDeclineApplication,
  onAcceptInvitation,
  onDeclineInvitation,
  onRenewPost,
  busyRequestId,
  renewingPostId,
}: {
  applications: ApplicationData[]
  invitations: InvitationData[]
  availabilityPosts: TodoAvailabilityPost[]
  onAcceptApplication: (id: string) => void
  onDeclineApplication: (id: string) => void
  onAcceptInvitation: (invitation: InvitationData) => void
  onDeclineInvitation: (id: string) => void
  onRenewPost: (id: string) => void
  busyRequestId?: string | null
  renewingPostId?: string | null
}) {
  const expiringPosts = availabilityPosts.filter((p) => {
    const days = daysUntil(p.expires_at)
    return days <= 3
  })

  const items: React.ReactNode[] = []

  for (const app of applications.slice(0, 2)) {
    items.push(
      <div
        key={`app-${app.id}`}
        className="flex min-w-0 items-center gap-3 rounded-xl border border-border/40 bg-background/40 p-2.5"
      >
        <UserAvatar src={app.avatar_url} fallbackName={app.username} size="md" className="size-8 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{app.username} wants to join</p>
          <p className="truncate text-xs text-muted-foreground">
            {app.teamName} · {app.role.label}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Button
            type="button"
            size="icon"
            className="size-11 rounded-xl bg-teal text-teal-foreground hover:bg-teal/90"
            disabled={busyRequestId === app.id}
            aria-label="Accept"
            onClick={() => onAcceptApplication(app.id)}
          >
            <AppIcon icon={ICON.confirm} size="md" className="text-teal-foreground" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-11 rounded-xl"
            disabled={busyRequestId === app.id}
            aria-label="Decline"
            onClick={() => onDeclineApplication(app.id)}
          >
            <AppIcon icon={ICON.close} size="md" />
          </Button>
        </div>
      </div>,
    )
  }

  for (const inv of invitations.slice(0, 2)) {
    items.push(
      <div
        key={`inv-${inv.id}`}
        className="flex min-w-0 items-center gap-3 rounded-xl border border-border/40 bg-background/40 p-2.5"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mint/15">
          <AppIcon icon={ICON.invitations} size="sm" tone="mint" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">Invite to {inv.squadName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {inv.targetRole ? inv.targetRole : "Open role"}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Button
            type="button"
            size="icon"
            className="size-11 rounded-xl bg-teal text-teal-foreground hover:bg-teal/90"
            disabled={busyRequestId === inv.id}
            aria-label="Accept invite"
            onClick={() => onAcceptInvitation(inv)}
          >
            <AppIcon icon={ICON.confirm} size="md" className="text-teal-foreground" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-11 rounded-xl"
            disabled={busyRequestId === inv.id}
            aria-label="Decline invite"
            onClick={() => onDeclineInvitation(inv.id)}
          >
            <AppIcon icon={ICON.close} size="md" />
          </Button>
        </div>
      </div>,
    )
  }

  for (const post of expiringPosts.slice(0, 2)) {
    const days = daysUntil(post.expires_at)
    items.push(
      <div
        key={`post-${post.id}`}
        className="flex min-w-0 items-center gap-3 rounded-xl border border-border/40 bg-background/40 p-2.5"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-peach/15">
          <AppIcon icon={ICON.deadline} size="sm" tone="peach" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            Post expires in {days} d
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {[post.jam?.title, post.role].filter(Boolean).join(" · ") || "Availability post"}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0 rounded-xl border-peach/40 text-peach hover:bg-peach/10"
          disabled={renewingPostId === post.id}
          onClick={() => onRenewPost(post.id)}
        >
          Renew
        </Button>
      </div>,
    )
  }

  if (items.length === 0) return null

  return (
    <Card className="min-w-0 border-border/50 bg-card shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-foreground">To do</h3>
          <Badge className="rounded-full bg-peach px-2 py-0.5 text-[11px] font-bold text-peach-foreground">
            {items.length}
          </Badge>
        </div>
        <div className="space-y-2">{items}</div>
        <Button asChild variant="ghost" className="h-10 w-full rounded-xl text-sm text-teal">
          <Link href="/dashboard?tab=inbox">Open inbox</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
