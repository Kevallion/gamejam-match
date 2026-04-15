"use client"

import { useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { MemberFilters } from "@/components/member-filters"
import { MembersGrid } from "@/components/members-grid"
import { Search, UserSearch } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ENGINE_OPTIONS, EXPERIENCE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"
import type { AvailablePlayerListItem } from "@/lib/queries"

type FindMembersShellProps = {
  initialMembers: AvailablePlayerListItem[]
  initialHasMore: boolean
}

export function FindMembersShell({ initialMembers, initialHasMore }: FindMembersShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const searchQuery = searchParams.get("q") ?? ""
  const roleFilter = searchParams.get("role") ?? "all"
  const engineFilter = searchParams.get("engine") ?? "all"
  const levelFilter = searchParams.get("level") ?? "all"
  const jamIdFilter = searchParams.get("jam_id") ?? ""
  const [resultsCount, setResultsCount] = useState<number | null>(null)

  const hasActiveFilters =
    searchQuery !== "" ||
    roleFilter !== "all" ||
    engineFilter !== "all" ||
    levelFilter !== "all" ||
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

    // Any filter update should restart pagination from the first page.
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
  if (levelFilter !== "all") {
    const levelLabel = EXPERIENCE_OPTIONS.find((l) => l.value === levelFilter)?.label ?? levelFilter
    activeFilterLabels.push(`Experience: ${levelLabel}`)
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
              Browse available jammers
            </div>

            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Find <span className="text-lavender">Teammates</span>
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              Discover talented jammers ready to join your squad. Filter by role, engine, and experience to find the perfect match.
            </p>

            <div className="relative mx-auto mt-10 max-w-xl">
              <div className="absolute inset-0 -m-1 rounded-[1.25rem] bg-lavender/20 blur-md" />
              <div className="relative flex items-center overflow-hidden rounded-2xl border-2 border-lavender/30 bg-card shadow-lg shadow-lavender/5">
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

        <MemberFilters
          role={roleFilter}
          engine={engineFilter}
          level={levelFilter}
          hasActiveFilters={hasActiveFilters}
          resultsCount={resultsCount ?? undefined}
          isUpdating={isPending}
          onRoleChange={(value) => replaceUrlWithFilters({ role: value })}
          onEngineChange={(value) => replaceUrlWithFilters({ engine: value })}
          onLevelChange={(value) => replaceUrlWithFilters({ level: value })}
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
          key={`${searchQuery}|${roleFilter}|${engineFilter}|${levelFilter}|${jamIdFilter}`}
          initialMembers={initialMembers}
          initialHasMore={initialHasMore}
          searchQuery={searchQuery}
          roleFilter={roleFilter}
          engineFilter={engineFilter}
          levelFilter={levelFilter}
          jamIdFilter={jamIdFilter}
          onResultsCountChange={setResultsCount}
          isRefreshing={isPending}
        />
      </main>
    </div>
  )
}
