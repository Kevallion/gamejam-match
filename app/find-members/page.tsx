import type { Metadata } from "next"
import { FindMembersShell } from "@/components/find-members-shell"
import {
  getAvailablePlayers,
  getDirectoryJammers,
  type GamejamSupabaseClient,
} from "@/lib/queries"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Find Teammates — GameJamCrew",
  description:
    "Discover available jammers or browse the full directory. Filter by role, engine, language, and experience to find your next squadmate.",
  openGraph: {
    title: "Find Teammates — GameJamCrew",
    description:
      "Discover available jammers or browse the full directory. Filter by role, engine, language, and experience to find your next squadmate.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Teammates — GameJamCrew",
    description:
      "Discover available jammers or browse the full directory. Filter by role, engine, language, and experience to find your next squadmate.",
  },
}

type MembersPageProps = {
  searchParams: Promise<{
    q?: string
    role?: string
    engine?: string
    level?: string
    lang?: string
    jam_id?: string
    view?: string
  }>
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams
  const supabase = (await createClient()) as unknown as GamejamSupabaseClient
  const initialMode = params.view === "directory" ? "directory" : "available"
  const [{ players, hasMore }, directory] = await Promise.all([
    getAvailablePlayers(
      {
        searchQuery: params.q,
        role: params.role,
        engine: params.engine,
        experience: params.level,
        language: params.lang,
        jamId: params.jam_id,
        offset: 0,
      },
      supabase,
    ),
    getDirectoryJammers(
      {
        searchQuery: params.q,
        role: params.role,
        engine: params.engine,
        language: params.lang,
        offset: 0,
      },
      supabase,
    ),
  ])

  return (
    <FindMembersShell
      initialMembers={players}
      initialHasMore={hasMore}
      initialDirectory={directory.jammers}
      initialDirectoryHasMore={directory.hasMore}
      initialMode={initialMode}
    />
  )
}
