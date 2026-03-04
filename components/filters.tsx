"use client"

import { useState, useMemo } from "react"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { SlidersHorizontal, RotateCcw, X } from "lucide-react"
import { ENGINE_OPTIONS, EXPERIENCE_OPTIONS, JAM_STYLE_OPTIONS, LANGUAGE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"
import { useIsMobile } from "@/hooks/use-mobile"

interface FiltersProps {
  engine?: string
  role?: string
  level?: string
  language?: string
  style?: string
  compact?: boolean
  hasActiveFilters?: boolean
  onEngineChange: (val: string) => void
  onRoleChange: (val: string) => void
  onLevelChange: (val: string) => void
  onLanguageChange: (val: string) => void
  onStyleChange?: (val: string) => void
  onReset?: () => void
}

function FilterSelects({
  engine, role, level, language, style,
  onEngineChange, onRoleChange, onLevelChange, onLanguageChange, onStyleChange,
  isDrawer = false,
}: FiltersProps & { isDrawer?: boolean }) {
  const triggerClass = isDrawer
    ? "h-12 w-full rounded-xl border-border/60 bg-card text-card-foreground"
    : "h-12 w-full rounded-xl border-border/60 bg-card text-card-foreground transition-colors hover:border-lavender/40 sm:w-[160px]"

  return (
    <>
      <Select onValueChange={onEngineChange} value={engine}>
        <SelectTrigger className={triggerClass}>
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
        <SelectTrigger className={isDrawer ? triggerClass : "h-12 w-full rounded-xl border-border/60 bg-card text-card-foreground transition-colors hover:border-lavender/40 sm:w-[180px]"}>
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
        <SelectTrigger className={isDrawer ? triggerClass : "h-12 w-full rounded-xl border-border/60 bg-card text-card-foreground transition-colors hover:border-lavender/40 sm:w-[180px]"}>
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
        <SelectTrigger className={isDrawer ? triggerClass : "h-12 w-full rounded-xl border-border/60 bg-card text-card-foreground transition-colors hover:border-lavender/40 sm:w-[160px]"}>
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
          <SelectTrigger className={isDrawer ? triggerClass : "h-12 w-full rounded-xl border-border/60 bg-card text-card-foreground transition-colors hover:border-lavender/40 sm:w-[180px]"}>
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
    </>
  )
}

export function Filters(props: FiltersProps) {
  const {
    engine = "all", role = "all", level = "all", language = "all", style = "all",
    compact = false, hasActiveFilters = false, onReset,
  } = props

  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const activeCount = useMemo(() => {
    let count = 0
    if (engine !== "all") count++
    if (role !== "all") count++
    if (level !== "all") count++
    if (language !== "all") count++
    if (style !== "all") count++
    return count
  }, [engine, role, level, language, style])

  // ── Mobile: Button + Drawer ──
  if (isMobile) {
    return (
      <section className={compact ? "py-0" : "px-4 py-6 lg:px-6"}>
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 gap-2 rounded-xl border-border/60 bg-card text-card-foreground"
                >
                  <SlidersHorizontal className="size-4" />
                  Filters
                  {activeCount > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {activeCount}
                    </span>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Filter Teams</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col gap-4 px-4 pb-2">
                  <FilterSelects {...props} isDrawer={true} />
                </div>
                <DrawerFooter>
                  {hasActiveFilters && onReset && (
                    <Button variant="ghost" onClick={() => { onReset(); setDrawerOpen(false) }} className="gap-2 rounded-xl text-muted-foreground">
                      <RotateCcw className="size-4" />
                      Reset Filters
                    </Button>
                  )}
                  <DrawerClose asChild>
                    <Button variant="outline" className="gap-2 rounded-xl">
                      <X className="size-4" />
                      Close
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            {hasActiveFilters && onReset && (
              <Button variant="ghost" size="sm" onClick={onReset} className="gap-2 rounded-xl text-muted-foreground hover:text-foreground">
                <RotateCcw className="size-4" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </section>
    )
  }

  // ── Desktop: Inline selects ──
  return (
    <section className={compact ? "py-0" : "px-4 py-6 lg:px-6"}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-3 flex items-center gap-3 sm:mb-4">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Filter teams
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelects {...props} isDrawer={false} />

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
