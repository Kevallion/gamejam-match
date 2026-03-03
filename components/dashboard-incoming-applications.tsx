"use client"

import { useState, useEffect } from "react"
import { UserAvatar } from "@/components/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Check,
  X,
  Inbox,
  MessageSquareText,
  Users,
  Clock,
  Sparkles,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export type ApplicationData = {
  id: string
  username: string
  avatarUrl: string
  teamName: string
  role: { label: string; emoji: string; color: string }
  motivation: string
  createdAt?: string
}

function RelativeTime({ date }: { date: string }) {
  const getLabel = () => {
    try {
      const d = new Date(date)
      if (isNaN(d.getTime())) return "Just now"
      const diffMs = Date.now() - d.getTime()
      if (diffMs < 60_000) return "Just now"
      return formatDistanceToNow(d, { addSuffix: true })
    } catch {
      return "Just now"
    }
  }
  const [label, setLabel] = useState(getLabel)

  useEffect(() => {
    const update = () => setLabel(getLabel())
    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [date])

  return <>{label}</>
}

interface DashboardIncomingApplicationsProps {
  applications: ApplicationData[]
  onAccept: (id: string) => void
  onDecline: (id: string) => void
}

export function DashboardIncomingApplications({
  applications,
  onAccept,
  onDecline,
}: DashboardIncomingApplicationsProps) {
  return (
    <section>
      {/* Section header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-mint/15">
            <Inbox className="size-5 text-mint" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">
              Incoming Applications
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Players who want to join your teams
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="rounded-full bg-mint/15 px-3.5 py-1.5 text-sm font-bold text-mint"
        >
          <Sparkles className="mr-1.5 size-3.5" />
          {applications.length} pending
        </Badge>
      </div>

      {applications.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 rounded-2xl border-border/50 border-dashed bg-card/50 px-6 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-secondary/80">
            <Inbox className="size-7 text-muted-foreground/60" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              No pending applications
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Share your teams to attract jammers!
            </p>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {applications.map((app) => (
            <Card
              key={app.id}
              className="group relative overflow-hidden rounded-2xl border-border/50 bg-card transition-all duration-300 hover:border-mint/30 hover:shadow-lg hover:shadow-mint/5"
            >
              {/* Subtle top accent line */}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-mint/60 via-teal/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <CardContent className="flex flex-col gap-5 px-6 py-5 sm:px-8 sm:py-6">
                {/* Top row: avatar + user info */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <UserAvatar
                      user={{ username: app.username, avatar_url: app.avatarUrl || null }}
                      size="md"
                      className="shrink-0 ring-2 ring-mint/20 transition-all duration-300 group-hover:ring-mint/40"
                    />
                    {/* Online-style dot */}
                    <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-card bg-mint" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">
                        {app.username}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${app.role.color}`}
                      >
                        {app.role.emoji} {app.role.label}
                      </Badge>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="size-3.5 text-teal" />
                        Applying as{" "}
                        <span className="font-semibold text-foreground">
                          {app.role.emoji} {app.role.label}
                        </span>
                        {" "}to{" "}
                        <span className="font-semibold text-foreground">
                          {app.teamName}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/70">
                        <Clock className="size-3" />
                        {app.createdAt ? (
                          <RelativeTime date={app.createdAt} />
                        ) : (
                          "Just now"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Motivation box with left accent border */}
                <div className="relative overflow-hidden rounded-xl bg-secondary/50">
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-mint/60 to-lavender/40" />
                  <div className="px-5 py-4">
                    <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                      <MessageSquareText className="size-3" />
                      Motivation
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/80">
                      {app.motivation}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 pt-0.5">
                  <Button
                    onClick={() => onAccept(app.id)}
                    className="gap-2 rounded-xl bg-green-600 px-5 text-white shadow-md shadow-green-500/20 transition-all hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/30"
                  >
                    <Check className="size-4" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onDecline(app.id)}
                    className="gap-2 rounded-xl border-red-500/50 px-5 text-red-600 transition-all hover:border-red-500 hover:bg-red-500/10 hover:text-red-700"
                  >
                    <X className="size-4" />
                    Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
