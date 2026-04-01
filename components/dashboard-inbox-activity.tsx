"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, ChevronRight } from "lucide-react"
import type { NormalizedNotificationFeedItem } from "@/lib/notifications-enriched"
import { inboxNotificationGroupLabel } from "@/lib/notifications-enriched"
import { getNotificationDetailPath } from "@/lib/notification-detail-link"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

function ActivityRow({
  item,
  onChanged,
}: {
  item: NormalizedNotificationFeedItem
  onChanged?: () => void
}) {
  const router = useRouter()
  const sender = item.senderResolved
  const detailHref = getNotificationDetailPath(item)
  const displayName = sender?.username?.trim() || "Jammer"
  const profileUserId = item.actorUserId ?? item.sender_id
  const jammerHref = profileUserId ? `/jammer/${profileUserId}` : null

  const markRead = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", item.id)
    onChanged?.()
  }

  const openDetails = async () => {
    await markRead()
    router.push(detailHref)
  }

  let timeLabel = ""
  try {
    const d = new Date(item.created_at)
    if (!isNaN(d.getTime())) {
      timeLabel = formatDistanceToNow(d, { addSuffix: true })
    }
  } catch {
    /* ignore */
  }

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-border/40 bg-card/60 px-3 py-3 transition-colors hover:border-primary/25",
        !item.is_read && "border-teal/20 bg-teal/[0.03]",
      )}
    >
      <div className="shrink-0 pt-0.5">
        <UserAvatar
          src={sender?.avatar_url ?? null}
          fallbackName={displayName}
          size="md"
          className="!size-10 border border-border/50"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {jammerHref ? (
            <Link
              href={jammerHref}
              className="text-sm font-semibold text-foreground hover:text-primary"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={() => void markRead()}
            >
              {displayName}
            </Link>
          ) : (
            <span className="text-sm font-semibold text-muted-foreground">{displayName}</span>
          )}
          <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-semibold uppercase">
            {item.type.replace(/_/g, " ")}
          </Badge>
          {timeLabel ? (
            <span className="text-[11px] text-muted-foreground">{timeLabel}</span>
          ) : null}
        </div>
        <p className="text-sm leading-snug text-foreground">{item.message}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 rounded-lg text-xs font-semibold"
            onClick={() => void openDetails()}
          >
            View details
            <ChevronRight className="ml-1 size-3.5 opacity-70" aria-hidden />
          </Button>
          {item.team_id ? (
            <Button type="button" size="sm" variant="outline" className="h-8 rounded-lg text-xs font-semibold" asChild>
              <Link href={`/teams/${item.team_id}`} onPointerDown={() => void markRead()}>
                Team page
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function DashboardInboxActivity({
  items,
  onActivityChanged,
}: {
  items: NormalizedNotificationFeedItem[]
  onActivityChanged?: () => void
}) {
  const grouped = new Map<string, NormalizedNotificationFeedItem[]>()
  for (const item of items) {
    const key = inboxNotificationGroupLabel(item.type)
    const list = grouped.get(key) ?? []
    list.push(item)
    grouped.set(key, list)
  }
  const orderedKeys = [...grouped.keys()]

  if (items.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-peach/15">
          <Bell className="size-5 text-peach" aria-hidden />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Notification activity</h2>
          <p className="text-sm text-muted-foreground">Grouped by topic — links open the right place.</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {orderedKeys.map((groupName) => (
          <div key={groupName} className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{groupName}</h3>
            <Card className="rounded-2xl border-border/50 bg-card/40">
              <CardContent className="flex flex-col gap-2 p-4">
                {(grouped.get(groupName) ?? []).map((item) => (
                  <ActivityRow key={item.id} item={item} onChanged={onActivityChanged} />
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  )
}
