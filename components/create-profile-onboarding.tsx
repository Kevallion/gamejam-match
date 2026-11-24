"use client"

import { useEffect, useRef, useState } from "react"
import { OnboardingModal } from "@/components/onboarding-modal"
import { Button } from "@/components/ui/button"

/**
 * /create-profile onboarding for signed-in users who have not finished setup.
 * The dialog is dismissible and does not call completeOnboarding on close.
 * A visible button stays on the page so the form can be opened again.
 */
export function CreateProfileOnboarding() {
  const [open, setOpen] = useState(true)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) {
      triggerRef.current?.focus()
    }
  }, [open])

  return (
    <div className="flex flex-col items-center gap-8">
      <OnboardingModal open={open} onOpenChange={setOpen} dismissible />
      <Button
        ref={triggerRef}
        type="button"
        className="min-h-12 rounded-xl px-6 text-base font-bold shadow-[3px_3px_0_0_var(--neo-shadow)]"
        onClick={() => setOpen(true)}
      >
        Set up your profile
      </Button>
    </div>
  )
}
