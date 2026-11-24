import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { CreateTeamForm } from "@/components/create-team-form"
import { PenLine } from "lucide-react"
import type { Metadata } from "next"
import { MainRegion } from "@/components/main-region"

export const metadata: Metadata = {
  title: "Form a Squad — GameJamCrew",
  description: "Create a new squad listing for your game jam. Describe your project, pick the roles you need, and find the perfect teammates.",
  openGraph: {
    title: "Form a Squad — GameJamCrew",
    description:
      "Create a new squad listing for your game jam. Describe your project, pick the roles you need, and find the perfect teammates.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Form a Squad — GameJamCrew",
    description:
      "Create a new squad listing for your game jam. Describe your project, pick the roles you need, and find the perfect teammates.",
  },
}

export default function CreateTeamPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <MainRegion className="flex-1">
        <section className="relative px-4 pb-4 pt-14 lg:px-6 lg:pt-20 lg:pb-6">
<div className="relative mx-auto max-w-xl text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink/30 bg-pink px-4 py-2 text-sm font-medium text-pink-foreground">
              <PenLine className="size-4" />
              Create a new listing
            </div>

            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              Form a <span className="text-pink">Squad</span>
            </h1>

            <p className="mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              Describe your project, pick the roles you need, and let the
              perfect teammates find you.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="px-4 pb-16 pt-4 lg:px-6 lg:pb-24">
          <div className="mx-auto max-w-xl">
            <Suspense>
              <CreateTeamForm />
            </Suspense>
          </div>
        </section>
      </MainRegion>
    </div>
  )
}
