import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { AuthForm } from "@/components/auth-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Create an account — GameJamCrew",
  description: "Create a GameJamCrew account with Discord, Google, or a magic link.",
}

export default async function SignUpPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect("/dashboard")

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16 lg:px-6">
        <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card shadow-xl">
          <AuthForm initialMode="signup" />
        </div>
      </main>
    </div>
  )
}