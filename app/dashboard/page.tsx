import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "@/components/dashboard-client"

export const metadata: Metadata = {
  title: "Dashboard — GameJamCrew",
  description: "Manage your game jam teams, track incoming applications, and keep your jammer profile up to date.",
}

type DashboardPageProps = {
  searchParams: Promise<{ tab?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/")
  }
  const { tab } = await searchParams
  return <DashboardClient defaultTab={tab} />
}
