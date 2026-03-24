"use client"

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Search } from "@/components/search"
import { Filters } from "@/components/filters"
import { TeamGrid } from "@/components/team-grid"
import { ENGINE_OPTIONS, EXPERIENCE_OPTIONS, JAM_STYLE_OPTIONS, LANGUAGE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"
import { Users, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        {/* ── Page Header ─────────────────────────────────────────────── */}
        <header className="border-b border-border/60 bg-background px-4 pb-6 pt-8 lg:px-6 lg:pt-10">
          <div className="mx-auto max-w-6xl">
            {/* Title row */}
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="size-3" aria-hidden />
                  GameJamCrew
                </div>
                <h1 className="text-balance text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
                  Explore Teams
                </h1>
                <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {resultsCount !== null
                    ? `${resultsCount} open squad${resultsCount === 1 ? "" : "s"} looking for members`
                    : "Browse open squads looking for developers, artists, audio designers and more."}
                </p>
              </div>

              <Button
                asChild
                size="sm"
                className="w-fit gap-2 rounded-xl bg-primary font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90"
              >
                <Link href="/create-team">
                  <Users className="size-4" />
                  Create a Squad
                </Link>
              </Button>
            </div>

            {/* Search bar */}
            <div className="mb-4 w-full max-w-xl">
              <Search value={searchQuery} onChange={handleSearchChange} />
            </div>

            {/* Filter row */}
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

            {activeFilterLabels.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Active filters:</span>{" "}
                {activeFilterLabels.join(" \u2022 ")}
              </p>
            )}
          </div>
        </header>

        {/* ── Team Grid ────────────────────────────────────────────────── */}
        <TeamGrid
          searchQuery={searchQuery}
          engineFilter={engineFilter}
          roleFilter={roleFilter}
          levelFilter={levelFilter}
          languageFilter={languageFilter}
          styleFilter={styleFilter}
          onResultsCountChange={setResultsCount}
        />
      </main>
    </div>
  )
}
