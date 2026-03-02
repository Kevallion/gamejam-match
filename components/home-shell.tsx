"use client"

import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Hero } from "@/components/hero"
import { Search } from "@/components/search"
import { Filters } from "@/components/filters"
import { TeamGrid } from "@/components/team-grid"
import { Footer } from "@/components/footer"

export function HomeShell() {
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState("")
  const [engineFilter, setEngineFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [languageFilter, setLanguageFilter] = useState("all")
  const [styleFilter, setStyleFilter] = useState("all")

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

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero — top of page */}
        <Hero />

        {/* Sticky bar: search + filters */}
        <div className="sticky top-16 z-40 -mb-px border-b border-border/50 bg-background/95 backdrop-blur-md">
          <div className="mx-auto max-w-6xl flex flex-col gap-6 px-4 py-6 lg:px-6 lg:py-6">
            <div className="w-full max-w-xl">
              <Search
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Filters
              engine={engineFilter}
              role={roleFilter}
              level={levelFilter}
              language={languageFilter}
              style={styleFilter}
              compact
              onEngineChange={handleEngineChange}
              onRoleChange={handleRoleChange}
              onLevelChange={handleLevelChange}
              onLanguageChange={handleLanguageChange}
              onStyleChange={handleStyleChange}
            />
          </div>
        </div>

        {/* Results — team grid */}
        <div className="pt-12 lg:pt-16">
          <TeamGrid
            searchQuery={searchQuery}
            engineFilter={engineFilter}
            roleFilter={roleFilter}
            levelFilter={levelFilter}
            languageFilter={languageFilter}
            styleFilter={styleFilter}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
