"use client"

import { useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, RotateCcw } from "lucide-react"
import { ENGINE_OPTIONS, LANGUAGE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"
import { TagFilterChoice } from "@/components/tag-icon"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

interface DirectoryFiltersProps {
  role?: string
  engine?: string
  language?: string
  hasActiveFilters?: boolean
  resultsCount?: number
  onRoleChange: (val: string) => void
  onEngineChange: (val: string) => void
  onLanguageChange: (val: string) => void
  onReset?: () => void
}

export function DirectoryFilters({
  role = "all",
  engine = "all",
  language = "all",
  hasActiveFilters = false,
  resultsCount,
  onRoleChange,
  onEngineChange,
  onLanguageChange,
  onReset,
}: DirectoryFiltersProps) {
  const isMobile = useIsMobile()

  const activeCount = useMemo(() => {
    let count = 0
    if (role !== "all") count++
    if (engine !== "all") count++
    if (language !== "all") count++
    return count
  }, [role, engine, language])

  const resultsLabel =
    typeof resultsCount === "number"
      ? `${resultsCount} result${resultsCount === 1 ? "" : "s"}`
      : undefined

  const filterSelects = (
    <>
      <Select onValueChange={onRoleChange} value={role}>
        <SelectTrigger className="h-12 w-full rounded-xl border-border/60 bg-card text-card-foreground transition-colors hover:border-lavender/40 sm:w-[170px]">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="all">Any Role</SelectItem>
          {ROLE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <TagFilterChoice kind="role" value={opt.value} label={opt.label} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={onEngineChange} value={engine}>
        <SelectTrigger className="h-12 w-full rounded-xl border-border/60 bg-card text-card-foreground transition-colors hover:border-lavender/40 sm:w-[170px]">
          <SelectValue placeholder="Engine" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="all">Any Engine</SelectItem>
          {ENGINE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <TagFilterChoice kind="engine" value={opt.value} label={opt.label} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={onLanguageChange} value={language}>
        <SelectTrigger className="h-12 w-full rounded-xl border-border/60 bg-card text-card-foreground transition-colors hover:border-lavender/40 sm:w-[170px]">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="all">Any Language</SelectItem>
          {LANGUAGE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <TagFilterChoice kind="language" value={opt.value} label={opt.label} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )

  if (isMobile) {
    return (
      <section className="px-4 py-4 lg:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Filter directory
              </span>
            </div>
            {resultsLabel && (
              <span className="text-xs font-medium text-muted-foreground">{resultsLabel}</span>
            )}
          </div>

          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="card-interactive flex w-full items-center justify-between gap-2 rounded-2xl border-border/60 bg-card px-4 py-3 text-sm"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">
                    Filters{activeCount > 0 ? ` (${activeCount})` : ""}
                  </span>
                </span>
                {hasActiveFilters && (
                  <span className="text-xs text-muted-foreground">Tap to adjust</span>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="rounded-t-3xl border-border/60 bg-card">
              <DrawerHeader className="text-left">
                <DrawerTitle className="text-base font-semibold text-foreground">Filters</DrawerTitle>
              </DrawerHeader>
              <div className="space-y-4 px-4 pb-4 pt-1">{filterSelects}</div>
              <DrawerFooter className="flex flex-row gap-3 px-4 pb-6 pt-0">
                {hasActiveFilters && onReset && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onReset}
                    className="flex-1 gap-2 rounded-xl text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="size-4" />
                    Reset
                  </Button>
                )}
                <DrawerClose asChild>
                  <Button className="flex-1 rounded-xl">Show {resultsLabel ?? "results"}</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 py-6 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Filter directory
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {filterSelects}
          {hasActiveFilters && onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="gap-2 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-4" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
