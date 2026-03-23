import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Manage squad — GameJamCrew",
  description:
    "Edit your team listing, review members, and manage invitations. Squad management for your game jam team on GameJamCrew.",
  openGraph: {
    title: "Manage squad — GameJamCrew",
    description:
      "Edit your team listing, review members, and manage invitations on GameJamCrew.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manage squad — GameJamCrew",
    description:
      "Edit your team listing, review members, and manage invitations on GameJamCrew.",
  },
}

export default function ManageTeamLayout({ children }: { children: React.ReactNode }) {
  return children
}
