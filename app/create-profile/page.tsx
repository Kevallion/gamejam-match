import { Navbar } from "@/components/navbar"
import { AvailabilityForm } from "@/components/availability-form"
import { Gamepad2, Heart, UserCheck } from "lucide-react"

export default function AvailabilityPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero header */}
        <section className="relative overflow-hidden px-4 pb-4 pt-14 lg:px-6 lg:pt-20 lg:pb-6">
          {/* Decorative background glow */}
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            aria-hidden="true"
          >
            <div className="absolute left-1/3 top-0 size-[500px] -translate-y-1/3 rounded-full bg-lavender/20 blur-[120px]" />
            <div className="absolute right-1/4 top-1/3 size-[400px] rounded-full bg-mint/15 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lavender/20 bg-lavender/10 px-4 py-1.5 text-sm font-medium text-lavender">
              <UserCheck className="size-4" />
              Solo profile
            </div>

            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              Join a <span className="text-lavender">Squad</span>
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              Let teams know you are ready to jam! Share your skills and find the
              perfect project to contribute to.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="px-4 pb-16 pt-4 lg:px-6 lg:pb-24">
          <div className="mx-auto max-w-2xl">
            <AvailabilityForm />
          </div>
        </section>
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
