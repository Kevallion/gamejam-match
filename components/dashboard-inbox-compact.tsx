"use client"

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
  return { label: "Pending", className: "border-border/50 bg-muted/40 text-muted-foreground" }
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
}) {
  const incomingCount = applications.length + invitations.length
  const sentCount = sentApplications.length + sentInvitations.length

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Card className="border-border/40 bg-card/70 shadow-sm backdrop-blur-sm lg:col-span-8">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Inbox className="size-4 text-peach" />
              <h3 className="text-sm font-bold text-foreground">Incoming actions</h3>
            </div>
            <Badge className="rounded-full bg-peach/15 px-2 py-0 text-[10px] font-bold text-peach">
              {incomingCount}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {incomingCount === 0 ? (
            <p className="text-xs text-muted-foreground">No pending requests.</p>
          ) : (
            <>
              {applications.map((app) => (
                <div
                  key={app.id}
                  id={`inbox-request-${app.id}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/40 bg-background/40 p-2.5"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <UserAvatar src={app.avatar_url} fallbackName={app.username} size="xs" className="size-7" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {app.username} &rarr; {app.teamName}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {app.role.emoji} {app.role.label} · {shortAge(app.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 cursor-pointer rounded-md bg-success px-2 text-[11px] text-success-foreground hover:bg-success/90"
                      onClick={() => onAcceptApplication(app.id)}
                    >
                      <Check className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 cursor-pointer rounded-md border-destructive/40 px-2 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDeclineApplication(app.id)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  id={`inbox-request-${inv.id}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/40 bg-background/40 p-2.5"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-lavender/15">
                      <Mail className="size-3.5 text-lavender" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {inv.squadName}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {inv.targetRole ? `Role: ${inv.targetRole}` : "Invitation pending"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 cursor-pointer rounded-md bg-success px-2 text-[11px] text-success-foreground hover:bg-success/90"
                      onClick={() => onAcceptInvitation(inv)}
                    >
                      <Check className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 cursor-pointer rounded-md border-destructive/40 px-2 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDeclineInvitation(inv.id)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/70 shadow-sm backdrop-blur-sm lg:col-span-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Send className="size-4 text-teal" />
              <h3 className="text-sm font-bold text-foreground">Sent requests</h3>
            </div>
            <Badge className="rounded-full bg-teal/15 px-2 py-0 text-[10px] font-bold text-teal">
              {sentCount}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {sentCount === 0 ? (
            <p className="text-xs text-muted-foreground">No sent requests yet.</p>
          ) : (
            <>
              {sentApplications.map((request) => {
                const status = sentStatusUi(request.status)
                return (
                  <div key={request.id} className="rounded-lg border border-border/40 bg-background/40 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-foreground">{request.teamName}</p>
                      <span className={`rounded-full border px-1.5 py-0 text-[10px] font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    {request.status === "pending" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="mt-2 h-6 w-full cursor-pointer rounded-md text-[10px]"
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
                  <div key={request.id} className="rounded-lg border border-border/40 bg-background/40 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {request.inviteeUsername}
                      </p>
                      <span className={`rounded-full border px-1.5 py-0 text-[10px] font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground">to {request.teamName}</p>
                    {request.status === "pending" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="mt-2 h-6 w-full cursor-pointer rounded-md text-[10px]"
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
          <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock3 className="size-3" />
            Status updates stay visible for traceability.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
