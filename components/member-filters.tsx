"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SlidersHorizontal } from "lucide-react"
import { ENGINE_OPTIONS, EXPERIENCE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"

interface MemberFiltersProps {
  onRoleChange: (val: string) => void
  onEngineChange: (val: string) => void
  onLevelChange: (val: string) => void
}

export function MemberFilters({ onRoleChange, onEngineChange, onLevelChange }: MemberFiltersProps) {
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
          
          <Select onValueChange={onRoleChange} defaultValue="all">
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

          <Select onValueChange={onEngineChange} defaultValue="all">
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

          <Select onValueChange={onLevelChange} defaultValue="all">
            <SelectTrigger className="w-[190px] rounded-xl border-border/60 bg-card text-card-foreground transition-colors hover:border-lavender/40">
              <SelectValue placeholder="Experience" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Any Experience</SelectItem>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>
      </div>
    </section>
  )
}