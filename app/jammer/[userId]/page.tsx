import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { ProfileGamification } from "@/components/profile-gamification"
import { ProfileCard } from "@/components/profile-card"
import { GiveKudosControl } from "@/components/give-kudos-control"
import { InviteToSquadControl, type OwnedSquadOption } from "@/components/invite-to-squad-control"
import { Button } from "@/components/ui/button"
import { levelFromTotalXp } from "@/lib/gamification-level"
import { usersShareATeam } from "@/lib/kudos-collaboration"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type PageProps = {
  params: Promise<{ userId: string }>
}

function normalizePortfolioUrl(url: string | null | undefined): string | null {
  const raw = url?.trim()
  if (!raw) return null
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw
  }
  return `https://${raw}`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params
  if (!UUID_RE.test(userId)) {
    return { title: "Profile — GameJamCrew" }
  }
  const supabase = await createClient()
  const { data } = await supabase.from("profiles").select("username").eq("id", userId).maybeSingle()
  const name = data?.username?.trim() || "Jammer"
  const title = `${name} — GameJamCrew`
  const description = `View ${name}'s public jammer profile, level, and badges on GameJamCrew.`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function JammerPublicProfilePage({ params }: PageProps) {
  const { userId } = await params
  if (!UUID_RE.test(userId)) {
    notFound()
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "username, avatar_url, xp, current_title, default_role, default_engine, portfolio_url, jam_style, default_language, profile_roles(role, experience_level, is_primary)",
    )
    .eq("id", userId)
    .maybeSingle()

  if (!profile) {
    notFound()
  }

  const displayName = profile.username?.trim() || "Jammer"

  const publicXp = typeof profile.xp === "number" ? profile.xp : 0
  const publicLevel = levelFromTotalXp(publicXp)
  const publicTitle = profile.current_title?.trim() || "Rookie Jammer"
  const publicPortfolioUrl = normalizePortfolioUrl(profile.portfolio_url ?? null)
  type ProfileRoleRow = {
    role?: string | null
    experience_level?: string | null
    is_primary?: boolean | null
  }
  const sortedRoles = ((profile.profile_roles ?? []) as ProfileRoleRow[])
    .filter((role) => role?.role?.trim())
    .sort((a, b) => Number(b.is_primary === true) - Number(a.is_primary === true))
  const roleSlots =
    sortedRoles.length > 0
      ? sortedRoles.map((row) => ({
          role: row.role!.trim(),
          experience_level: row.experience_level?.trim() || "regular",
          is_primary: row.is_primary === true,
        }))
      : null
  const primaryRole = sortedRoles[0]?.role?.trim() || profile.default_role || null
  const secondaryRole = sortedRoles[1]?.role?.trim() || null

  const {
    data: { user: viewer },
  } = await supabase.auth.getUser()

  const viewerId = viewer?.id ?? null
  let viewerSharesTeamWithReceiver = false
  let ownedSquads: OwnedSquadOption[] = []
  let alreadyInvitedTeamIds: string[] = []
  if (viewerId && viewerId !== userId) {
    viewerSharesTeamWithReceiver = await usersShareATeam(supabase, viewerId, userId)
    const { data: squads } = await supabase
      .from("teams")
      .select("id, team_name")
      .eq("user_id", viewerId)
      .order("created_at", { ascending: false })
    ownedSquads = (squads ?? []).map((squad) => ({
      id: squad.id as string,
      teamName: ((squad.team_name as string | null) ?? "Untitled squad").trim() || "Untitled squad",
    }))

    const viewerTeamIds = ownedSquads.map((squad) => squad.id)
    if (viewerTeamIds.length > 0) {
      const { data: existingInvitations } = await supabase
        .from("join_requests")
        .select("team_id")
        .eq("sender_id", userId)
        .eq("type", "invitation")
        .in("team_id", viewerTeamIds)
        .in("status", ["pending", "accepted"])

      alreadyInvitedTeamIds = (existingInvitations ?? [])
        .map((row) => row.team_id as string | null)
        .filter((id): id is string => Boolean(id))
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/40 bg-card/30 px-3 py-8 sm:px-4 sm:py-10 lg:px-6 lg:py-14">
          <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
            <div className="absolute left-1/4 top-0 size-[420px] -translate-y-1/2 rounded-full bg-teal/15 blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 size-[380px] translate-y-1/3 rounded-full bg-lavender/15 blur-[90px]" />
          </div>
          <div className="relative mx-auto max-w-3xl">
            <Button variant="ghost" size="sm" className="-ml-2 mb-5 gap-2 text-muted-foreground sm:mb-7" asChild>
              <Link href="/find-members">
                <ArrowLeft className="size-4" />
                Find teammates
              </Link>
            </Button>
            <div className="space-y-4 sm:space-y-5">
              <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground sm:text-left">
                Public profile
              </p>
              <div className="w-full rounded-2xl border border-border/50 bg-card/70 p-4 shadow-lg shadow-primary/5 backdrop-blur-sm sm:p-6">
                <h1 className="sr-only">{displayName}</h1>
                <ProfileCard
                  avatarUrl={profile.avatar_url ?? null}
                  displayName={displayName}
                  fallbackName={displayName}
                  currentTitle={publicTitle}
                  level={publicLevel}
                  defaultRole={roleSlots ? undefined : primaryRole}
                  secondaryRole={roleSlots ? undefined : secondaryRole}
                  jamStyle={profile.jam_style ?? null}
                  defaultLanguage={profile.default_language ?? null}
                  roleSlots={roleSlots}
                  defaultEngine={profile.default_engine ?? null}
                  portfolioUrl={profile.portfolio_url ?? null}
                  showPortfolioButton={false}
                  size="lg"
                  framedAvatar
                  subtitle="Level, title, and badges that showcase this jammer to recruiters."
                  className="w-full justify-start"
                />
                <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:flex-wrap sm:items-center">
                  {publicPortfolioUrl ? (
                    <Button asChild variant="outline" className="w-full gap-2 rounded-xl sm:w-auto">
                      <a href={publicPortfolioUrl} target="_blank" rel="noopener noreferrer">
                        Portfolio
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  ) : null}

                  <div className="w-full sm:w-auto">
                    <GiveKudosControl
                      receiverId={userId}
                      viewerUserId={viewerId}
                      viewerSharesTeamWithReceiver={viewerSharesTeamWithReceiver}
                      profileDisplayName={displayName}
                    />
                  </div>

                  <div className="w-full sm:w-auto">
                    <InviteToSquadControl
                      inviteeId={userId}
                      inviteeDisplayName={displayName}
                      viewerUserId={viewerId}
                      squads={ownedSquads}
                      alreadyInvitedTeamIds={alreadyInvitedTeamIds}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-3 py-6 sm:px-4 sm:py-8 lg:px-6 lg:py-10">
          <div className="mx-auto max-w-3xl space-y-6">
            <ProfileGamification userId={userId} badgesOnly unlockedOnly />
          </div>
        </section>
      </main>
    </div>
  )
}
