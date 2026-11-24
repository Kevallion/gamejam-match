"use client"

import type { ReactNode } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/** Charter DS-1: at most 3 visible badges, then an accessible "+N" overflow. */
export const BADGE_GROUP_MAX = 3

export type BadgeGroupItem = {
  key: string
  node: ReactNode
  label: string
}

type BadgeGroupProps = {
  items: BadgeGroupItem[]
  max?: number
  className?: string
  overflowAriaPrefix?: string
}

export function BadgeGroup({
  items,
  max = BADGE_GROUP_MAX,
  className,
  overflowAriaPrefix = "more",
}: BadgeGroupProps) {
  if (items.length === 0) return null
  const visible = items.slice(0, Math.max(0, max))
  const hidden = items.slice(Math.max(0, max))
  const hiddenLabels = hidden.map((item) => item.label)

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {visible.map((item) => (
        <span key={item.key} className="min-w-0">
          {item.node}
        </span>
      ))}
      {hidden.length > 0 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex h-8 shrink-0 items-center rounded-full bg-muted px-2 text-base font-semibold text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              aria-label={`${hidden.length} ${overflowAriaPrefix}: ${hiddenLabels.join(", ")}`}
            >
              +{hidden.length}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <ul className="flex flex-col gap-0.5 text-left">
              {hiddenLabels.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  )
}
