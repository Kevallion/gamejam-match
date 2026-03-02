"use client"

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { SlidersHorizontal } from "lucide-react"
import { ENGINE_OPTIONS, EXPERIENCE_OPTIONS, JAM_STYLE_OPTIONS, LANGUAGE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"

interface FiltersProps {
  engine?: string
  role?: string
  level?: string
  language?: string
  style?: string
  compact?: boolean
  onEngineChange: (val: string) => void
  onRoleChange: (val: string) => void
  onLevelChange: (val: string) => void
  onLanguageChange: (val: string) => void
  onStyleChange?: (val: string) => void
}

export function Filters({
  engine = "all",
  role = "all",
  level = "all",
  language = "all",
  style = "all",
  compact = false,
  onEngineChange,
  onRoleChange,
  onLevelChange,
  onLanguageChange,
  onStyleChange,
}: FiltersProps) {
  return (
    <section className={compact ? "py-0" : "px-4 py-6 lg:px-6"}>
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 mb-4">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Filter teams
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          
          <Select onValueChange={onEngineChange} value={engine}>
            <SelectTrigger className="w-[160px] rounded-xl border-border/60 bg-card">
              <SelectValue placeholder="Engine" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Any Engine</SelectItem>
              {ENGINE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={onRoleChange} value={role}>
            <SelectTrigger className="w-[180px] rounded-xl border-border/60 bg-card">
              <SelectValue placeholder="Role Needed" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Any Role</SelectItem>
              {ROLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={onLevelChange} value={level}>
            <SelectTrigger className="w-[180px] rounded-xl border-border/60 bg-card">
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

          <Select onValueChange={onLanguageChange} value={language}>
            <SelectTrigger className="w-[160px] rounded-xl border-border/60 bg-card">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Any Language</SelectItem>
              {LANGUAGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {onStyleChange && (
            <Select onValueChange={onStyleChange} value={style}>
              <SelectTrigger className="w-[180px] rounded-xl border-border/60 bg-card">
                <SelectValue placeholder="Jam Style" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Any Style</SelectItem>
                {JAM_STYLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className={`inline-flex items-center gap-2 rounded px-1.5 py-0.5 ${opt.color ?? "bg-muted text-muted-foreground"}`}>
                      {opt.emoji} {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

        </div>
      </div>
    </section>
  )
}