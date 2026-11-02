import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { JamListingStatus } from "@/lib/jam-calendar-status"

export function JamStatusBadge({
  status,
  className,
  title,
}: {
  status: JamListingStatus
  className?: string
  title?: string
}) {
  return (
    <Badge
      variant="outline"
      title={title}
      className={cn(
        "w-fit gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        status.badgeClassName,
        className,
      )}
    >
      {status.phase === "live" ? (
        <span className="relative inline-flex size-2 shrink-0" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-destructive" />
        </span>
      ) : null}
      {status.label}
    </Badge>
  )
}
