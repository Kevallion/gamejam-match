"use client"

import { DashboardIncomingApplications, type ApplicationData } from "@/components/dashboard-incoming-applications"
import { DashboardSquadInvitations, type InvitationData } from "@/components/dashboard-squad-invitations"
import {
  DashboardSentOutbox,
  type SentApplicationOutboxItem,
  type SentInvitationOutboxItem,
} from "@/components/dashboard-sent-outbox"
import { DashboardInboxActivity } from "@/components/dashboard-inbox-activity"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Inbox, Send } from "lucide-react"
import type { NormalizedNotificationFeedItem } from "@/lib/notifications-enriched"

interface DashboardInboxHubProps {
  applications: ApplicationData[]
  invitations: InvitationData[]
  sentApplications: SentApplicationOutboxItem[]
  sentInvitations: SentInvitationOutboxItem[]
  activityNotifications: NormalizedNotificationFeedItem[]
  onInboxActivityChanged?: () => void
  cancellingSentRequestId: string | null
  onAcceptApplication: (id: string) => void
  onDeclineApplication: (id: string) => void
  onAcceptInvitation: (invitation: InvitationData) => void
  onDeclineInvitation: (id: string) => void
  onCancelPendingSentRequest: (id: string) => void
}

export function DashboardInboxHub({
  applications,
  invitations,
  sentApplications,
  sentInvitations,
  activityNotifications,
  onInboxActivityChanged,
  cancellingSentRequestId,
  onAcceptApplication,
  onDeclineApplication,
  onAcceptInvitation,
  onDeclineInvitation,
  onCancelPendingSentRequest,
}: DashboardInboxHubProps) {
  const incomingCount = applications.length + invitations.length
  const sentCount = sentApplications.length + sentInvitations.length
  const sentPending =
    sentApplications.filter((a) => a.status === "pending").length +
    sentInvitations.filter((i) => i.status === "pending").length

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="incoming" className="w-full">
        <TabsList className="glass mb-2 flex h-auto w-full flex-col gap-2 rounded-xl p-1.5 sm:mb-4 sm:w-fit sm:flex-row sm:items-center">
          <TabsTrigger
            value="incoming"
            className={cn(
              "gap-2 rounded-lg border border-transparent px-4 py-2.5 text-sm font-semibold data-[state=active]:shadow-sm",
              "data-[state=active]:border-mint/30 data-[state=active]:bg-background/80 data-[state=active]:text-mint",
            )}
          >
            <Inbox className="size-4 shrink-0" aria-hidden />
            <span>Incoming</span>
            {incomingCount > 0 ? (
              <Badge className="rounded-full bg-mint/20 px-2 py-0 text-xs font-bold text-mint">
                {incomingCount}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger
            value="sent"
            className={cn(
              "gap-2 rounded-lg border border-transparent px-4 py-2.5 text-sm font-semibold data-[state=active]:shadow-sm",
              "data-[state=active]:border-teal/30 data-[state=active]:bg-background/80 data-[state=active]:text-teal",
            )}
          >
            <Send className="size-4 shrink-0" aria-hidden />
            <span>Sent</span>
            {sentCount > 0 ? (
              <Badge className="rounded-full bg-teal/15 px-2 py-0 text-xs font-bold text-teal">
                {sentCount}
                {sentPending > 0 ? (
                  <span className="ml-1 font-normal text-muted-foreground">({sentPending} waiting)</span>
                ) : null}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="mt-0 flex flex-col gap-8 focus-visible:outline-none">
          <p className="text-sm text-muted-foreground">
            Applications to your squads and invitations from other captains — everything that needs your response.
          </p>
          <div className="space-y-10">
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wide text-mint">Join requests — applications</h3>
              <DashboardIncomingApplications
                applications={applications}
                onAccept={onAcceptApplication}
                onDecline={onDeclineApplication}
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wide text-lavender">Join requests — invitations</h3>
              <DashboardSquadInvitations
                invitations={invitations}
                onAccept={onAcceptInvitation}
                onDecline={onDeclineInvitation}
              />
            </div>
          </div>
          <DashboardInboxActivity items={activityNotifications} onActivityChanged={onInboxActivityChanged} />
        </TabsContent>

        <TabsContent value="sent" className="mt-0 focus-visible:outline-none">
          <DashboardSentOutbox
            sentApplications={sentApplications}
            sentInvitations={sentInvitations}
            cancellingRequestId={cancellingSentRequestId}
            onCancelPendingRequest={onCancelPendingSentRequest}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
