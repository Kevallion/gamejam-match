"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { completeOnboarding } from "@/app/actions/onboarding-actions"
import { showGamificationRewardBatch } from "@/components/gamification-reward-toasts"
import { ENGINE_OPTIONS, LANGUAGE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Gamepad2,
  Hand,
  Languages,
  Link2,
  Loader2,
  MessageSquareMore,
  Search,
  User,
  UserSearch,
  Users,
} from "lucide-react"

interface OnboardingModalProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  profile?: {
    username?: string | null
    default_role?: string | null
    default_engine?: string | null
    default_language?: string | null
    discord_username?: string | null
    portfolio_url?: string | null
  } | null
}

const TOTAL_STEPS = 3

const CHOICE_OPTIONS = [
  {
    id: "looking-for-team",
    title: "I am looking for a team",
    description: "Find an existing squad and join a project that matches your skills.",
    href: "/",
    icon: Search,
  },
  {
    id: "looking-for-jammers",
    title: "I am looking for jammers",
    description: "Browse available profiles and discover teammates for your next jam.",
    href: "/find-members",
    icon: UserSearch,
  },
  {
    id: "create-team",
    title: "I want to create a team",
    description: "Start a new squad and recruit the right people around your idea.",
    href: "/create-team",
    icon: Flag,
  },
  {
    id: "available-for-jam",
    title: "I am available for a Game Jam",
    description: "Publish your profile and let teams know you are ready to join.",
    href: "/create-profile",
    icon: Hand,
  },
] as const

export function OnboardingModal({ open, onOpenChange, profile }: OnboardingModalProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedChoice, setSelectedChoice] = useState<(typeof CHOICE_OPTIONS)[number] | null>(null)
  const [username, setUsername] = useState("")
  const [usernameTouched, setUsernameTouched] = useState(false)
  const [defaultRole, setDefaultRole] = useState("")
  const [defaultEngine, setDefaultEngine] = useState("")
  const [defaultLanguage, setDefaultLanguage] = useState("")
  const [discordUsername, setDiscordUsername] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")
  const [publishImmediately, setPublishImmediately] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    setStep(1)
    setSelectedChoice(null)
    setUsername(profile?.username?.trim() ?? "")
    setUsernameTouched(false)
    setDefaultRole(profile?.default_role?.trim() ?? "")
    setDefaultEngine(profile?.default_engine?.trim() ?? "")
    setDefaultLanguage(profile?.default_language?.trim() ?? "")
    setDiscordUsername(profile?.discord_username?.trim() ?? "")
    setPortfolioUrl(profile?.portfolio_url?.trim() ?? "")
    setPublishImmediately(false)
    setIsSubmitting(false)
  }, [
    open,
    profile?.username,
    profile?.default_engine,
    profile?.default_language,
    profile?.default_role,
    profile?.discord_username,
    profile?.portfolio_url,
  ])

  const trimmedUsername = username.trim()
  const usernameInvalidEmpty = trimmedUsername.length === 0
  const usernameInvalidShort = trimmedUsername.length > 0 && trimmedUsername.length < 3
  const showUsernameError = usernameInvalidShort || (usernameTouched && usernameInvalidEmpty)
  const usernameErrorMessage = usernameInvalidShort
    ? "At least 3 characters."
    : usernameInvalidEmpty
      ? "Username is required."
      : null

  const progressValue = (step / TOTAL_STEPS) * 100

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return
    onOpenChange?.(nextOpen)
  }

  const assertUsernameValid = (): boolean => {
    setUsernameTouched(true)
    if (!trimmedUsername) {
      toast.error("Choose a username", { description: "Username is required." })
      return false
    }
    if (trimmedUsername.length < 3) {
      toast.error("Username too short", { description: "Use at least 3 characters." })
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 2 && !selectedChoice) {
      toast.error("Choose what you want to do first.", {
        description: "Select one option before continuing.",
      })
      return
    }

    setStep((currentStep) => Math.min(currentStep + 1, TOTAL_STEPS))
  }

  const handleBack = () => {
    setStep((currentStep) => Math.max(currentStep - 1, 1))
  }

  const handleFinish = async () => {
    if (!selectedChoice) {
      toast.error("Choose what you want to do first.", {
        description: "Select one option before finishing onboarding.",
      })
      setStep(1)
      return
    }

    if (!assertUsernameValid()) {
      setStep(1)
      return
    }

    setIsSubmitting(true)
    try {
      const result = await completeOnboarding({
        username: trimmedUsername,
        defaultRole,
        defaultEngine,
        defaultLanguage,
        discordUsername,
        portfolioUrl,
        publishImmediately,
      })

      if (!result.success) {
        toast.error("Error", { description: result.error ?? "Please try again." })
        return
      }

      if (result.gamification?.length) {
        void showGamificationRewardBatch(result.gamification)
      }

      toast.success("You're all set!", {
        description: "Your onboarding preferences have been saved.",
      })

      if (result.warning) {
        toast.error("Profile not published automatically.", {
          description: result.warning,
        })
      }

      onOpenChange?.(false)
      router.push(selectedChoice.href)
    } catch {
      toast.error("An error occurred.", { description: "Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const STEP_CONTENT = {
    1: {
      title: "Welcome to GameJamCrew! 👋",
      description: "What brings you here today?",
    },
    2: {
      title: "Set your Default Preferences",
      description: "Set this up once, and applying to jams will be a 1-click action later.",
    },
    3: {
      title: "Where can people find you?",
      description: "Add the contact links that help future teammates reach out quickly.",
    },
  } as const
  const stepContent = STEP_CONTENT[step as 1 | 2 | 3] ?? STEP_CONTENT[1]

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        data-onboarding-version="2"
        className="max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] rounded-3xl border-border/60 bg-background p-0 shadow-2xl sm:max-w-xl"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="px-6 pt-6">
          <DialogHeader className="space-y-2 text-center">
            <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {stepContent.title}
            </DialogTitle>
            <DialogDescription className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {stepContent.description}
            </DialogDescription>
          </DialogHeader>
          <Progress value={progressValue} className="mt-4 h-1.5" />
        </div>

        <div className="px-6 pt-6 pb-8 sm:pb-10">
          {step === 1 && (
            <div className="mt-6 space-y-5">
              <div
                className={cn(
                  "space-y-2 rounded-2xl border bg-muted/20 p-4 transition-colors",
                  showUsernameError ? "border-destructive/40" : "border-border/60"
                )}
              >
                <Label htmlFor="onboarding-username" className="flex items-center gap-2 text-sm font-medium">
                  <User className="size-4 text-lavender" />
                  Username
                </Label>
                <Input
                  id="onboarding-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => setUsernameTouched(true)}
                  placeholder="Your jammer name"
                  autoComplete="username"
                  aria-invalid={showUsernameError}
                  aria-describedby="onboarding-username-hint"
                  className="h-11 rounded-xl border-border/60 bg-background"
                />
                <p id="onboarding-username-hint" className="text-xs leading-relaxed text-muted-foreground">
                  This is how you will appear to other jammers.
                </p>
                {showUsernameError && usernameErrorMessage ? (
                  <p className="text-xs font-medium text-destructive">{usernameErrorMessage}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {CHOICE_OPTIONS.map((option) => {
                const Icon = option.icon
                const isActive = selectedChoice?.id === option.id

                return (
                  <Button
                    key={option.id}
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (!assertUsernameValid()) return
                      setSelectedChoice(option)
                      setStep(2)
                    }}
                    className={cn(
                      "h-auto min-h-[5rem] flex-col items-start justify-between whitespace-normal rounded-2xl border-border/60 p-4 py-4 text-left transition-all",
                      "hover:border-lavender/60 hover:bg-lavender/5 hover:shadow-lg hover:shadow-lavender/10",
                      isActive && "border-lavender bg-lavender/10 shadow-lg shadow-lavender/10"
                    )}
                  >
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-lavender/15 text-lavender">
                      <Icon className="size-5" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-lg font-semibold text-foreground">{option.title}</div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{option.description}</p>
                    </div>
                  </Button>
                )
              })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-4">
                <Label htmlFor="onboarding-default-role" className="flex items-center gap-2 text-sm font-medium">
                  <Search className="size-4 text-lavender" />
                  Default Role
                </Label>
                <Select value={defaultRole || "none"} onValueChange={(value) => setDefaultRole(value === "none" ? "" : value)}>
                  <SelectTrigger id="onboarding-default-role" className="h-11 rounded-xl border-border/60 bg-background">
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="none">None / No default</SelectItem>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Your main contribution when joining a jam.</p>
              </div>

              <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-4">
                <Label htmlFor="onboarding-default-engine" className="flex items-center gap-2 text-sm font-medium">
                  <Gamepad2 className="size-4 text-lavender" />
                  Default Engine
                </Label>
                <Select value={defaultEngine || "none"} onValueChange={(value) => setDefaultEngine(value === "none" ? "" : value)}>
                  <SelectTrigger id="onboarding-default-engine" className="h-11 rounded-xl border-border/60 bg-background">
                    <SelectValue placeholder="Choose an engine" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="none">None / No default</SelectItem>
                    {ENGINE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Pre-fill the engine you use most often.</p>
              </div>

              <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-4">
                <Label htmlFor="onboarding-default-language" className="flex items-center gap-2 text-sm font-medium">
                  <Languages className="size-4 text-lavender" />
                  Default Language
                </Label>
                <Select value={defaultLanguage || "none"} onValueChange={(value) => setDefaultLanguage(value === "none" ? "" : value)}>
                  <SelectTrigger id="onboarding-default-language" className="h-11 rounded-xl border-border/60 bg-background">
                    <SelectValue placeholder="Choose a language" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="none">None / No default</SelectItem>
                    {LANGUAGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Set your preferred communication language.</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <Label htmlFor="onboarding-discord" className="flex items-center gap-2 text-sm font-medium">
                    <MessageSquareMore className="size-4 text-lavender" />
                    Discord Username
                  </Label>
                  <Input
                    id="onboarding-discord"
                    value={discordUsername}
                    onChange={(event) => setDiscordUsername(event.target.value)}
                    placeholder="e.g. jammer_42"
                    className="h-11 rounded-xl border-border/60 bg-background"
                  />
                  <p className="text-xs text-muted-foreground">This helps teammates message you quickly after matching.</p>
                </div>

                <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <Label htmlFor="onboarding-portfolio" className="flex items-center gap-2 text-sm font-medium">
                    <Link2 className="size-4 text-lavender" />
                    Portfolio URL
                  </Label>
                  <Input
                    id="onboarding-portfolio"
                    type="url"
                    value={portfolioUrl}
                    onChange={(event) => setPortfolioUrl(event.target.value)}
                    placeholder="https://yourportfolio.com"
                    className="h-11 rounded-xl border-border/60 bg-background"
                  />
                  <p className="text-xs text-muted-foreground">Share your itch.io page, website, or portfolio.</p>
                </div>
              </div>

              <Card
                className={cn(
                  "overflow-hidden rounded-2xl border-2 shadow-sm transition-colors",
                  publishImmediately
                    ? "border-lavender/50 bg-lavender/10 shadow-lavender/10"
                    : "border-border/80 bg-muted/40",
                )}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-lavender/15 text-lavender">
                          <Users className="size-4" />
                        </div>
                        <Label
                          htmlFor="publish-immediately"
                          className="cursor-pointer text-base font-semibold leading-snug text-foreground"
                        >
                          Publish my profile to the &apos;Members&apos; list immediately
                        </Label>
                      </div>
                      <p
                        id="publish-immediately-description"
                        className="text-sm leading-relaxed text-muted-foreground pl-0 sm:pl-11"
                      >
                        If active, we will automatically create an availability post for you so teams can start
                        recruiting you right away. You can manage or delete this later in your Dashboard.
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center justify-end sm:pt-1">
                      <Switch
                        id="publish-immediately"
                        checked={publishImmediately}
                        onCheckedChange={setPublishImmediately}
                        className="data-[state=checked]:bg-lavender"
                        aria-describedby="publish-immediately-description"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="mt-8 border-t border-border/60 pt-5 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
              className="gap-2 rounded-xl"
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>

            {step > 1 ? (
              <Button
                type="button"
                onClick={step === TOTAL_STEPS ? handleFinish : handleNext}
                disabled={isSubmitting}
                className="gap-2 rounded-xl bg-lavender text-lavender-foreground shadow-lg shadow-lavender/20 hover:bg-lavender/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Finishing...
                  </>
                ) : step === TOTAL_STEPS ? (
                  <>
                    Finish
                    <ChevronRight className="size-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="size-4" />
                  </>
                )}
              </Button>
            ) : (
              <div />
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
