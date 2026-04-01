import type { Metadata } from "next"
import { ShowcaseShell } from "@/components/showcase/showcase-shell"

const showcaseDescription =
  "Step-by-step tour: search teams, post a squad, find members, and manage applications and invites in one place. Built for game jams without hopping between forums and Discord servers."

export const metadata: Metadata = {
  title: "How it works | GameJamCrew",
  description: showcaseDescription,
  openGraph: {
    title: "How it works | GameJamCrew",
    description: showcaseDescription,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How it works | GameJamCrew",
    description: showcaseDescription,
  },
}

export default function ShowcasePage() {
  return <ShowcaseShell />
}
