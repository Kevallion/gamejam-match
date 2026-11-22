import { notFound } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Email preferences preview",
  robots: { index: false, follow: false },
}

/** Local review route (S3): both states of the email rows. 404 in production. */
export default async function DevEmailPreferencesPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound()
  }
  const { DevEmailPreferencesPreview } = await import("./preview")
  return <DevEmailPreferencesPreview />
}