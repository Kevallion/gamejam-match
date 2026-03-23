"use client"

import { useMemo, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SlidersHorizontal, RotateCcw, X, Check, ChevronDown } from "lucide-react"
import { ENGINE_OPTIONS, EXPERIENCE_OPTIONS, JAM_STYLE_OPTIONS, LANGUAGE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

interface FiltersProps {
  engine?: string
  role?: string
  level?: string
  language?: string
  style?: string
  compact?: boolean
  hasActiveFilters?: boolean
  resultsCount?: number
  onEngineChange: (val: string) => void
  onRoleChange: (val: string) => void
  onLevelChange: (val: string) => void
  onLanguageChange: (val: string) => void
  onStyleChange?: (val: string) => void
  onReset?: () => void
}

function FilterBadge({ 
  label, 
  value, 
  onRemove 
}: { 
  label: string
  value: string
  onRemove: () => void 
}) {
  return (
    <Badge 
      variant="secondary" 
      className="gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-primary hover:bg-primary/20"
    >
      <span className="text-xs font-medium">{label}: {value}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"
        aria-label={`Remove ${label} filter`}
      >
        <X className="size-3" />
      </button>
    </Badge>
  )
}

export function Filters({
  engine = "all",
  role = "all",
  level = "all",
  language = "all",
  style = "all",
  compact = false,
  hasActiveFilters = false,
  resultsCount,
  onEngineChange,
  onRoleChange,
  onLevelChange,
  onLanguageChange,
  onStyleChange,
  onReset,
}: FiltersProps) {
  const isMobile = useIsMobile()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const activeCount = useMemo(() => {
    let count = 0
    if (engine !== "all") count++
    if (role !== "all") count++
    if (level !== "all") count++
    if (language !== "all") count++
    if (style !== "all") count++
    return count
  }, [engine, role, level, language, style])

  const activeFilters = useMemo(() => {
    const filters: { key: string; label: string; value: string; onRemove: () => void }[] = []
    if (engine !== "all") {
      const opt = ENGINE_OPTIONS.find(o => o.value === engine)
      filters.push({ key: "engine", label: "Engine", value: opt?.label || engine, onRemove: () => onEngineChange("all") })
    }
    if (role !== "all") {
      const opt = ROLE_OPTIONS.find(o => o.value === role)
      filters.push({ key: "role", label: "Role", value: opt?.label || role, onRemove: () => onRoleChange("all") })
    }
    if (level !== "all") {
      const opt = EXPERIENCE_OPTIONS.find(o => o.value === level)
      filters.push({ key: "level", label: "Level", value: opt?.label || level, onRemove: () => onLevelChange("all") })
    }
    if (language !== "all") {
      const opt = LANGUAGE_OPTIONS.find(o => o.value === language)
      filters.push({ key: "language", label: "Language", value: opt?.label || language, onRemove: () => onLanguageChange("all") })
    }
    if (style !== "all" && onStyleChange) {
      const opt = JAM_STYLE_OPTIONS.find(o => o.value === style)
      filters.push({ key: "style", label: "Style", value: opt?.label || style, onRemove: () => onStyleChange("all") })
    }
    return filters
  }, [engine, role, level, language, style, onEngineChange, onRoleChange, onLevelChange, onLanguageChange, onStyleChange])

  const resultsLabel =
    typeof resultsCount === "number"
      ? `${resultsCount} result${resultsCount === 1 ? "" : "s"}`
      : undefined

  if (isMobile) {
    return (
      <section className={compact ? "py-0" : "px-4 py-4 lg:px-6"}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <SlidersHorizontal className="size-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Filter teams
              </span>
            </div>
            {resultsLabel && (
              <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">
                {resultsLabel}
              </Badge>
            )}
          </div>

          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "card-interactive flex h-14 w-full items-center justify-between gap-2 rounded-2xl border-border/60 bg-card px-4 text-sm transition-all",
                  activeCount > 0 && "border-primary/30 bg-primary/5"
                )}
              >
                <span className="flex items-center gap-3">
                  <SlidersHorizontal className={cn(
                    "size-5",
                    activeCount > 0 ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="font-semibold text-foreground">
                    Filters
                  </span>
                  {activeCount > 0 && (
                    <Badge className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                      {activeCount}
                    </Badge>
                  )}
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="rounded-t-3xl border-border/60 bg-card">
              <DrawerHeader className="border-b border-border/40 pb-4 text-left">
                <div className="flex items-center justify-between">
                  <DrawerTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <SlidersHorizontal className="size-5 text-primary" />
                    Filters
                  </DrawerTitle>
                  {activeCount > 0 && (
                    <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs">
                      {activeCount} active
                    </Badge>
                  )}
                </div>
              </DrawerHeader>
              <div className="max-h-[60vh] overflow-y-auto px-4 pb-4 pt-4">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Engine</label>
                    <Select onValueChange={onEngineChange} value={engine}>
                      <SelectTrigger className={cn(
                        "h-12 w-full rounded-xl border-border/60 bg-secondary/50 transition-all",
                        engine !== "all" && "border-primary/40 bg-primary/5"
                      )}>
                        <SelectValue placeholder="Any Engine" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all">Any Engine</SelectItem>
                        {ENGINE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center gap-2">
                              {engine === opt.value && <Check className="size-4 text-primary" />}
                              {opt.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Role Needed</label>
                    <Select onValueChange={onRoleChange} value={role}>
                      <SelectTrigger className={cn(
                        "h-12 w-full rounded-xl border-border/60 bg-secondary/50 transition-all",
                        role !== "all" && "border-primary/40 bg-primary/5"
                      )}>
                        <SelectValue placeholder="Any Role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all">Any Role</SelectItem>
                        {ROLE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center gap-2">
                              {role === opt.value && <Check className="size-4 text-primary" />}
                              {opt.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Experience</label>
                    <Select onValueChange={onLevelChange} value={level}>
                      <SelectTrigger className={cn(
                        "h-12 w-full rounded-xl border-border/60 bg-secondary/50 transition-all",
                        level !== "all" && "border-primary/40 bg-primary/5"
                      )}>
                        <SelectValue placeholder="Any Experience" />
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
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Language</label>
                    <Select onValueChange={onLanguageChange} value={language}>
                      <SelectTrigger className={cn(
                        "h-12 w-full rounded-xl border-border/60 bg-secondary/50 transition-all",
                        language !== "all" && "border-primary/40 bg-primary/5"
                      )}>
                        <SelectValue placeholder="Any Language" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all">Any Language</SelectItem>
                        {LANGUAGE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center gap-2">
                              {language === opt.value && <Check className="size-4 text-primary" />}
                              {opt.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {onStyleChange && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Jam Style</label>
                      <Select onValueChange={onStyleChange} value={style}>
                        <SelectTrigger className={cn(
                          "h-12 w-full rounded-xl border-border/60 bg-secondary/50 transition-all",
                          style !== "all" && "border-primary/40 bg-primary/5"
                        )}>
                          <SelectValue placeholder="Any Style" />
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
                    </div>
                  )}
                </div>
              </div>

              <DrawerFooter className="flex flex-row gap-3 border-t border-border/40 px-4 pb-6 pt-4">
                {onReset && activeCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onReset()
                    }}
                    className="flex-1 gap-2 rounded-xl"
                  >
                    <RotateCcw className="size-4" />
                    Reset all
                  </Button>
                )}
                <DrawerClose asChild>
                  <Button className="flex-1 gap-2 rounded-xl font-semibold">
                    <Check className="size-4" />
                    Show {resultsLabel ?? "results"}
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* Active filter badges - shown below the button */}
          {activeFilters.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <FilterBadge
                  key={filter.key}
                  label={filter.label}
                  value={filter.value}
                  onRemove={filter.onRemove}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className={compact ? "py-0" : "px-4 py-6 lg:px-6"}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <SlidersHorizontal className="size-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              Filter teams
            </span>
            {activeCount > 0 && (
              <Badge className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                {activeCount} active
              </Badge>
            )}
          </div>
          {resultsLabel && (
            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">
              {resultsLabel}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          
          <Select onValueChange={onEngineChange} value={engine}>
            <SelectTrigger className={cn(
              "h-11 w-full rounded-xl border-border/60 bg-card transition-all sm:w-[160px]",
              engine !== "all" && "border-primary/40 bg-primary/5 text-primary"
            )}>
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
            <SelectTrigger className={cn(
              "h-11 w-full rounded-xl border-border/60 bg-card transition-all sm:w-[180px]",
              role !== "all" && "border-primary/40 bg-primary/5 text-primary"
            )}>
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
            <SelectTrigger className={cn(
              "h-11 w-full rounded-xl border-border/60 bg-card transition-all sm:w-[180px]",
              level !== "all" && "border-primary/40 bg-primary/5 text-primary"
            )}>
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
            <SelectTrigger className={cn(
              "h-11 w-full rounded-xl border-border/60 bg-card transition-all sm:w-[160px]",
              language !== "all" && "border-primary/40 bg-primary/5 text-primary"
            )}>
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
              <SelectTrigger className={cn(
                "h-11 w-full rounded-xl border-border/60 bg-card transition-all sm:w-[180px]",
                style !== "all" && "border-primary/40 bg-primary/5 text-primary"
              )}>
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

          {hasActiveFilters && onReset && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onReset} 
              className="gap-2 rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <RotateCcw className="size-4" />
              Reset
            </Button>
          )}
        </div>

        {/* Active filter badges - shown below the filters */}
        {activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <FilterBadge
                key={filter.key}
                label={filter.label}
                value={filter.value}
                onRemove={filter.onRemove}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
