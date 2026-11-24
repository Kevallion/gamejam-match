"use client"

import { useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useIsInAppShell } from "@/components/app-shell/app-shell-context"
import { cn } from "@/lib/utils"
import { Navbar } from "@/components/navbar"
import { MemberFilters } from "@/components/member-filters"
import { MembersGrid } from "@/components/members-grid"
import { DirectoryFilters } from "@/components/directory-filters"
import { DirectoryGrid } from "@/components/directory-grid"
import { ActiveFilterChips, type ActiveFilterChip } from "@/components/active-filter-chips"
import { SignedOutNotice } from "@/components/signed-out-notice"
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
  /** False for signed-out visitors: no jammer data, sign-in prompt instead. */
  signedIn?: boolean
}

export function FindMembersShell({
  initialMembers,
  initialHasMore,
  initialDirectory,
  initialDirectoryHasMore,
  initialMode = "available",
  signedIn = true,
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

  const inAppShell = useIsInAppShell()

  const Main = inAppShell ? "div" : "main"
  return (
    <div className={cn("flex flex-col", inAppShell ? "min-h-0" : "min-h-dvh")}>
      <Navbar />
      <Main className="flex-1" {...(!inAppShell ? { id: "main-content", tabIndex: -1 } : {})}>
        <section
          className={cn(
            "px-4 sm:px-6",
            inAppShell ? "pt-4 pb-4 lg:pt-6" : "pt-16 pb-8 lg:pt-24 lg:pb-12",
          )}
        >
          <div
            className={cn(
              "mx-auto w-full",
              inAppShell ? "max-w-6xl text-left" : "max-w-xl text-left",
            )}
          >
            {!inAppShell ? (
              <h1 className="text-balance font-display text-4xl font-extrabold tracking-tight text-foreground">
                Find teammates
              </h1>
            ) : null}

            <p
              className={cn(
                "max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground",
                inAppShell ? "mt-0" : "mt-4",
              )}
            >
              {isDirectory
                ? "Browse every onboarded jammer. Filter by role, engine, and language, then invite them with a personal message."
                : "Discover jammers who marked themselves available. Need a wider search? Switch to the Directory."}
            </p>

            <div className="mt-6 flex justify-start">
              <Tabs
                value={mode}
                onValueChange={(next) =>
                  replaceUrlWithFilters({ view: next === "directory" ? "directory" : null })
                }
              >
                <TabsList className="h-12 rounded-lg border border-border bg-card p-1 shadow-[3px_3px_0_0_var(--neo-shadow)]">
                  <TabsTrigger
                    value="available"
                    className="gap-2 rounded-md px-4 text-base data-[state=active]:bg-lavender data-[state=active]:text-lavender-foreground"
                  >
                    <UserRoundSearch className="size-4" />
                    Available
                  </TabsTrigger>
                  <TabsTrigger
                    value="directory"
                    className="gap-2 rounded-md px-4 text-base data-[state=active]:bg-teal data-[state=active]:text-teal-foreground"
                  >
                    <UserRoundSearch className="size-4" />
                    Directory
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="relative mt-6 max-w-xl">
              <div className="relative flex items-center overflow-hidden rounded-lg border border-border bg-card shadow-[3px_3px_0_0_var(--neo-shadow)] focus-within:ring-2 focus-within:ring-ring">
                <Search className="ml-4 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <label htmlFor="find-members-search" className="sr-only">
                  Search by name
                </label>
                <Input
                  id="find-members-search"
                  name="q"
                  type="search"
                  autoComplete="off"
                  placeholder="Search by name…"
                  value={searchQuery}
                  onChange={(e) => replaceUrlWithFilters({ q: e.target.value })}
                  className="h-12 border-0 bg-transparent px-4 text-base shadow-none ring-0 placeholder:text-muted-foreground focus-visible:ring-0"
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

        {isDirectory && !signedIn ? (
          <SignedOutNotice
            title="Sign in to browse the directory"
            description="The jammer directory is only visible to signed-in members."
            next="/find-members?view=directory"
          />
        ) : isDirectory ? (
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
            signedIn={signedIn}
            onResultsCountChange={setResultsCount}
            isRefreshing={isPending}
            onSwitchToDirectory={() => replaceUrlWithFilters({ view: "directory" })}
            onReset={handleResetFilters}
          />
        )}
      </Main>
    </div>
  )
}
