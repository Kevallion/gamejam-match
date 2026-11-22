import { notFound } from "next/navigation"
import { Suspense } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard preview",
  robots: { index: false, follow: false },
}

/**
 * Local review route with realistic dashboard data.
 * Production builds hit notFound() before the preview chunk is loaded.
 */
export default async function DevDashboardPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound()
  }
  const { DevDashboardPreview } = await import("./preview")
  return (
    <Suspense fallback={null}>
      <DevDashboardPreview />
    </Suspense>
  )
}
