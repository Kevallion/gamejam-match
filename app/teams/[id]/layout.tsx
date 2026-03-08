import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: team } = await supabase
    .from("teams")
    .select("team_name, game_name, description")
    .eq("id", id)
    .single()

  if (!team) {
    return { title: "Team Not Found | GameJam Crew" }
  }

  const title = `${team.team_name} is recruiting! | GameJam Crew`
  const description = team.description
    ? team.description.substring(0, 150) + "..."
    : `Join ${team.team_name} for the ${team.game_name ?? "game jam"} jam!`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "GameJam Crew",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No auth redirect: /teams/[id] can show public announcement for shared links
  return <>{children}</>
}
