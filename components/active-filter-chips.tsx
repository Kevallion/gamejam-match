"use client"

import { X } from "lucide-react"

export type ActiveFilterChip = {
  id: string
  label: string
}

export function ActiveFilterChips({
  chips,
  onRemove,
}: {
  chips: ActiveFilterChip[]
  onRemove: (id: string) => void
}) {
  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onRemove(chip.id)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:border-primary/40"
        >
          {chip.label}
          <X className="size-3 text-muted-foreground" aria-hidden />
          <span className="sr-only">Remove {chip.label}</span>
        </button>
      ))}
    </div>
  )
}
