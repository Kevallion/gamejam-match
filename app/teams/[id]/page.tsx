import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TeamPageClient } from "./team-page-client"

const TEAM_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Server gate for /teams/[id]: a real 404 when the squad does not exist (deleted, never
 * existed, or malformed id). Uses the cookie-aware server client, so it sees exactly what
 * the signed-in (or anonymous) visitor would see in the client page. A transient query
 * error is not treated as "missing": the client page keeps its own handling then.
 */
export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!TEAM_ID_RE.test(id)) notFound()

  const supabase = await createClient()
  const { data: team, error } = await supabase.from("teams").select("id").eq("id", id).maybeSingle()
  if (!error && !team) notFound()

  return <TeamPageClient />
}
