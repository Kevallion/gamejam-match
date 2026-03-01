"use client"

import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Hero } from "@/components/hero"
import { Search } from "@/components/search"
import { Filters } from "@/components/filters"
import { TeamGrid } from "@/components/team-grid"
import { Gamepad2, Heart } from "lucide-react"

export function HomeShell() {
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState("")
  const [engineFilter, setEngineFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [languageFilter, setLanguageFilter] = useState("all")

  // Synchroniser l'URL → état au chargement et quand l'URL change
  useEffect(() => {
    const q = searchParams.get("q") ?? ""
    const engine = searchParams.get("engine") ?? "all"
    const role = searchParams.get("role") ?? "all"
    const level = searchParams.get("level") ?? "all"
    const language = searchParams.get("language") ?? "all"
    setSearchQuery(q)
    setEngineFilter(engine)
    setRoleFilter(role)
    setLevelFilter(level)
    setLanguageFilter(language)
  }, [searchParams])

  // Mettre à jour l'URL quand les filtres changent (partage de liens)
  const updateUrl = useCallback(
    (updates: { q?: string; engine?: string; role?: string; level?: string; language?: string }) => {
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

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero — haut de page */}
        <Hero />

        {/* Barre sticky : recherche + filtres */}
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
              compact
              onEngineChange={handleEngineChange}
              onRoleChange={handleRoleChange}
              onLevelChange={handleLevelChange}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        </div>

        {/* Résultats — grille d'équipes */}
        <div className="pt-12 lg:pt-16">
          <TeamGrid
            searchQuery={searchQuery}
            engineFilter={engineFilter}
            roleFilter={roleFilter}
            levelFilter={levelFilter}
            languageFilter={languageFilter}
          />
        </div>
      </main>

      <footer className="border-t border-border/50 bg-card/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center lg:px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="size-4 text-pink" />
            <span>by</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
              <Gamepad2 className="size-4 text-primary" />
              JamSquad
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
