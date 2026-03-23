import type { Metadata } from "next"
import { ShowcaseShell } from "@/components/showcase/showcase-shell"

export const metadata: Metadata = {
  title: "Showcase — GameJamCrew",
  description:
    "Explore the GameJamCrew platform in action. See how indie developers find teams, post squads, and connect for game jams.",
  openGraph: {
    title: "Showcase — GameJamCrew",
    description:
      "Explore the GameJamCrew platform in action. See how indie developers find teams, post squads, and connect for game jams.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Showcase — GameJamCrew",
    description:
      "Explore the GameJamCrew platform in action. See how indie developers find teams, post squads, and connect for game jams.",
  },
}

export default function ShowcasePage() {
  return <ShowcaseShell />
}
