import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { AppIcon } from "@/components/ui/app-icon"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type BentoCardTone =
  | "default"
  | "hero"
  | "live"
  | "mint"
  | "peach"
  | "lavender"
  | "pink"
  | "teal"
  | "match"

const TONE_CLASS: Record<BentoCardTone, string> = {
  default: "bg-card text-card-foreground",
  hero: "bg-lavender text-lavender-foreground",
  live: "bg-pink text-pink-foreground",
  mint: "bg-mint text-mint-foreground",
  peach: "bg-peach text-peach-foreground",
  lavender: "bg-lavender text-lavender-foreground",
  pink: "bg-pink text-pink-foreground",
  teal: "bg-teal text-teal-foreground",
  match: "bg-teal text-teal-foreground",
}

type BentoCardProps = {
  title?: string
  icon?: LucideIcon
  iconTone?: "teal" | "lavender" | "peach" | "pink" | "mint" | "muted" | "primary"
  action?: ReactNode
  tone?: BentoCardTone
  neo?: boolean
  className?: string
  children?: ReactNode
  emptyLabel?: string
  /** When true, show a clean empty/skeleton placeholder body. */
  placeholder?: boolean
  skeletonLines?: number
}

/**
 * Shared Bento tile — solid pastel tone variants (charter tokens), 1px border-border,
 * rounded-2xl, softened 3px offset shadow (charter value), empty state.
 */
export function BentoCard({
  title,
  icon,
  iconTone = "teal",
  action,
  tone = "default",
  neo = true,
  className,
  children,
  emptyLabel = "Nothing here yet",
  placeholder = false,
  skeletonLines = 3,
}: BentoCardProps) {
  return (
    <article
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-2xl p-4 md:p-6",
        neo && "border border-border shadow-[3px_3px_0_0_var(--neo-shadow)]",
        TONE_CLASS[tone],
        className,
      )}
    >
      {title ? (
        <header className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
            {icon ? (
              <AppIcon
                icon={icon}
                size="md"
                tone={tone === "default" || tone === "hero" ? iconTone : undefined}
              />
            ) : null}
            {title}
          </h2>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}

      {placeholder ? (
        <div className="flex flex-1 flex-col gap-2.5" aria-busy="true">
          {Array.from({ length: skeletonLines }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                "h-3 rounded-full bg-foreground/10",
                i === skeletonLines - 1 ? "w-2/3" : "w-full",
                tone !== "default" && tone !== "hero" && "opacity-40",
              )}
            />
          ))}
          <p className="mt-auto pt-2 text-sm font-bold opacity-70">{emptyLabel}</p>
        </div>
      ) : (
        children
      )}
    </article>
  )
}
