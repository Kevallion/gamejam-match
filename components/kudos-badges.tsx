import { cn } from "@/lib/utils"
import {
  KUDOS_CATEGORY_ORDER,
  KUDOS_CATEGORY_UI,
  type KudosCategoryDb,
  type KudosCounts,
} from "@/lib/kudos"

export function KudosBadgeRow({
  counts,
  className,
  size = "sm",
}: {
  counts: KudosCounts | null | undefined
  className?: string
  size?: "sm" | "xs"
}) {
  if (!counts) return null
  const items: { cat: KudosCategoryDb; n: number }[] = []
  for (const cat of KUDOS_CATEGORY_ORDER) {
    const n = counts[cat]
    if (typeof n === "number" && n > 0) items.push({ cat, n })
  }
  if (items.length === 0) return null

  const textSize = size === "xs" ? "text-[10px]" : "text-xs"
  const pad = size === "xs" ? "px-1.5 py-0.5" : "px-2 py-0.5"

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)} aria-label="Kudos received">
      {items.map(({ cat, n }) => {
        const ui = KUDOS_CATEGORY_UI[cat]
        return (
          <span
            key={cat}
            title={`${ui.label}: ${n}`}
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full border border-border/50 bg-muted/40 font-semibold tabular-nums text-muted-foreground",
              pad,
              textSize,
            )}
          >
            <span aria-hidden>{ui.emoji}</span>
            <span>{n}</span>
          </span>
        )
      })}
    </div>
  )
}
