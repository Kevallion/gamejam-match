import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FindMembersShell } from "@/components/find-members-shell"

export const metadata: Metadata = {
  title: "Find Teammates — GameJamCrew",
  description: "Discover talented game jammers ready to join your squad. Filter by role, engine, and experience level to find the perfect match.",
}

export default async function MembersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  return <FindMembersShell />
}
