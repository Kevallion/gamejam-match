"use client"

import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { signInWithDiscord } from "@/lib/auth-utils"
import { toast } from "sonner"

export function SignInButton({ className }: { className?: string }) {
  const handleSignIn = async () => {
    try {
      await signInWithDiscord()
    } catch (error) {
      toast.error("Erreur de connexion", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      })
    }
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
