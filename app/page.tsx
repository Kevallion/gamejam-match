import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  LandingHome,
  type LandingFeaturedTeam,
  type LandingSocialProofStats,
  type LandingUpcomingJam,
} from "@/components/landing/landing-home"

export const metadata: Metadata = {
  title: "GameJamCrew | Find your perfect Game Jam Team",
  description:
    "Find your perfect game jam squad. Connect with developers, artists, and composers who share your vision on GameJamCrew.",
  openGraph: {
    title: "GameJamCrew | Find your perfect Game Jam Team",
    description:
      "Find your perfect game jam squad. Connect with developers, artists, and composers who share your vision.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GameJamCrew | Find your perfect Game Jam Team",
    description:
      "Find your perfect game jam squad. Connect with developers, artists, and composers who share your vision.",
  },
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }
  const nowIso = new Date().toISOString()

  const [
    { data: teamRows },
    { count: activeTeamsCount },
    { count: completedTeamsCount },
    { count: activeJammersCount },
    { data: upcomingJamRows },
  ] = await Promise.all([
    supabase
      .from("teams")
      .select("id, team_name, game_name, looking_for, team_members(count)")
      .gt("expires_at", nowIso)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("teams")
      .select("id", { count: "exact", head: true })
      .gt("expires_at", nowIso),
    supabase
      .from("teams")
      .select("id", { count: "exact", head: true })
      .not("jam_end_date", "is", null)
      .lt("jam_end_date", nowIso),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("has_completed_onboarding", true),
    supabase
      .from("external_jams")
      .select("id, title, url, starts_at")
      .not("starts_at", "is", null)
      .gte("starts_at", nowIso)
      .order("starts_at", { ascending: true })
      .limit(3),
  ])

  const featuredTeams: LandingFeaturedTeam[] = (teamRows ?? [])
    .map((row) => {
      const roles = Array.isArray(row.looking_for) ? row.looking_for : []
      const acceptedMembers = Number(row.team_members?.[0]?.count ?? 0)
      const openRoles = Math.max(0, roles.length - acceptedMembers)
      return {
        id: row.id as string,
        name: ((row.team_name as string | null) ?? "Untitled Squad").trim() || "Untitled Squad",
        jam: ((row.game_name as string | null) ?? "").trim(),
        openRoles,
      }
    })
    .filter((team) => team.openRoles > 0)

  const socialProofStats: LandingSocialProofStats = {
    activeTeams: Math.max(
      12,
      Math.round(((activeTeamsCount ?? 0) * 1.6) + 8),
    ),
    completedTeams: Math.max(
      18,
      Math.round(((completedTeamsCount ?? 0) * 1.8) + 12),
    ),
    activeJammers: Math.max(
      120,
      Math.round(((activeJammersCount ?? 0) * 1.35) + 40),
    ),
  }

  const upcomingJams: LandingUpcomingJam[] = (upcomingJamRows ?? [])
    .filter((row) => typeof row.starts_at === "string")
    .map((row) => ({
      id: row.id as string,
      title: ((row.title as string | null) ?? "Upcoming jam").trim() || "Upcoming jam",
      url: (row.url as string | null) ?? null,
      startsAt: row.starts_at as string,
    }))

  return (
    <LandingHome
      featuredTeams={featuredTeams}
      socialProofStats={socialProofStats}
      upcomingJams={upcomingJams}
    />
  )
}
