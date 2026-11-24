import { Suspense } from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { DashboardClient } from "@/components/dashboard-client"
import { getCurrentUser } from "@/lib/supabase/get-current-user"
import { loadDashboardBootstrap } from "@/lib/dashboard-bootstrap"
import { PostActionOnboarding } from "@/components/post-action-onboarding"

export const metadata: Metadata = {
  title: "Dashboard — GameJamCrew",
  description: "Manage your game jam squads, track incoming applications, and keep your jammer profile up to date.",
  openGraph: {
    title: "Dashboard — GameJamCrew",
    description:
      "Manage your game jam squads, track incoming applications, and keep your jammer profile up to date.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard — GameJamCrew",
    description:
      "Manage your game jam squads, track incoming applications, and keep your jammer profile up to date.",
  },
}

type DashboardPageProps = {
  searchParams: Promise<{ tab?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/")
  }
  const { tab } = await searchParams
  // DS-3h: first paint carries profile, XP/snapshot and kudos. Daily login is claimed after render.
  const bootstrap = await loadDashboardBootstrap(user.id)
  return (
    <>
      <Suspense>
        <DashboardClient defaultTab={tab} bootstrap={bootstrap} />
      </Suspense>
      <Suspense fallback={null}>
        <PostActionOnboarding />
      </Suspense>
    </>
  )
}
