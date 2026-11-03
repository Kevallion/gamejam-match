"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { ApplicationData } from "@/components/dashboard-incoming-applications"
import type { InvitationData } from "@/components/dashboard-squad-invitations"
import type {
  SentApplicationOutboxItem,
  SentInvitationOutboxItem,
} from "@/components/dashboard-sent-outbox"
import { UserAvatar } from "@/components/user-avatar"
import { Check, Clock3, Inbox, Mail, Send, X } from "lucide-react"

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
  return { label: "Pending", className: "border-amber-500/40 bg-amber-500/10 text-amber-500" }
}

function EmptyInboxState({
  icon,
  sentence,
  href,
  cta,
}: {
  icon: ReactNode
  sentence: string
  href: string
  cta: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-2 py-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        {icon}
      </div>
      <p className="max-w-xs text-sm text-muted-foreground">{sentence}</p>
      <Button asChild variant="outline" className="h-11 rounded-xl">
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  )
}

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
  const incomingCount = applications.length + invitations.length
  const sentCount = sentApplications.length + sentInvitations.length

  return (
    <div className="grid min-w-0 max-w-full gap-4">
      <Card className="min-w-0 max-w-full border-border/60 bg-card shadow-sm">
        <CardHeader className="min-w-0 pb-2">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Inbox className="size-4 shrink-0 text-peach" aria-hidden />
              <h3 className="truncate text-sm font-bold text-foreground">Incoming applications</h3>
            </div>
            <Badge className="shrink-0 rounded-full bg-peach/15 px-2 py-0 text-xs font-bold text-peach">
              {incomingCount}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="min-w-0 space-y-2">
          {incomingCount === 0 ? (
            <EmptyInboxState
              icon={<Inbox className="size-5" aria-hidden />}
              sentence="No pending requests right now."
              href="/find-members"
              cta="Find jammers"
            />
          ) : (
            <>
              {applications.map((app) => (
                <div
                  key={app.id}
                  id={`inbox-request-${app.id}`}
                  className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/50 bg-background/40 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <UserAvatar src={app.avatar_url} fallbackName={app.username} size="xs" className="size-9 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{app.username}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {app.role.emoji} {app.role.label} · wants to join {app.teamName} · {shortAge(app.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="h-11 flex-1 cursor-pointer rounded-xl bg-success px-3 text-success-foreground hover:bg-success/90 sm:flex-none"
                      aria-label={`Accept application from ${app.username}`}
                      disabled={busyRequestId === app.id}
                      onClick={() => onAcceptApplication(app.id)}
                    >
                      <Check className="size-4" aria-hidden />
                      Accept
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-11 flex-1 cursor-pointer rounded-xl border-destructive/40 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-none"
                      aria-label={`Decline application from ${app.username}`}
                      disabled={busyRequestId === app.id}
                      onClick={() => onDeclineApplication(app.id)}
                    >
                      <X className="size-4" aria-hidden />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}

              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  id={`inbox-request-${inv.id}`}
                  className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/50 bg-background/40 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-lavender/15">
                      <Mail className="size-4 text-lavender" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{inv.squadName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {inv.targetRole ? `Invitation · ${inv.targetRole}` : "Invitation pending"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="h-11 flex-1 cursor-pointer rounded-xl bg-success px-3 text-success-foreground hover:bg-success/90 sm:flex-none"
                      aria-label={`Accept invitation to ${inv.squadName}`}
                      disabled={busyRequestId === inv.id}
                      onClick={() => onAcceptInvitation(inv)}
                    >
                      <Check className="size-4" aria-hidden />
                      Accept
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-11 flex-1 cursor-pointer rounded-xl border-destructive/40 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-none"
                      aria-label={`Decline invitation to ${inv.squadName}`}
                      disabled={busyRequestId === inv.id}
                      onClick={() => onDeclineInvitation(inv.id)}
                    >
                      <X className="size-4" aria-hidden />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="min-w-0 max-w-full border-border/60 bg-card shadow-sm">
        <CardHeader className="min-w-0 pb-2">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Send className="size-4 shrink-0 text-teal" aria-hidden />
              <h3 className="truncate text-sm font-bold text-foreground">Sent requests</h3>
            </div>
            <Badge className="shrink-0 rounded-full bg-teal/15 px-2 py-0 text-xs font-bold text-teal">
              {sentCount}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="min-w-0 space-y-2">
          {sentCount === 0 ? (
            <EmptyInboxState
              icon={<Send className="size-5" aria-hidden />}
              sentence="You have not sent any requests yet."
              href="/teams"
              cta="Browse squads"
            />
          ) : (
            <>
              {sentApplications.map((request) => {
                const status = sentStatusUi(request.status)
                return (
                  <div key={request.id} className="min-w-0 rounded-xl border border-border/50 bg-background/40 p-3">
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-sm font-semibold text-foreground">{request.teamName}</p>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    {request.target_role ? (
                      <p className="mt-1 truncate text-xs text-muted-foreground">{request.target_role}</p>
                    ) : null}
                    {request.status === "pending" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="mt-2 h-9 w-full cursor-pointer rounded-xl text-xs"
                        disabled={cancellingSentRequestId === request.id}
                        onClick={() => onCancelPendingSentRequest(request.id)}
                      >
                        {cancellingSentRequestId === request.id ? "Cancelling..." : "Cancel request"}
                      </Button>
                    ) : null}
                  </div>
                )
              })}

              {sentInvitations.map((request) => {
                const status = sentStatusUi(request.status)
                return (
                  <div key={request.id} className="min-w-0 rounded-xl border border-border/50 bg-background/40 p-3">
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-sm font-semibold text-foreground">
                        Invitation · {request.inviteeUsername}
                      </p>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">to {request.teamName}</p>
                    {request.status === "pending" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="mt-2 h-9 w-full cursor-pointer rounded-xl text-xs"
                        disabled={cancellingSentRequestId === request.id}
                        onClick={() => onCancelPendingSentRequest(request.id)}
                      >
                        {cancellingSentRequestId === request.id ? "Cancelling..." : "Cancel invite"}
                      </Button>
                    ) : null}
                  </div>
                )
              })}
            </>
          )}
          <div className="mt-2 inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <Clock3 className="size-3 shrink-0" aria-hidden />
            <span className="min-w-0">Status updates stay visible for traceability.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
