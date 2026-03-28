"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { MemberFilters } from "@/components/member-filters"
import { MembersGrid } from "@/components/members-grid"
import { Search, UserSearch, Sword } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ENGINE_OPTIONS, EXPERIENCE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"

// Dot-pattern background (same as landing-hero)
const DOT_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%2394a3b8' fill-opacity='0.35'/%3E%3C/svg%3E")`

export function FindMembersShell() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [engineFilter, setEngineFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [resultsCount, setResultsCount] = useState<number | null>(null)

  const hasActiveFilters =
    searchQuery !== "" ||
    roleFilter !== "all" ||
    engineFilter !== "all" ||
    levelFilter !== "all"

  const handleResetFilters = () => {
    setSearchQuery("")
    setRoleFilter("all")
    setEngineFilter("all")
    setLevelFilter("all")
  }

  const activeFilterLabels: string[] = []
  if (roleFilter !== "all") {
    const roleLabel = ROLE_OPTIONS.find((r) => r.value === roleFilter)?.label ?? roleFilter
    activeFilterLabels.push(`Role: ${roleLabel}`)
  }
  if (engineFilter !== "all") {
    const engineLabel = ENGINE_OPTIONS.find((e) => e.value === engineFilter)?.label ?? engineFilter
    activeFilterLabels.push(`Engine: ${engineLabel}`)
  }
  if (levelFilter !== "all") {
    const levelLabel = EXPERIENCE_OPTIONS.find((l) => l.value === levelFilter)?.label ?? levelFilter
    activeFilterLabels.push(`Experience: ${levelLabel}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero section - neo-brutalist style */}
        <section
          className="relative overflow-hidden px-4 pb-8 pt-16 sm:px-6 lg:pt-24 lg:pb-12"
          style={{ backgroundImage: DOT_PATTERN, backgroundColor: "var(--background)" }}
        >
          <div className="relative mx-auto max-w-2xl text-center">
            {/* Neo-brutalist badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-4 py-1.5 text-sm font-bold text-foreground shadow-[3px_3px_0px_0px_var(--neo-shadow)]">
              <Sword className="size-4 text-lavender" />
              Browse available jammers
            </div>

            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Find <span className="text-lavender">Teammates</span>
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              Discover talented jammers ready to join your squad. Filter by role, engine, and experience to find the perfect match.
            </p>

            {/* Neo-brutalist search bar */}
            <div className="relative mx-auto mt-10 max-w-xl">
              <div className="relative flex items-center overflow-hidden rounded-lg border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_var(--neo-shadow)]">
                <Search className="ml-5 size-5 shrink-0 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 border-0 bg-transparent px-4 text-base shadow-none ring-0 placeholder:text-muted-foreground focus-visible:ring-0"
                />
              </div>
            </div>
          </div>
        </section>

        <MemberFilters
          role={roleFilter}
          engine={engineFilter}
          level={levelFilter}
          hasActiveFilters={hasActiveFilters}
          resultsCount={resultsCount ?? undefined}
          onRoleChange={setRoleFilter}
          onEngineChange={setEngineFilter}
          onLevelChange={setLevelFilter}
          onReset={handleResetFilters}
        />

        {activeFilterLabels.length > 0 && (
          <section className="px-4 pt-1 sm:px-6">
            <div className="mx-auto max-w-6xl">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Active filters:</span>{" "}
                {activeFilterLabels.join(" • ")}
              </p>
            </div>
          </section>
        )}

        <MembersGrid
          searchQuery={searchQuery}
          roleFilter={roleFilter}
          engineFilter={engineFilter}
          levelFilter={levelFilter}
          onResultsCountChange={setResultsCount}
        />
      </main>
    </div>
  )
}
