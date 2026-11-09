"use client"

import { UserAvatar } from "@/components/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TagIcon } from "@/components/tag-icon"
import { ROLE_STYLES } from "@/lib/constants"
import { MessageCircle, Send, UserRoundPlus, CircleX } from "lucide-react"
import { IconTile } from "@/components/ui/app-icon"

export type SentApplicationOutboxItem = {
  id: string
  status: string
  target_role?: string | null
  teamName: string
  discord_link?: string | null
}

export type SentInvitationOutboxItem = {
  id: string
  status: string
  target_role?: string | null
  teamName: string
  inviteeUserId: string
  inviteeUsername: string
  inviteeAvatarUrl: string | null
}

function joinRequestStatusUi(status: string): { label: string; className: string } {
  const s = status.toLowerCase()
  if (s === "pending") {
    return {
      label: "Pending",
      className: "bg-muted px-2 py-1 text-xs font-medium text-muted-foreground",
    }
  }
  if (s === "accepted") {
    return {
      label: "Accepted",
      className: "rounded-lg bg-success/10 px-2 py-1 text-xs font-medium text-success",
    }
  }
  if (s === "rejected" || s === "declined") {
    return {
      label: "Declined",
      className: "rounded-lg bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive",
    }
  }
  return {
    label: status,
    className: "rounded-lg bg-muted px-2 py-1 text-xs font-medium text-muted-foreground",
  }
}

interface DashboardSentOutboxProps {
  sentApplications: SentApplicationOutboxItem[]
  sentInvitations: SentInvitationOutboxItem[]
  cancellingRequestId: string | null
  onCancelPendingRequest: (id: string) => void
}

export function DashboardSentOutbox({
  sentApplications,
  sentInvitations,
  cancellingRequestId,
  onCancelPendingRequest,
}: DashboardSentOutboxProps) {
  const total = sentApplications.length + sentInvitations.length
  const pendingInvites = sentInvitations.filter((i) => i.status === "pending").length

  return (
    <div className="flex flex-col gap-8">
      {/* Applications to teams */}
      <section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-teal/15">
              <Send className="size-5 text-teal" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Applications you sent</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Requests to join other squads
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="rounded-full bg-teal/15 px-3.5 py-1.5 text-sm font-bold text-teal"
          >
            {sentApplications.length}
          </Badge>
        </div>

        {sentApplications.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 rounded-2xl border-border/50 border-dashed bg-card/50 px-6 py-14 text-center">
            <IconTile icon={Send} tone="muted" />
            <div>
              <p className="font-semibold text-foreground">No applications yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse teams and apply when you find a good fit.
              </p>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {sentApplications.map((app) => {
              const roleKey = app.target_role?.trim().toLowerCase() ?? ""
              const roleValue = roleKey ? (ROLE_STYLES[roleKey] ? roleKey : "other") : ""
              const st = joinRequestStatusUi(app.status)
              const canCancelApp = app.status === "pending"
              return (
                <Card
                  key={app.id}
                  className="rounded-2xl border-border/50 bg-card transition-all duration-300 hover:border-teal/25 hover:shadow-md hover:shadow-teal/5"
                >
                  <CardContent className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">{app.teamName}</span>
                      {roleValue ? (
                        <TagIcon kind="role" value={roleValue} size="xs" showLabel withTooltip={false} />
                      ) : null}
                      <span className={st.className}>{st.label}</span>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {app.status === "accepted" && app.discord_link ? (
                        <a
                          href={app.discord_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#5865F2]/90 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#4752C4]"
                        >
                          <MessageCircle className="size-3.5" />
                          Discord
                        </a>
                      ) : null}
                      {canCancelApp ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={cancellingRequestId === app.id}
                          onClick={() => onCancelPendingRequest(app.id)}
                          className="gap-1.5 rounded-xl border-border/60 text-muted-foreground hover:border-destructive/40 hover:text-destructive"
                        >
                          <CircleX className="size-4" />
                          {cancellingRequestId === app.id ? "Cancelling…" : "Cancel"}
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Invitations to players */}
      <section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-lavender/15">
              <UserRoundPlus className="size-5 text-lavender" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Invitations you sent</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Players you invited from Find Members or your dashboard
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="rounded-full bg-lavender/15 px-3.5 py-1.5 text-sm font-bold text-lavender"
          >
            {sentInvitations.length}
            {pendingInvites > 0 ? (
              <span className="ml-1.5 text-xs font-medium text-muted-foreground">
                ({pendingInvites} pending)
              </span>
            ) : null}
          </Badge>
        </div>

        {sentInvitations.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 rounded-2xl border-border/50 border-dashed bg-card/50 px-6 py-14 text-center">
            <IconTile icon={UserRoundPlus} tone="muted" />
            <div>
              <p className="font-semibold text-foreground">No invitations sent</p>
              <p className="mt-1 text-sm text-muted-foreground">
                When you invite jammers to your squad, they will appear here.
              </p>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {sentInvitations.map((inv) => {
              const roleKey = inv.target_role?.trim().toLowerCase() ?? ""
              const roleValue = roleKey ? (ROLE_STYLES[roleKey] ? roleKey : "other") : ""
              const st = joinRequestStatusUi(inv.status)
              const canCancel = inv.status === "pending"
              return (
                <Card
                  key={inv.id}
                  className="rounded-2xl border-border/50 bg-card transition-all duration-300 hover:border-lavender/25 hover:shadow-md hover:shadow-lavender/5"
                >
                  <CardContent className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
                      <UserAvatar
                        src={inv.inviteeAvatarUrl}
                        fallbackName={inv.inviteeUsername}
                        size="md"
                        className="shrink-0 ring-2 ring-lavender/20"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground">Invitation · {inv.inviteeUsername}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          to join{" "}
                          <span className="font-medium text-foreground">{inv.teamName}</span>
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {roleValue ? (
                            <TagIcon kind="role" value={roleValue} size="xs" showLabel withTooltip={false} />
                          ) : null}
                          <span className={st.className}>{st.label}</span>
                        </div>
                      </div>
                    </div>
                    {canCancel ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={cancellingRequestId === inv.id}
                        onClick={() => onCancelPendingRequest(inv.id)}
                        className="shrink-0 gap-1.5 rounded-xl border-border/60 text-muted-foreground hover:border-destructive/40 hover:text-destructive"
                      >
                        <CircleX className="size-4" />
                        {cancellingRequestId === inv.id ? "Cancelling…" : "Cancel"}
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {total === 0 ? null : (
        <p className="text-center text-xs text-muted-foreground">
          Declined or accepted items stay visible so you can see what happened.
        </p>
      )}
    </div>
  )
}
