"use client"

import { useState, useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { ENGINE_OPTIONS, EXPERIENCE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"
import { useIsMobile } from "@/hooks/use-mobile"

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

function MemberFilterSelects({
  role, engine, level,
  onRoleChange, onEngineChange, onLevelChange,
  isDrawer = false,
}: MemberFiltersProps & { isDrawer?: boolean }) {
  const triggerClass = isDrawer
    ? "h-12 w-full rounded-xl border-border/60 bg-card text-card-foreground"
    : "h-12 w-full rounded-xl border-border/60 bg-card text-card-foreground transition-colors hover:border-lavender/40 sm:w-[170px]"

  return (
    <>
      <Select onValueChange={onRoleChange} value={role}>
        <SelectTrigger className={triggerClass}>
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

      <Select onValueChange={onLevelChange} value={level}>
        <SelectTrigger className={isDrawer ? triggerClass : "h-12 w-full rounded-xl border-border/60 bg-card text-card-foreground transition-colors hover:border-lavender/40 sm:w-[190px]"}>
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
    </>
  )
}

export function MemberFilters(props: MemberFiltersProps) {
  const {
    role = "all", engine = "all", level = "all",
    hasActiveFilters = false, onReset,
  } = props

  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const activeCount = useMemo(() => {
    let count = 0
    if (role !== "all") count++
    if (engine !== "all") count++
    if (level !== "all") count++
    return count
  }, [role, engine, level])

  // ── Mobile: Button + Drawer ──
  if (isMobile) {
    return (
      <section className="px-4 py-6 lg:px-6">
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
                  <DrawerTitle>Filter Members</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col gap-4 px-4 pb-2">
                  <MemberFilterSelects {...props} isDrawer={true} />
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
    <section className="px-4 py-6 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center gap-3">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Filter members
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <MemberFilterSelects {...props} isDrawer={false} />

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
