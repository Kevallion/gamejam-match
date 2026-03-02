"use client"

import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export function SignInButton({ className }: { className?: string }) {
  const handleSignIn = async () => {
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo },
    })
    if (error) toast.error("Connection error", { description: error.message })
  }

  return (
    <Button
      onClick={handleSignIn}
      className={`gap-2 rounded-xl bg-[#5865F2] text-white hover:bg-[#4752C4] ${className ?? ""}`}
    >
      <LogIn className="size-4" />
      Sign in with Discord
    </Button>
  )
}
