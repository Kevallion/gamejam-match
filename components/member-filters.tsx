"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, RotateCcw } from "lucide-react"
import { ENGINE_OPTIONS, EXPERIENCE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"

interface MemberFiltersProps {
  role?: string
  engine?: string
  level?: string
  hasActiveFilters?: boolean
  onRoleChange: (val: string) => void
  onEngineChange: (val: string) => void
  onLevelChange: (val: string) => void
  onReset?: () => void
}

export function MemberFilters({
  role = "all",
  engine = "all",
  level = "all",
  hasActiveFilters = false,
  onRoleChange,
  onEngineChange,
  onLevelChange,
  onReset,
}: MemberFiltersProps) {
  return (
    <section className="px-4 py-6 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center gap-3">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Filter members
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          
          <Select onValueChange={onRoleChange} value={role}>
            <SelectTrigger className="w-[170px] rounded-xl border-border/60 bg-card text-card-foreground transition-colors hover:border-lavender/40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Any Role</SelectItem>
              {ROLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={onEngineChange} value={engine}>
            <SelectTrigger className="w-[170px] rounded-xl border-border/60 bg-card text-card-foreground transition-colors hover:border-lavender/40">
              <SelectValue placeholder="Engine" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Any Engine</SelectItem>
              {ENGINE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={onLevelChange} value={level}>
            <SelectTrigger className="w-[190px] rounded-xl border-border/60 bg-card text-card-foreground transition-colors hover:border-lavender/40">
              <SelectValue placeholder="Experience" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Any Experience</SelectItem>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className={`inline-flex items-center gap-2 rounded px-1.5 py-0.5 ${opt.color ?? "bg-muted text-muted-foreground"}`}>
                    {opt.emoji} {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && onReset && (
            <Button variant="ghost" size="sm" onClick={onReset} className="gap-2 rounded-xl text-muted-foreground hover:text-foreground">
              <RotateCcw className="size-4" />
              Reset Filters
            </Button>
          )}

        </div>
      </div>
    </section>
  )
}