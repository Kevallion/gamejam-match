"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AppIcon } from "@/components/ui/app-icon"
import type { ApplicationData } from "@/components/dashboard-incoming-applications"
import type { InvitationData } from "@/components/dashboard-squad-invitations"
import type {
  SentApplicationOutboxItem,
  SentInvitationOutboxItem,
} from "@/components/dashboard-sent-outbox"
import { UserAvatar } from "@/components/user-avatar"
import { TagIcon } from "@/components/tag-icon"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"

function shortAge(dateIso?: string | null): string {
  if (!dateIso) return "now"
  const diffMs = Date.now() - new Date(dateIso).getTime()
  if (!Number.isFinite(diffMs)) return "now"
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return "now"
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function sentStatusUi(status: string): { label: string; className: string } {
  const normalized = status.toLowerCase()
  if (normalized === "accepted") {
    return { label: "Accepted", className: "border-success/40 bg-success/10 text-success" }
  }
  if (normalized === "rejected" || normalized === "declined") {
    return { label: "Declined", className: "border-destructive/40 bg-destructive/10 text-destructive" }
  }
  return { label: "Pending", className: "border-border/50 bg-muted/40 text-muted-foreground" }
}

function vibrateLight() {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(12)
    }
  } catch {
    // ignore
  }
}

type Segment = "received" | "sent"
type Filter = "all" | "applications" | "invites" | "sent"

export function DashboardInboxCompact({
  applications,
  invitations,
  sentApplications,
  sentInvitations,
  cancellingSentRequestId,
  onAcceptApplication,
  onDeclineApplication,
  onAcceptInvitation,
  onDeclineInvitation,
  onCancelPendingSentRequest,
  busyRequestId = null,
}: {
  applications: ApplicationData[]
  invitations: InvitationData[]
  sentApplications: SentApplicationOutboxItem[]
  sentInvitations: SentInvitationOutboxItem[]
  cancellingSentRequestId: string | null
  onAcceptApplication: (id: string) => void
  onDeclineApplication: (id: string) => void
  onAcceptInvitation: (invitation: InvitationData) => void
  onDeclineInvitation: (id: string) => void
  onCancelPendingSentRequest: (id: string) => void
  busyRequestId?: string | null
}) {
  const [segment, setSegment] = useState<Segment>("received")
  const [filter, setFilter] = useState<Filter>("all")

  const incomingCount = applications.length + invitations.length
  const sentCount = sentApplications.length + sentInvitations.length

  const showApplications = filter === "all" || filter === "applications"
  const showInvites = filter === "all" || filter === "invites"

  const pendingSent = useMemo(
    () => ({
      applications: sentApplications.filter((s) => s.status === "pending"),
      invitations: sentInvitations.filter((s) => s.status === "pending"),
    }),
    [sentApplications, sentInvitations],
  )

  const runOptimistic = (
    label: string,
    undoLabel: string,
    apply: () => void,
    undo: () => void,
  ) => {
    vibrateLight()
    apply()
    toast.message(label, {
      duration: 5000,
      action: {
        label: undoLabel,
        onClick: () => undo(),
      },
    })
  }

  const emptyReceived = incomingCount === 0
  const emptySent = sentCount === 0

  return (
    <div className="min-w-0 max-w-full space-y-4">
      <div className="flex rounded-xl bg-secondary/60 p-1">
        {(
          [
            { id: "received" as const, label: `Received · ${incomingCount}` },
            { id: "sent" as const, label: `Sent · ${sentCount}` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setSegment(tab.id)
              setFilter(tab.id === "sent" ? "sent" : "all")
            }}
            className={cn(
              "min-h-11 flex-1 rounded-lg px-3 text-sm font-semibold transition-colors",
              segment === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {segment === "received" ? (
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "all" as const, label: `All · ${incomingCount}` },
              { id: "applications" as const, label: `Applications · ${applications.length}` },
              { id: "invites" as const, label: `Invites · ${invitations.length}` },
            ] as const
          ).map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilter(chip.id)}
              className={cn(
                "min-h-9 rounded-full border px-3 text-xs font-semibold transition-colors",
                filter === chip.id
                  ? "border-teal/40 bg-teal/15 text-teal"
                  : "border-border/50 bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      ) : null}

      {segment === "received" ? (
        emptyReceived ? (
          <Card className="border-dashed border-border/60 bg-transparent">
            <CardContent className="flex flex-col items-center gap-3 px-4 py-8 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-peach/15">
                <AppIcon icon={ICON.applications} size="xl" tone="peach" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">Nothing to handle</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Applications and invites land here
                </p>
              </div>
              <Button asChild className="h-11 rounded-xl bg-teal text-teal-foreground hover:bg-teal/90">
                <Link href="/teams">Browse squads</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid min-w-0 gap-3 md:grid-cols-2">
            {showApplications
              ? applications.map((app) => (
                  <Card
                    key={app.id}
                    id={`inbox-request-${app.id}`}
                    className="min-w-0 border-border/50 bg-card shadow-sm"
                  >
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start gap-3">
                        <UserAvatar
                          src={app.avatar_url}
                          fallbackName={app.username}
                          size="md"
                          className="size-10 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-foreground">
                            {app.username}
                            {app.role.key ? (
                              <span className="ml-1 font-medium text-muted-foreground">
                                ·{" "}
                                <TagIcon
                                  kind="role"
                                  value={app.role.key}
                                  size="xs"
                                  showLabel
                                  withTooltip={false}
                                />
                              </span>
                            ) : null}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            wants to join {app.teamName}
                          </p>
                        </div>
                        <Badge className="shrink-0 rounded-full border-peach/40 bg-peach/15 text-[11px] text-peach">
                          Application
                        </Badge>
                      </div>
                      {app.motivation ? (
                        <p className="line-clamp-2 rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
                          “{app.motivation}”
                        </p>
                      ) : null}
                      <p className="text-[11px] text-muted-foreground">{shortAge(app.createdAt)} ago</p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 flex-1 rounded-xl"
                          disabled={busyRequestId === app.id}
                          onClick={() =>
                            runOptimistic(
                              "Application declined",
                              "Undo",
                              () => onDeclineApplication(app.id),
                              () => toast.message("Already sent — reopen Inbox if needed"),
                            )
                          }
                        >
                          Decline
                        </Button>
                        <Button
                          type="button"
                          className="h-11 flex-1 rounded-xl bg-teal text-teal-foreground hover:bg-teal/90"
                          disabled={busyRequestId === app.id}
                          onClick={() =>
                            runOptimistic(
                              "Application accepted",
                              "Undo",
                              () => onAcceptApplication(app.id),
                              () => toast.message("Already sent — manage the squad if needed"),
                            )
                          }
                        >
                          Accept
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              : null}

            {showInvites
              ? invitations.map((inv) => (
                  <Card
                    key={inv.id}
                    id={`inbox-request-${inv.id}`}
                    className="min-w-0 border-border/50 bg-card shadow-sm"
                  >
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mint/15">
                          <AppIcon icon={ICON.invitations} size="md" tone="mint" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-foreground">{inv.squadName}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            invites you{inv.targetRole ? ` as ${inv.targetRole}` : ""}
                          </p>
                        </div>
                        <Badge className="shrink-0 rounded-full border-lavender/40 bg-lavender/15 text-[11px] text-lavender">
                          Invite
                        </Badge>
                      </div>
                      {inv.captainMessage ? (
                        <p className="line-clamp-2 rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
                          “{inv.captainMessage}”
                        </p>
                      ) : null}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 flex-1 rounded-xl"
                          disabled={busyRequestId === inv.id}
                          onClick={() =>
                            runOptimistic(
                              "Invitation declined",
                              "Undo",
                              () => onDeclineInvitation(inv.id),
                              () => toast.message("Already sent"),
                            )
                          }
                        >
                          Decline
                        </Button>
                        <Button
                          type="button"
                          className="h-11 flex-1 rounded-xl bg-teal text-teal-foreground hover:bg-teal/90"
                          disabled={busyRequestId === inv.id}
                          onClick={() =>
                            runOptimistic(
                              "Invitation accepted",
                              "Undo",
                              () => onAcceptInvitation(inv),
                              () => toast.message("Already sent"),
                            )
                          }
                        >
                          Accept
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              : null}
          </div>
        )
      ) : emptySent ? (
        <Card className="border-dashed border-border/60 bg-transparent">
          <CardContent className="flex flex-col items-center gap-3 px-4 py-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-teal/15">
              <AppIcon icon={ICON.send} size="xl" tone="teal" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">No sent requests yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Apply to a squad or invite a jammer to see them here
              </p>
            </div>
            <Button asChild className="h-11 rounded-xl bg-teal text-teal-foreground hover:bg-teal/90">
              <Link href="/teams">Browse squads</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sentApplications.map((request) => {
            const status = sentStatusUi(request.status)
            return (
              <Card key={request.id} className="border-border/50 bg-card">
                <CardContent className="flex min-w-0 items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {request.teamName} · Application
                    </p>
                    <p className="text-xs text-muted-foreground">{status.label}</p>
                  </div>
                  {request.status === "pending" ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 shrink-0 rounded-xl"
                      disabled={cancellingSentRequestId === request.id}
                      onClick={() => onCancelPendingSentRequest(request.id)}
                    >
                      Cancel
                    </Button>
                  ) : (
                    <Badge className={cn("rounded-full border px-2 py-0.5 text-[11px]", status.className)}>
                      {status.label}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )
          })}
          {sentInvitations.map((request) => {
            const status = sentStatusUi(request.status)
            return (
              <Card key={request.id} className="border-border/50 bg-card">
                <CardContent className="flex min-w-0 items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {request.teamName} · Invite to {request.inviteeUsername}
                    </p>
                    <p className="text-xs text-muted-foreground">{status.label}</p>
                  </div>
                  {request.status === "pending" ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 shrink-0 rounded-xl"
                      disabled={cancellingSentRequestId === request.id}
                      onClick={() => onCancelPendingSentRequest(request.id)}
                    >
                      Cancel
                    </Button>
                  ) : (
                    <Badge className={cn("rounded-full border px-2 py-0.5 text-[11px]", status.className)}>
                      {status.label}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )
          })}
          {pendingSent.applications.length + pendingSent.invitations.length === 0 ? null : null}
        </div>
      )}
    </div>
  )
}
