"use client"

import { cn } from "@/lib/utils"

export type SectionAnchorItem = {
  id: string
  label: string
}

type SectionAnchorNavProps = {
  items: SectionAnchorItem[]
  activeId: string
  className?: string
}

export function SectionAnchorNav({ items, activeId, className }: SectionAnchorNavProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <nav
      aria-label="Section navigation"
      className={cn(
        "sticky top-[68px] z-20 flex gap-1 overflow-x-auto rounded-2xl border border-border/40 bg-card/85 p-1 shadow-sm backdrop-blur-md scrollbar-none md:top-[76px]",
        className,
      )}
    >
      {items.map((item) => {
        const active = activeId === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollTo(item.id)}
            className={cn(
              "shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
              active
                ? "bg-teal/15 text-teal shadow-sm"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
