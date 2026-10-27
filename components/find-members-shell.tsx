"use client"

import { useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { MemberFilters } from "@/components/member-filters"
import { MembersGrid } from "@/components/members-grid"
import { DirectoryFilters } from "@/components/directory-filters"
import { DirectoryGrid } from "@/components/directory-grid"
import { BookUser, Search, UserSearch } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ENGINE_OPTIONS,
  EXPERIENCE_OPTIONS,
  LANGUAGE_OPTIONS,
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
  const jamIdFilter = searchParams.get("jam_id") ?? ""
  const isDirectory = mode === "directory"

  const hasActiveFilters = isDirectory
    ? searchQuery !== "" || roleFilter !== "all" || engineFilter !== "all" || langFilter !== "all"
    : searchQuery !== "" ||
      roleFilter !== "all" ||
      engineFilter !== "all" ||
      levelFilter !== "all" ||
      langFilter !== "all" ||
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
      jam_id: null,
    })
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
  if (!isDirectory && levelFilter !== "all") {
    const levelLabel = EXPERIENCE_OPTIONS.find((l) => l.value === levelFilter)?.label ?? levelFilter
    activeFilterLabels.push(`Experience: ${levelLabel}`)
  }
  if (langFilter !== "all") {
    const langLabel = LANGUAGE_OPTIONS.find((l) => l.value === langFilter)?.label ?? langFilter
    activeFilterLabels.push(`Language: ${langLabel}`)
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
              <UserSearch className="size-4" />
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
                    <UserSearch className="size-3.5" />
                    Available
                  </TabsTrigger>
                  <TabsTrigger
                    value="directory"
                    className="gap-1.5 rounded-lg px-4 data-[state=active]:bg-teal data-[state=active]:text-teal-foreground"
                  >
                    <BookUser className="size-3.5" />
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
            language={langFilter}
            hasActiveFilters={hasActiveFilters}
            resultsCount={resultsCount ?? undefined}
            onRoleChange={(value) => replaceUrlWithFilters({ role: value })}
            onEngineChange={(value) => replaceUrlWithFilters({ engine: value })}
            onLanguageChange={(value) => replaceUrlWithFilters({ lang: value })}
            onReset={handleResetFilters}
          />
        ) : (
          <MemberFilters
            role={roleFilter}
            engine={engineFilter}
            level={levelFilter}
            language={langFilter}
            hasActiveFilters={hasActiveFilters}
            resultsCount={resultsCount ?? undefined}
            isUpdating={isPending}
            onRoleChange={(value) => replaceUrlWithFilters({ role: value })}
            onEngineChange={(value) => replaceUrlWithFilters({ engine: value })}
            onLevelChange={(value) => replaceUrlWithFilters({ level: value })}
            onLanguageChange={(value) => replaceUrlWithFilters({ lang: value })}
            onReset={handleResetFilters}
          />
        )}

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

        {isDirectory ? (
          <DirectoryGrid
            key={`${searchQuery}|${roleFilter}|${engineFilter}|${langFilter}`}
            searchQuery={searchQuery}
            roleFilter={roleFilter}
            engineFilter={engineFilter}
            languageFilter={langFilter}
            initialJammers={initialDirectory}
            initialHasMore={initialDirectoryHasMore}
            onResultsCountChange={setResultsCount}
            onSwitchToAvailable={() => replaceUrlWithFilters({ view: null })}
          />
        ) : (
          <MembersGrid
            key={`${searchQuery}|${roleFilter}|${engineFilter}|${levelFilter}|${langFilter}|${jamIdFilter}`}
            initialMembers={initialMembers}
            initialHasMore={initialHasMore}
            searchQuery={searchQuery}
            roleFilter={roleFilter}
            engineFilter={engineFilter}
            levelFilter={levelFilter}
            langFilter={langFilter}
            jamIdFilter={jamIdFilter}
            onResultsCountChange={setResultsCount}
            isRefreshing={isPending}
            onSwitchToDirectory={() => replaceUrlWithFilters({ view: "directory" })}
          />
        )}
      </main>
    </div>
  )
}
