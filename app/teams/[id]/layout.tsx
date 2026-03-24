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
    return { title: "Team Not Found | GameJamCrew" }
  }

  const title = `${team.team_name} is recruiting! | GameJamCrew`
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
      siteName: "GameJamCrew",
      images: ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
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
