import type { Metadata } from "next"
import { FindMembersShell } from "@/components/find-members-shell"
import { getAvailablePlayers, type GamejamSupabaseClient } from "@/lib/queries"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Find Teammates — GameJamCrew",
  description: "Discover talented game jammers ready to join your squad. Filter by role, engine, and experience level to find the perfect match.",
  openGraph: {
    title: "Find Teammates — GameJamCrew",
    description:
      "Discover talented game jammers ready to join your squad. Filter by role, engine, and experience level to find the perfect match.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Teammates — GameJamCrew",
    description:
      "Discover talented game jammers ready to join your squad. Filter by role, engine, and experience level to find the perfect match.",
  },
}

type MembersPageProps = {
  searchParams: Promise<{
    q?: string
    role?: string
    engine?: string
    level?: string
    jam_id?: string
  }>
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams
  const supabase = (await createClient()) as unknown as GamejamSupabaseClient
  const { players, hasMore } = await getAvailablePlayers(
    {
      searchQuery: params.q,
      role: params.role,
      engine: params.engine,
      experience: params.level,
      jamId: params.jam_id,
      offset: 0,
    },
    supabase,
  )

  return (
    <FindMembersShell
      initialMembers={players}
      initialHasMore={hasMore}
    />
  )
}
