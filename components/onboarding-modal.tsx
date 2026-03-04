"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Search, UserSearch, Flag, Hand } from "lucide-react"
import { completeOnboarding } from "@/app/actions/onboarding-actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface OnboardingModalProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
}

const CHOICES = [
  {
    id: "teams",
    emoji: "🔍",
    label: "I'm looking for a team",
    href: "/",
    icon: Search,
  },
  {
    id: "jammers",
    emoji: "🕵️‍♂️",
    label: "I'm looking for a jammer",
    href: "/find-members",
    icon: UserSearch,
  },
  {
    id: "build",
    emoji: "🚩",
    label: "I want to build a team",
    href: "/create-team",
    icon: Flag,
  },
  {
    id: "available",
    emoji: "🙋‍♂️",
    label: "I'm available for a Game Jam",
    href: "/create-profile",
    icon: Hand,
  },
] as const

export function OnboardingModal({ open, onOpenChange }: OnboardingModalProps) {
  const router = useRouter()
  const [loadingChoice, setLoadingChoice] = useState<string | null>(null)

  const handleChoice = async (choice: (typeof CHOICES)[number]) => {
    setLoadingChoice(choice.id)
    try {
      const result = await completeOnboarding()
      if (!result.success) {
        toast.error("Error", { description: result.error ?? "Please try again." })
        setLoadingChoice(null)
        return
      }
      onOpenChange?.(false)
      router.push(choice.href)
    } catch {
      toast.error("An error occurred.", { description: "Please try again." })
      setLoadingChoice(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md rounded-2xl border-border/60"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Welcome to GameJamCrew! 🚀
          </DialogTitle>
          <DialogDescription className="text-base mt-1">
            What are you looking to do today?
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 mt-6">
          {CHOICES.map((choice) => {
            const Icon = choice.icon
            const isLoading = loadingChoice === choice.id

            return (
              <Button
                key={choice.id}
                variant="outline"
                className="h-auto min-h-[52px] justify-start gap-3 px-4 py-3 text-left font-medium rounded-xl border-border/60 hover:bg-accent/50 hover:border-primary/30 transition-colors"
                onClick={() => handleChoice(choice)}
                disabled={loadingChoice !== null}
              >
                {isLoading ? (
                  <Loader2 className="size-5 shrink-0 animate-spin text-primary" />
                ) : (
                  <span className="text-xl shrink-0">{choice.emoji}</span>
                )}
                <span className="flex-1">{choice.label}</span>
                {!isLoading && <Icon className="size-4 shrink-0 text-muted-foreground" />}
              </Button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
