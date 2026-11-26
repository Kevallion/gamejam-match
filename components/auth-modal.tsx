"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AuthForm } from "@/components/auth-form"
import type { AuthOtpPurpose } from "@/lib/auth-otp"

export interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Path to return to after sign-in (defaults to /dashboard). */
  next?: string
  initialMode?: AuthOtpPurpose
}

export function AuthModal({
  open,
  onOpenChange,
  next,
  initialMode = "signin",
}: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm max-h-[80vh] rounded-2xl border-border/60 bg-card p-0 shadow-xl overflow-y-auto sm:max-w-sm sm:max-h-[90vh]">
        <DialogHeader className="sr-only">
          <DialogTitle>Sign in or create a GameJamCrew account</DialogTitle>
          <DialogDescription>Choose how you want to continue with Discord, Google, or email.</DialogDescription>
        </DialogHeader>
        {open ? <AuthForm key={initialMode} initialMode={initialMode} next={next} /> : null}
      </DialogContent>
    </Dialog>
  )
}