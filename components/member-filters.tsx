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
import { SlidersHorizontal, RotateCcw, X, Check, ChevronDown, Users } from "lucide-react"
import { ENGINE_OPTIONS, EXPERIENCE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"
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

interface MemberFiltersProps {
  role?: string
  engine?: string
  level?: string
  hasActiveFilters?: boolean
  resultsCount?: number
  onRoleChange: (val: string) => void
  onEngineChange: (val: string) => void
  onLevelChange: (val: string) => void
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
      className="gap-1.5 rounded-lg bg-lavender/10 px-2.5 py-1 text-lavender hover:bg-lavender/20"
    >
      <span className="text-xs font-medium">{label}: {value}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-lavender/20"
        aria-label={`Remove ${label} filter`}
      >
        <X className="size-3" />
      </button>
    </Badge>
  )
}

export function MemberFilters({
  role = "all",
  engine = "all",
  level = "all",
  hasActiveFilters = false,
  resultsCount,
  onRoleChange,
  onEngineChange,
  onLevelChange,
  onReset,
}: MemberFiltersProps) {
  const isMobile = useIsMobile()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const activeCount = useMemo(() => {
    let count = 0
    if (role !== "all") count++
    if (engine !== "all") count++
    if (level !== "all") count++
    return count
  }, [role, engine, level])

  const activeFilters = useMemo(() => {
    const filters: { key: string; label: string; value: string; onRemove: () => void }[] = []
    if (role !== "all") {
      const opt = ROLE_OPTIONS.find(o => o.value === role)
      filters.push({ key: "role", label: "Role", value: opt?.label || role, onRemove: () => onRoleChange("all") })
    }
    if (engine !== "all") {
      const opt = ENGINE_OPTIONS.find(o => o.value === engine)
      filters.push({ key: "engine", label: "Engine", value: opt?.label || engine, onRemove: () => onEngineChange("all") })
    }
    if (level !== "all") {
      const opt = EXPERIENCE_OPTIONS.find(o => o.value === level)
      filters.push({ key: "level", label: "Level", value: opt?.label || level, onRemove: () => onLevelChange("all") })
    }
    return filters
  }, [role, engine, level, onRoleChange, onEngineChange, onLevelChange])

  const resultsLabel =
    typeof resultsCount === "number"
      ? `${resultsCount} member${resultsCount === 1 ? "" : "s"}`
      : undefined

  if (isMobile) {
    return (
      <section className="px-4 py-4 lg:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-lavender/10">
                <Users className="size-4 text-lavender" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Find members
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
                  activeCount > 0 && "border-lavender/30 bg-lavender/5"
                )}
              >
                <span className="flex items-center gap-3">
                  <SlidersHorizontal className={cn(
                    "size-5",
                    activeCount > 0 ? "text-lavender" : "text-muted-foreground"
                  )} />
                  <span className="font-semibold text-foreground">
                    Filters
                  </span>
                  {activeCount > 0 && (
                    <Badge className="rounded-full bg-lavender px-2 py-0.5 text-xs font-bold text-lavender-foreground">
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
                    <Users className="size-5 text-lavender" />
                    Filter Members
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
                    <label className="text-sm font-medium text-foreground">Role</label>
                    <Select onValueChange={onRoleChange} value={role}>
                      <SelectTrigger className={cn(
                        "h-12 w-full rounded-xl border-border/60 bg-secondary/50 transition-all",
                        role !== "all" && "border-lavender/40 bg-lavender/5"
                      )}>
                        <SelectValue placeholder="Any Role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all">Any Role</SelectItem>
                        {ROLE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center gap-2">
                              {role === opt.value && <Check className="size-4 text-lavender" />}
                              {opt.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Engine</label>
                    <Select onValueChange={onEngineChange} value={engine}>
                      <SelectTrigger className={cn(
                        "h-12 w-full rounded-xl border-border/60 bg-secondary/50 transition-all",
                        engine !== "all" && "border-lavender/40 bg-lavender/5"
                      )}>
                        <SelectValue placeholder="Any Engine" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all">Any Engine</SelectItem>
                        {ENGINE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center gap-2">
                              {engine === opt.value && <Check className="size-4 text-lavender" />}
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
                        level !== "all" && "border-lavender/40 bg-lavender/5"
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

          {/* Active filter badges */}
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
    <section className="px-4 py-6 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-lavender/10">
              <Users className="size-4 text-lavender" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              Find members
            </span>
            {activeCount > 0 && (
              <Badge className="rounded-full bg-lavender px-2 py-0.5 text-xs font-bold text-lavender-foreground">
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
          
          <Select onValueChange={onRoleChange} value={role}>
            <SelectTrigger className={cn(
              "h-11 w-full rounded-xl border-border/60 bg-card transition-all sm:w-[170px]",
              role !== "all" && "border-lavender/40 bg-lavender/5 text-lavender"
            )}>
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
            <SelectTrigger className={cn(
              "h-11 w-full rounded-xl border-border/60 bg-card transition-all sm:w-[170px]",
              engine !== "all" && "border-lavender/40 bg-lavender/5 text-lavender"
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

          <Select onValueChange={onLevelChange} value={level}>
            <SelectTrigger className={cn(
              "h-11 w-full rounded-xl border-border/60 bg-card transition-all sm:w-[190px]",
              level !== "all" && "border-lavender/40 bg-lavender/5 text-lavender"
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

        {/* Active filter badges */}
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
