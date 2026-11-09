"use client"

import { DashboardClient } from "@/components/dashboard-client"
import { dashboardFixture } from "./fixture"

/** Populated dashboard used only by the dev preview route. */
export function DevDashboardPreview() {
  return <DashboardClient fixture={dashboardFixture} />
}
