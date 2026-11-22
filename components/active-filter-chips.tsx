"use client"

import { X } from "lucide-react"
import { FilterChip } from "@/components/ui/filter-chip"

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
        <FilterChip
          key={chip.id}
          pressed
          onClick={() => onRemove(chip.id)}
          aria-label={`Remove ${chip.label}`}
        >
          {chip.label}
          <X className="size-3 opacity-80" aria-hidden />
        </FilterChip>
      ))}
    </div>
  )
}
