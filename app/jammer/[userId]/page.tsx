import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { ProfileGamification } from "@/components/profile-gamification"
import { GamificationDashboard } from "@/components/gamification-dashboard"
import { ProfileCard } from "@/components/profile-card"
import { GiveKudosControl } from "@/components/give-kudos-control"
import { Button } from "@/components/ui/button"
import { levelFromTotalXp } from "@/lib/gamification-level"
import { usersShareATeam } from "@/lib/kudos-collaboration"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type PageProps = {
  params: Promise<{ userId: string }>
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
    .select("username, avatar_url, xp, current_title")
    .eq("id", userId)
    .maybeSingle()

  if (!profile?.username?.trim()) {
    notFound()
  }

  const publicXp = typeof profile.xp === "number" ? profile.xp : 0
  const publicLevel = levelFromTotalXp(publicXp)
  const publicTitle = profile.current_title?.trim() || "Rookie Jammer"

  const {
    data: { user: viewer },
  } = await supabase.auth.getUser()

  const viewerId = viewer?.id ?? null
  let viewerSharesTeamWithReceiver = false
  if (viewerId && viewerId !== userId) {
    viewerSharesTeamWithReceiver = await usersShareATeam(supabase, viewerId, userId)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/40 bg-card/30 px-4 py-12 lg:px-6 lg:py-16">
          <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
            <div className="absolute left-1/4 top-0 size-[420px] -translate-y-1/2 rounded-full bg-teal/15 blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 size-[380px] translate-y-1/3 rounded-full bg-lavender/15 blur-[90px]" />
          </div>
          <div className="relative mx-auto max-w-3xl">
            <Button variant="ghost" size="sm" className="-ml-2 mb-8 gap-2 text-muted-foreground" asChild>
              <Link href="/find-members">
                <ArrowLeft className="size-4" />
                Find teammates
              </Link>
            </Button>
            <div className="space-y-4">
              <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground sm:text-left">
                Public profile
              </p>
              <div className="w-full">
                <h1 className="sr-only">{profile.username}</h1>
                <ProfileCard
                  avatarUrl={profile.avatar_url ?? null}
                  displayName={profile.username}
                  fallbackName={profile.username}
                  currentTitle={publicTitle}
                  level={publicLevel}
                  size="lg"
                  framedAvatar
                  subtitle="Level, XP, and badges on GameJamCrew. Share this page to show your jammer cred."
                  className="w-full justify-center sm:justify-start"
                />
                <div className="flex justify-center pt-4 sm:justify-start">
                  <GiveKudosControl
                    receiverId={userId}
                    viewerUserId={viewerId}
                    viewerSharesTeamWithReceiver={viewerSharesTeamWithReceiver}
                    profileDisplayName={profile.username}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-10 lg:px-6 lg:py-14">
          <div className="mx-auto max-w-3xl space-y-6">
            <GamificationDashboard userId={userId} readOnly />
            <ProfileGamification userId={userId} badgesOnly />
          </div>
        </section>
      </main>
    </div>
  )
}
