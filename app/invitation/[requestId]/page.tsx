import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  InvitationRespondClient,
  type InvitationPageTeam,
} from "./invitation-respond-client"

type PageProps = {
  params: Promise<{ requestId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { requestId } = await params
  return {
    title: `Invitation — GameJamCrew`,
    description: `Review squad invitation ${requestId.slice(0, 8)}… on GameJamCrew.`,
  }
}

export default async function InvitationPage({ params }: PageProps) {
  const { requestId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16 md:pt-24">
          <Card className="rounded-2xl border-border/50 bg-card">
            <CardContent className="space-y-4 p-8 text-center">
              <h1 className="text-xl font-extrabold text-foreground">Sign in to view this invitation</h1>
              <p className="text-sm text-muted-foreground">
                Open GameJamCrew with the account that received the invite, then use the link from your email again.
              </p>
              <Button asChild className="w-full rounded-xl bg-teal text-teal-foreground hover:bg-teal/90">
                <Link href="/">Back to home</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const { data: row, error } = await supabase
    .from("join_requests")
    .select(
      `id, status, type, target_role, message, sender_id, team_id,
       teams (
         team_name, game_name, engine, description, team_vibe, experience_required, discord_link, user_id,
         external_jams (title)
       )`,
    )
    .eq("id", requestId)
    .maybeSingle()

  if (error || !row || row.type !== "invitation" || row.sender_id !== user.id) {
    notFound()
  }

  const teamRaw = row.teams as {
    team_name?: string | null
    game_name?: string | null
    engine?: string | null
    description?: string | null
    team_vibe?: string | null
    experience_required?: string | null
    discord_link?: string | null
    user_id?: string | null
    external_jams?: { title?: string | null } | { title?: string | null }[] | null
  } | null

  if (!teamRaw || !row.team_id) {
    notFound()
  }

  const jamRaw = teamRaw.external_jams
  const jam = Array.isArray(jamRaw) ? jamRaw[0] : jamRaw

  const team: InvitationPageTeam = {
    team_name: teamRaw.team_name ?? null,
    game_name: teamRaw.game_name ?? null,
    engine: teamRaw.engine ?? null,
    description: teamRaw.description ?? null,
    team_vibe: teamRaw.team_vibe ?? null,
    experience_required: teamRaw.experience_required ?? null,
    discord_link: teamRaw.discord_link ?? null,
    jam_title: jam?.title ?? null,
  }

  const captainId = teamRaw.user_id ?? null
  let captainUsername: string | null = null
  let captainAvatarUrl: string | null = null
  if (captainId) {
    const { data: cap } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", captainId)
      .maybeSingle()
    captainUsername = cap?.username ?? null
    captainAvatarUrl = cap?.avatar_url ?? null
  }

  return (
    <InvitationRespondClient
      requestId={row.id as string}
      status={row.status as string}
      targetRole={row.target_role as string | null}
      inviteMessage={row.message as string | null}
      teamId={row.team_id as string}
      team={team}
      captainUserId={captainId}
      captainUsername={captainUsername}
      captainAvatarUrl={captainAvatarUrl}
    />
  )
}
