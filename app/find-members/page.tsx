import type { Metadata } from "next"
import { FindMembersShell } from "@/components/find-members-shell"

export const metadata: Metadata = {
  title: "Find Teammates — GameJamCrew",
  description: "Discover talented game jammers ready to join your squad. Filter by role, engine, and experience level to find the perfect match.",
}

export default function MembersPage() {
  return <FindMembersShell />
}
