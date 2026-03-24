"use client"

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Hero } from "@/components/hero"
import { Search } from "@/components/search"
import { Filters } from "@/components/filters"
import { TeamGrid } from "@/components/team-grid"
import { ENGINE_OPTIONS, EXPERIENCE_OPTIONS, JAM_STYLE_OPTIONS, LANGUAGE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"

export function HomeShell() {
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState("")
  const [engineFilter, setEngineFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [languageFilter, setLanguageFilter] = useState("all")
  const [styleFilter, setStyleFilter] = useState("all")
  const [resultsCount, setResultsCount] = useState<number | null>(null)

  // Sync URL to state on load and when URL changes
  useEffect(() => {
    const q = searchParams.get("q") ?? ""
    const engine = searchParams.get("engine") ?? "all"
    const role = searchParams.get("role") ?? "all"
    const level = searchParams.get("level") ?? "all"
    const language = searchParams.get("language") ?? "all"
    const style = searchParams.get("style") ?? "all"
    setSearchQuery(q)
    setEngineFilter(engine)
    setRoleFilter(role)
    setLevelFilter(level)
    setLanguageFilter(language)
    setStyleFilter(style)
  }, [searchParams])

  // Update URL when filters change (link sharing)
  const updateUrl = useCallback(
    (updates: { q?: string; engine?: string; role?: string; level?: string; language?: string; style?: string }) => {
      const params = new URLSearchParams(searchParams.toString())
      const set = (key: string, val: string) => {
        if (val && val !== "all") params.set(key, val)
        else params.delete(key)
      }
      if (updates.q !== undefined) set("q", updates.q)
      if (updates.engine !== undefined) set("engine", updates.engine)
      if (updates.role !== undefined) set("role", updates.role)
      if (updates.level !== undefined) set("level", updates.level)
      if (updates.language !== undefined) set("language", updates.language)
      if (updates.style !== undefined) set("style", updates.style)
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`)
    },
    [searchParams]
  )

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    updateUrl({ q: val })
  }

  const handleEngineChange = (val: string) => {
    setEngineFilter(val)
    updateUrl({ engine: val })
  }

  const handleRoleChange = (val: string) => {
    setRoleFilter(val)
    updateUrl({ role: val })
  }

  const handleLevelChange = (val: string) => {
    setLevelFilter(val)
    updateUrl({ level: val })
  }

  const handleLanguageChange = (val: string) => {
    setLanguageFilter(val)
    updateUrl({ language: val })
  }

  const handleStyleChange = (val: string) => {
    setStyleFilter(val)
    updateUrl({ style: val })
  }

  const hasActiveFilters =
    searchQuery !== "" ||
    engineFilter !== "all" ||
    roleFilter !== "all" ||
    levelFilter !== "all" ||
    languageFilter !== "all" ||
    styleFilter !== "all"

  const handleResetFilters = () => {
    setSearchQuery("")
    setEngineFilter("all")
    setRoleFilter("all")
    setLevelFilter("all")
    setLanguageFilter("all")
    setStyleFilter("all")
    window.history.replaceState(null, "", window.location.pathname)
  }

  const activeFilterLabels: string[] = []
  if (engineFilter !== "all") {
    const engineLabel = ENGINE_OPTIONS.find((e) => e.value === engineFilter)?.label ?? engineFilter
    activeFilterLabels.push(`Engine: ${engineLabel}`)
  }
  if (roleFilter !== "all") {
    const roleLabel = ROLE_OPTIONS.find((r) => r.value === roleFilter)?.label ?? roleFilter
    activeFilterLabels.push(`Role: ${roleLabel}`)
  }
  if (levelFilter !== "all") {
    const levelLabel = EXPERIENCE_OPTIONS.find((l) => l.value === levelFilter)?.label ?? levelFilter
    activeFilterLabels.push(`Experience: ${levelLabel}`)
  }
  if (languageFilter !== "all") {
    const languageLabel = LANGUAGE_OPTIONS.find((l) => l.value === languageFilter)?.label ?? languageFilter
    activeFilterLabels.push(`Language: ${languageLabel}`)
  }
  if (styleFilter !== "all") {
    const styleLabel = JAM_STYLE_OPTIONS.find((s) => s.value === styleFilter)?.label ?? styleFilter
    activeFilterLabels.push(`Jam style: ${styleLabel}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero — compact top section */}
        <Hero />

        {/* Search + filters — sticky section */}
        <div className="sticky top-0 z-30 border-b border-border/50 bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:gap-4 sm:py-4 lg:px-6">
            {/* Search bar */}
            <div className="w-full max-w-2xl">
              <Search
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search teams, jams, or skills..."
              />
            </div>
            
            {/* Filters */}
            <Filters
              engine={engineFilter}
              role={roleFilter}
              level={levelFilter}
              language={languageFilter}
              style={styleFilter}
              compact
              hasActiveFilters={hasActiveFilters}
              resultsCount={resultsCount ?? undefined}
              onEngineChange={handleEngineChange}
              onRoleChange={handleRoleChange}
              onLevelChange={handleLevelChange}
              onLanguageChange={handleLanguageChange}
              onStyleChange={handleStyleChange}
              onReset={handleResetFilters}
            />
            
            {/* Active filter chips */}
            {activeFilterLabels.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-muted-foreground">Filtering by:</span>
                {activeFilterLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results — team grid */}
        <div className="pt-8 lg:pt-10">
          <TeamGrid
            searchQuery={searchQuery}
            engineFilter={engineFilter}
            roleFilter={roleFilter}
            levelFilter={levelFilter}
            languageFilter={languageFilter}
            styleFilter={styleFilter}
            onResultsCountChange={setResultsCount}
          />
        </div>
      </main>
    </div>
  )
}
