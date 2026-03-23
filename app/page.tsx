import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LandingHome } from "@/components/landing/landing-home"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }

  return <LandingHome />
}
