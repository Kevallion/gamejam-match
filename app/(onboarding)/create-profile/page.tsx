import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { CreateProfileAvailabilitySection } from "@/components/create-profile-availability-section"
import { CreateProfileOnboarding } from "@/components/create-profile-onboarding"
import { COMPOSE_AVAILABILITY_HREF } from "@/components/app-shell/nav-config"
import { getCurrentUser } from "@/lib/supabase/get-current-user"
import { createClient } from "@/lib/supabase/server"
import { UserRoundCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Join a Squad — GameJamCrew",
  description: "Set up your solo profile and let squads know you're ready to jam. Share your skills and get discovered.",
  openGraph: {
    title: "Join a Squad — GameJamCrew",
    description: "Set up your solo profile and let squads know you're ready to jam. Share your skills and get discovered.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join a Squad — GameJamCrew",
    description: "Set up your solo profile and let squads know you're ready to jam. Share your skills and get discovered.",
  },
}

export default async function AvailabilityPage() {
  const user = await getCurrentUser()
  let needsOnboarding = false
  if (user) {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from("profiles")
      .select("has_completed_onboarding")
      .eq("id", user.id)
      .maybeSingle()
    if (profile?.has_completed_onboarding === true) {
      redirect(COMPOSE_AVAILABILITY_HREF)
    }
    needsOnboarding = true
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {needsOnboarding ? (
          <section className="relative overflow-hidden px-4 pb-16 pt-14 lg:px-6 lg:pt-20">
            <div className="relative mx-auto max-w-2xl text-center">
              <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
                Finish your <span className="text-lavender">profile</span>
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
                Complete onboarding to access the dashboard and start earning XP.
              </p>
            </div>
            <CreateProfileOnboarding />
          </section>
        ) : (
          <>
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
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lavender/30 bg-lavender px-4 py-1.5 text-sm font-medium text-lavender-foreground">
              <UserRoundCheck className="size-4" />
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
            <CreateProfileAvailabilitySection />
          </div>
        </section>
          </>
        )}
      </main>
    </div>
  )
}
