import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LandingHome } from "@/components/landing/landing-home"

export const metadata: Metadata = {
  title: "GameJamCrew | Find your perfect Game Jam Team",
  description:
    "Find your perfect game jam squad. Connect with developers, artists, and composers who share your vision on GameJamCrew.",
  openGraph: {
    title: "GameJamCrew | Find your perfect Game Jam Team",
    description:
      "Find your perfect game jam squad. Connect with developers, artists, and composers who share your vision.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GameJamCrew | Find your perfect Game Jam Team",
    description:
      "Find your perfect game jam squad. Connect with developers, artists, and composers who share your vision.",
  },
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }

  return <LandingHome />
}
