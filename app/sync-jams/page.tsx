import type { Metadata } from "next"
import { SyncJamsClient } from "./sync-jams-client"

export const metadata: Metadata = {
  title: "Sync Itch.io Jams — GameJamCrew",
  description: "Force sync game jams from itch.io into the database.",
}

export default function SyncJamsPage() {
  return (
    <main className="container mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-2xl font-bold">Sync Itch.io Jams</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Run the sync to fetch current jams from itch.io and fill the{" "}
        <code className="rounded bg-muted px-1 py-0.5">external_jams</code> table.
      </p>
      <SyncJamsClient />
    </main>
  )
}
