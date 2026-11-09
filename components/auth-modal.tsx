"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GoogleIcon } from "@/components/brand-icons"
import { LoaderCircle, LogIn } from "lucide-react"
import { signInWithDiscord, signInWithGoogle } from "@/lib/auth-utils"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Path to return to after sign-in (defaults to /dashboard). */
  next?: string
}

export function AuthModal({ open, onOpenChange, next }: AuthModalProps) {
  const returnTo = next && next.startsWith("/") ? next : "/dashboard"
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [isMagicLoading, setIsMagicLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)

  const handleSignInDiscord = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      await signInWithDiscord({ next: returnTo })
    } catch (error) {
      toast.error("Sign-in error", {
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      })
      setIsLoading(false)
    }
  }

  const handleSignInGoogle = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      await signInWithGoogle({ next: returnTo })
    } catch (error) {
      toast.error("Sign-in error", {
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      })
      setIsLoading(false)
    }
  }

  const handleMagicLink = async (event?: React.FormEvent) => {
    event?.preventDefault()
    if (isMagicLoading || !email.trim()) return
    setIsMagicLoading(true)
    setMagicSent(false)
    try {
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || "https://gamejamcrew.com"

      const redirectTo = `${baseUrl}/auth/callback?next=${encodeURIComponent(returnTo)}`

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          // En production : https://gamejamcrew.com/auth/callback?next=<returnTo>
          emailRedirectTo: redirectTo,
        },
      })

      if (error) {
        toast.error("Unable to send magic link", {
          description: error.message,
        })
        setIsMagicLoading(false)
        return
      }

      setMagicSent(true)
      setIsMagicLoading(false)
      toast.success("Magic link sent", {
        description: "Check your inbox (and spam folder) to sign in.",
      })
    } catch (error) {
      toast.error("Something went wrong", {
        description: error instanceof Error ? error.message : "Please try again.",
      })
      setIsMagicLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm max-h-[80vh] rounded-2xl border-border/60 bg-card p-0 shadow-xl overflow-y-auto sm:max-w-sm sm:max-h-[90vh]">
        <DialogHeader className="space-y-1.5 px-5 pt-5 pb-3 text-center">
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Welcome to GameJamCrew
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choose how you want to sign in.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 px-5 pb-5">
          <Button
            onClick={handleSignInDiscord}
            disabled={isLoading}
            className="w-full gap-2 rounded-xl bg-[#5865F2] text-white hover:bg-[#4752C4]"
          >
            {isLoading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <LogIn className="size-4" />
            )}
            Continue with Discord
          </Button>

          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">OR</span>
            </div>
          </div>

          <Button
            onClick={handleSignInGoogle}
            disabled={isLoading}
            variant="outline"
            className="w-full gap-2 rounded-xl border-border bg-background"
          >
            {isLoading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <GoogleIcon className="size-4" />
            )}
            Continue with Google
          </Button>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or use your email</span>
            </div>
          </div>

          <form onSubmit={handleMagicLink} className="flex flex-col gap-2">
            <Input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-xl border-border/60 bg-background text-foreground"
            />
            <Button
              type="submit"
              disabled={isMagicLoading || magicSent}
              className="w-full gap-2 rounded-xl"
              variant="secondary"
            >
              {isMagicLoading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : null}
              {magicSent ? "Link sent — check your email" : "Sign in with a magic link"}
            </Button>
          </form>

          {magicSent && (
            <p className="mt-1 text-xs text-center text-emerald-500">
              Magic link sent. Please check your inbox (and possibly your spam folder).
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
