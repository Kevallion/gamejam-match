"use client"

import { useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { MemberFilters } from "@/components/member-filters"
import { MembersGrid } from "@/components/members-grid"
import { DirectoryFilters } from "@/components/directory-filters"
import { DirectoryGrid } from "@/components/directory-grid"
import { ActiveFilterChips, type ActiveFilterChip } from "@/components/active-filter-chips"
import { UserRoundSearch, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ENGINE_OPTIONS,
  EXPERIENCE_OPTIONS,
  LANGUAGE_OPTIONS,
  PROGRAMMING_LANGUAGE_OPTIONS,
  ROLE_OPTIONS,
} from "@/lib/constants"
import type { AvailablePlayerListItem, DirectoryJammerListItem } from "@/lib/queries"

export type MembersBrowseMode = "available" | "directory"

type FindMembersShellProps = {
  initialMembers: AvailablePlayerListItem[]
  initialHasMore: boolean
  initialDirectory: DirectoryJammerListItem[]
  initialDirectoryHasMore: boolean
  initialMode?: MembersBrowseMode
}

export function FindMembersShell({
  initialMembers,
  initialHasMore,
  initialDirectory,
  initialDirectoryHasMore,
  initialMode = "available",
}: FindMembersShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [resultsCount, setResultsCount] = useState<number | null>(null)

  const mode: MembersBrowseMode =
    (searchParams.get("view") ?? initialMode) === "directory" ? "directory" : "available"
  const searchQuery = searchParams.get("q") ?? ""
  const roleFilter = searchParams.get("role") ?? "all"
  const engineFilter = searchParams.get("engine") ?? "all"
  const levelFilter = searchParams.get("level") ?? "all"
  const langFilter = searchParams.get("lang") ?? "all"
  const codeFilter = searchParams.get("code") ?? "all"
  const jamIdFilter = searchParams.get("jam_id") ?? ""
  const isDirectory = mode === "directory"

  const hasActiveFilters = isDirectory
    ? searchQuery !== "" ||
      roleFilter !== "all" ||
      engineFilter !== "all" ||
      levelFilter !== "all" ||
      langFilter !== "all" ||
      codeFilter !== "all"
    : searchQuery !== "" ||
      roleFilter !== "all" ||
      engineFilter !== "all" ||
      levelFilter !== "all" ||
      langFilter !== "all" ||
      codeFilter !== "all" ||
      jamIdFilter !== ""

  const replaceUrlWithFilters = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all") {
        nextParams.delete(key)
      } else {
        nextParams.set(key, value)
      }
    })

    nextParams.delete("offset")
    const query = nextParams.toString()
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname)
    })
  }

  const handleResetFilters = () => {
    replaceUrlWithFilters({
      q: null,
      role: null,
      engine: null,
      level: null,
      lang: null,
      code: null,
      jam_id: null,
    })
  }

  const activeFilterChips: ActiveFilterChip[] = []
  if (searchQuery.trim()) activeFilterChips.push({ id: "q", label: `Search: ${searchQuery.trim()}` })
  if (roleFilter !== "all") {
    const roleLabel = ROLE_OPTIONS.find((r) => r.value === roleFilter)?.label ?? roleFilter
    activeFilterChips.push({ id: "role", label: `Role: ${roleLabel}` })
  }
  if (engineFilter !== "all") {
    const engineLabel = ENGINE_OPTIONS.find((e) => e.value === engineFilter)?.label ?? engineFilter
    activeFilterChips.push({ id: "engine", label: `Engine: ${engineLabel}` })
  }
  if (levelFilter !== "all") {
    const levelLabel = EXPERIENCE_OPTIONS.find((l) => l.value === levelFilter)?.label ?? levelFilter
    activeFilterChips.push({ id: "level", label: `Experience: ${levelLabel}` })
  }
  if (langFilter !== "all") {
    const langLabel = LANGUAGE_OPTIONS.find((l) => l.value === langFilter)?.label ?? langFilter
    activeFilterChips.push({ id: "lang", label: `Language: ${langLabel}` })
  }
  if (codeFilter !== "all") {
    const codeLabel = PROGRAMMING_LANGUAGE_OPTIONS.find((l) => l.value === codeFilter)?.label ?? codeFilter
    activeFilterChips.push({ id: "code", label: `Code: ${codeLabel}` })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden px-4 pb-8 pt-16 sm:px-6 lg:pt-24 lg:pb-12">
          <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
            <div className="absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-lavender/20 blur-[120px]" />
            <div className="absolute right-0 top-1/2 size-[400px] -translate-y-1/2 rounded-full bg-pink/15 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-lavender/30 bg-lavender px-4 py-1.5 text-sm font-medium text-lavender-foreground">
              <UserRoundSearch className="size-4" />
              Find teammates
            </div>

            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Find <span className="text-lavender">Teammates</span>
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              {isDirectory
                ? "Browse every onboarded jammer. Filter by role, engine, and language, then invite them with a personal message."
                : "Discover jammers who marked themselves available. Need a wider search? Switch to the Directory."}
            </p>

            <div className="mx-auto mt-8 flex justify-center">
              <Tabs
                value={mode}
                onValueChange={(next) =>
                  replaceUrlWithFilters({ view: next === "directory" ? "directory" : null })
                }
              >
                <TabsList className="h-11 rounded-xl border border-border/60 bg-card/80 p-1 shadow-sm">
                  <TabsTrigger
                    value="available"
                    className="gap-1.5 rounded-lg px-4 data-[state=active]:bg-lavender data-[state=active]:text-lavender-foreground"
                  >
                    <UserRoundSearch className="size-3.5" />
                    Available
                  </TabsTrigger>
                  <TabsTrigger
                    value="directory"
                    className="gap-1.5 rounded-lg px-4 data-[state=active]:bg-teal data-[state=active]:text-teal-foreground"
                  >
                    <UserRoundSearch className="size-3.5" />
                    Directory
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="relative mx-auto mt-8 max-w-xl">
              <div
                className={`absolute inset-0 -m-1 rounded-[1.25rem] blur-md ${
                  isDirectory ? "bg-teal/20" : "bg-lavender/20"
                }`}
              />
              <div
                className={`relative flex items-center overflow-hidden rounded-2xl border-2 bg-card shadow-lg ${
                  isDirectory
                    ? "border-teal/30 shadow-teal/5"
                    : "border-lavender/30 shadow-lavender/5"
                }`}
              >
                <Search className="ml-5 size-5 shrink-0 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => replaceUrlWithFilters({ q: e.target.value })}
                  className="h-14 border-0 bg-transparent px-4 text-base shadow-none ring-0 placeholder:text-muted-foreground focus-visible:ring-0"
                />
              </div>
            </div>
          </div>
        </section>

        {isDirectory ? (
          <DirectoryFilters
            role={roleFilter}
            engine={engineFilter}
            level={levelFilter}
            language={langFilter}
            programmingLanguage={codeFilter}
            hasActiveFilters={hasActiveFilters}
            resultsCount={resultsCount ?? undefined}
            onRoleChange={(value) => replaceUrlWithFilters({ role: value })}
            onEngineChange={(value) => replaceUrlWithFilters({ engine: value })}
            onLevelChange={(value) => replaceUrlWithFilters({ level: value })}
            onLanguageChange={(value) => replaceUrlWithFilters({ lang: value })}
            onProgrammingLanguageChange={(value) => replaceUrlWithFilters({ code: value })}
            onReset={handleResetFilters}
          />
        ) : (
          <MemberFilters
            role={roleFilter}
            engine={engineFilter}
            level={levelFilter}
            language={langFilter}
            programmingLanguage={codeFilter}
            hasActiveFilters={hasActiveFilters}
            resultsCount={resultsCount ?? undefined}
            isUpdating={isPending}
            onRoleChange={(value) => replaceUrlWithFilters({ role: value })}
            onEngineChange={(value) => replaceUrlWithFilters({ engine: value })}
            onLevelChange={(value) => replaceUrlWithFilters({ level: value })}
            onLanguageChange={(value) => replaceUrlWithFilters({ lang: value })}
            onProgrammingLanguageChange={(value) => replaceUrlWithFilters({ code: value })}
            onReset={handleResetFilters}
          />
        )}

        {activeFilterChips.length > 0 && (
          <section className="px-4 pt-1 sm:px-6">
            <div className="mx-auto max-w-6xl">
              <ActiveFilterChips
                chips={activeFilterChips}
                onRemove={(id) => replaceUrlWithFilters({ [id]: null })}
              />
            </div>
          </section>
        )}

        {isDirectory ? (
          <DirectoryGrid
            key={`${searchQuery}|${roleFilter}|${engineFilter}|${levelFilter}|${langFilter}|${codeFilter}`}
            searchQuery={searchQuery}
            roleFilter={roleFilter}
            engineFilter={engineFilter}
            levelFilter={levelFilter}
            languageFilter={langFilter}
            programmingLanguageFilter={codeFilter}
            initialJammers={initialDirectory}
            initialHasMore={initialDirectoryHasMore}
            onResultsCountChange={setResultsCount}
            onSwitchToAvailable={() => replaceUrlWithFilters({ view: null })}
            onReset={handleResetFilters}
          />
        ) : (
          <MembersGrid
            key={`${searchQuery}|${roleFilter}|${engineFilter}|${levelFilter}|${langFilter}|${codeFilter}|${jamIdFilter}`}
            initialMembers={initialMembers}
            initialHasMore={initialHasMore}
            searchQuery={searchQuery}
            roleFilter={roleFilter}
            engineFilter={engineFilter}
            levelFilter={levelFilter}
            langFilter={langFilter}
            programmingLanguageFilter={codeFilter}
            jamIdFilter={jamIdFilter}
            onResultsCountChange={setResultsCount}
            isRefreshing={isPending}
            onSwitchToDirectory={() => replaceUrlWithFilters({ view: "directory" })}
            onReset={handleResetFilters}
          />
        )}
      </main>
    </div>
  )
}
