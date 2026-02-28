import { Navbar } from "@/components/navbar"
import { MemberFilters } from "@/components/member-filters"
import { MembersGrid } from "@/components/members-grid"
import { Gamepad2, Heart, Search, UserSearch } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function MembersPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero header */}
        <section className="relative overflow-hidden px-4 pb-8 pt-16 lg:px-6 lg:pt-24 lg:pb-12">
          {/* Decorative background glow */}
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            aria-hidden="true"
          >
            <div className="absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-lavender/20 blur-[120px]" />
            <div className="absolute right-0 top-1/2 size-[400px] -translate-y-1/2 rounded-full bg-pink/15 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-lavender/20 bg-lavender/10 px-4 py-1.5 text-sm font-medium text-lavender">
              <UserSearch className="size-4" />
              Browse available jammers
            </div>

            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Find{" "}
              <span className="text-lavender">Teammates</span>
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              Discover talented jammers ready to join your squad. Filter by
              role, engine, and experience to find the perfect match.
            </p>

            {/* Search bar */}
            <div className="relative mx-auto mt-10 max-w-xl">
              <div className="absolute inset-0 -m-1 rounded-[1.25rem] bg-lavender/20 blur-md" />
              <div className="relative flex items-center overflow-hidden rounded-2xl border-2 border-lavender/30 bg-card shadow-lg shadow-lavender/5">
                <Search className="ml-5 size-5 shrink-0 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, role, or engine..."
                  className="h-14 border-0 bg-transparent px-4 text-base shadow-none ring-0 placeholder:text-muted-foreground focus-visible:ring-0"
                />
                <button className="mr-2 shrink-0 rounded-xl bg-lavender px-5 py-2.5 text-sm font-bold text-lavender-foreground transition-colors hover:bg-lavender/85">
                  Search
                </button>
              </div>
            </div>
          </div>
        </section>

        <MemberFilters />
        <MembersGrid />
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
          <p className="text-xs text-muted-foreground/70">
            {"Connect, create, and ship games together."}
          </p>
        </div>
      </footer>
    </div>
  )
}
