import type { Metadata } from "next"
import { DashboardClient } from "@/components/dashboard-client"

export const metadata: Metadata = {
  title: "Dashboard — JamSquad",
  description: "Manage your game jam teams, track incoming applications, and keep your jammer profile up to date.",
}

export default function DashboardPage() {
  return <DashboardClient />
}
