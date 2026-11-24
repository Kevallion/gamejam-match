import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { CreateProfileAvailabilitySection } from "@/components/create-profile-availability-section"
import { CreateProfileOnboarding } from "@/components/create-profile-onboarding"
import { COMPOSE_AVAILABILITY_HREF } from "@/components/app-shell/nav-config"
import { getCurrentUser } from "@/lib/supabase/get-current-user"
import { createClient } from "@/lib/supabase/server"
import { AppIcon } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"

export const metadata: Metadata = {
  title: "Create your profile — GameJamCrew",
  description: "Set up your solo profile and let squads know you're ready to jam. Share your skills and get discovered.",
  openGraph: {
    title: "Create your profile — GameJamCrew",
    description: "Set up your solo profile and let squads know you're ready to jam. Share your skills and get discovered.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create your profile — GameJamCrew",
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
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {needsOnboarding ? (
          <section className="relative px-4 pb-16 pt-16 lg:px-8 lg:pt-24">
            <div className="relative mx-auto max-w-2xl text-center">
              <h1 className="text-balance font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
                Set up your <span className="text-primary">jam profile</span>
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
                Share your role, engine, and experience so squads can find you.
              </p>
            </div>
            <div className="relative mx-auto mt-8 max-w-2xl">
              <CreateProfileOnboarding />
            </div>
          </section>
        ) : (
          <>
        {/* Hero header */}
        <section className="relative px-4 pb-8 pt-16 lg:px-8 lg:pt-24 lg:pb-8">
          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex min-h-8 items-center gap-2 rounded-full border border-lavender/30 bg-lavender px-4 py-1 text-base font-medium text-lavender-foreground">
              <AppIcon icon={ICON.accepted} size="sm" />
              Solo profile
            </div>

            <h1 className="text-balance font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              Join a <span className="text-primary">Squad</span>
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              Let teams know you are ready to jam! Share your skills and find the
              perfect project to contribute to.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="px-4 pb-16 pt-8 lg:px-8 lg:pb-24">
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
