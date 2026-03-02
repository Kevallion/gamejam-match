"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { MemberFilters } from "@/components/member-filters"
import { MembersGrid } from "@/components/members-grid"
import { Search, UserSearch } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Footer } from "@/components/footer"

export function FindMembersShell() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [engineFilter, setEngineFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")

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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden px-4 pb-8 pt-16 lg:px-6 lg:pt-24 lg:pb-12">
          <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
            <div className="absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-lavender/20 blur-[120px]" />
            <div className="absolute right-0 top-1/2 size-[400px] -translate-y-1/2 rounded-full bg-pink/15 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-lavender/20 bg-lavender/10 px-4 py-1.5 text-sm font-medium text-lavender">
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
          onRoleChange={setRoleFilter}
          onEngineChange={setEngineFilter}
          onLevelChange={setLevelFilter}
          onReset={handleResetFilters}
        />

        <MembersGrid
          searchQuery={searchQuery}
          roleFilter={roleFilter}
          engineFilter={engineFilter}
          levelFilter={levelFilter}
        />
      </main>

      <Footer />
    </div>
  )
}
