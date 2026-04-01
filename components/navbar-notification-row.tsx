"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/user-avatar"
import type { NormalizedNotificationRow } from "@/hooks/use-notifications"
import { getNotificationDetailPath } from "@/lib/notification-detail-link"
import { cn } from "@/lib/utils"

export function NavbarNotificationRow({
  notification: n,
  onMarkRead,
  compact,
}: {
  notification: NormalizedNotificationRow
  onMarkRead: (id: string) => void
  compact?: boolean
}) {
  const router = useRouter()
  const sender = n.senderResolved
  const team = n.teamResolved
  const jamTitle = team?.external_jams?.title ?? null

  const detailHref = getNotificationDetailPath(n)
  const profileUserId = n.actorUserId ?? n.sender_id
  const jammerHref = profileUserId ? `/jammer/${profileUserId}` : null
  const displayName = (sender?.username?.trim() || "Jammer").trim()
  const showMutedName = !jammerHref && displayName === "Jammer"

  /** Navigation explicite : évite les `Link` dans le Dropdown Radix qui annulent la navigation. */
  const go = (href: string) => {
    onMarkRead(n.id)
    router.push(href)
  }

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-transparent px-2 py-2.5 text-left transition-colors hover:bg-accent/60",
        compact ? "py-2" : "py-2.5",
      )}
    >
      <button
        type="button"
        className="mt-0.5 shrink-0 rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        onClick={() => {
          if (jammerHref) go(jammerHref)
        }}
        disabled={!jammerHref}
        aria-label={jammerHref ? `Open profile of ${displayName}` : "No profile link"}
      >
        <UserAvatar
          src={sender?.avatar_url ?? null}
          fallbackName={displayName}
          size="md"
          className="!size-9 border border-border/50"
        />
      </button>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {jammerHref ? (
            <button
              type="button"
              onClick={() => go(jammerHref)}
              className="text-sm font-semibold text-foreground hover:text-primary hover:underline"
            >
              {displayName}
            </button>
          ) : (
            <span
              className={cn(
                "text-sm font-semibold",
                showMutedName ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {displayName}
            </span>
          )}
          <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-semibold uppercase tracking-wide">
            {n.type.replace(/_/g, " ")}
          </Badge>
        </div>

        <p className="text-sm leading-snug text-foreground line-clamp-2">{n.message}</p>

        {(team?.team_name || team?.game_name || jamTitle) && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {[team?.team_name, team?.game_name, jamTitle].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <Button
            type="button"
            size="sm"
            className="h-8 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"
            onClick={() => go(detailHref)}
          >
            View details
          </Button>
        </div>
      </div>
    </div>
  )
}
