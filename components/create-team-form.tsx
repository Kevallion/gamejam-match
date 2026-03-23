"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import {
  FormStepIndicator,
  FormStepContent,
  FormStepActions,
  type FormStep,
} from "@/components/ui/form-step-indicator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, X, Rocket, Sparkles, Loader2, AlertCircle, CheckCircle2, Users, Settings, FileText } from "lucide-react"
import { SignInButton } from "@/components/sign-in-button"
import { toast } from "sonner"
import { track } from "@vercel/analytics"
import { ENGINE_OPTIONS, EXPERIENCE_OPTIONS, JAM_STYLE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"
import { JamSearchSelector } from "@/components/jam-search-selector"
import { createTeam } from "@/app/actions/create-team-actions"
import { showGamificationRewards } from "@/components/gamification-reward-toasts"
import { gamificationRewardHasToast } from "@/lib/gamification-reward-types"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

type RoleEntry = {
  id: number
  role: string
  level: string
}

const LANGUAGE_OPTIONS = [
  { value: "english", label: "English" },
  { value: "french", label: "French" },
  { value: "spanish", label: "Spanish" },
  { value: "portuguese", label: "Portuguese" },
  { value: "german", label: "German" },
  { value: "japanese", label: "Japanese" },
  { value: "korean", label: "Korean" },
  { value: "chinese", label: "Chinese" },
]

const TEAM_FORM_ENGINE_VALUES = new Set<string>(ENGINE_OPTIONS.map((o) => o.value))
const TEAM_FORM_LANGUAGE_VALUES = new Set<string>(LANGUAGE_OPTIONS.map((o) => o.value))

const FORM_STEPS: FormStep[] = [
  { id: 1, label: "Basics", description: "Team name & jam" },
  { id: 2, label: "Team Setup", description: "Engine & roles" },
  { id: 3, label: "Details", description: "Description & Discord" },
]

let roleIdCounter = 1

export function CreateTeamForm() {
  const router = useRouter()
  const totalSteps = FORM_STEPS.length
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [jamName, setJamName] = useState("")
  const [engine, setEngine] = useState("")
  const [language, setLanguage] = useState("")
  const [teamVibe, setTeamVibe] = useState("")
  const [experienceRequired, setExperienceRequired] = useState("")
  /** Single empty row so the user can type the first needed role without clicking "Add another role". */
  const [roles, setRoles] = useState<RoleEntry[]>([{ id: 0, role: "", level: "" }])
  const [discordLink, setDiscordLink] = useState("")
  const [jamId, setJamId] = useState<string | null>(null)
  const [description, setDescription] = useState("")

  // Error state per field
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [user, setUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const step1Ref = useRef<HTMLInputElement | null>(null)
  const step2Ref = useRef<HTMLButtonElement | null>(null)
  const step3Ref = useRef<HTMLTextAreaElement | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)
  /** Évite un second « clic » sur le bouton qui devient « Publish » au même endroit (surtout au tactile). */
  const [publishTapGuard, setPublishTapGuard] = useState(false)

  const fieldError = (field: string) => errors[field]

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const { [field]: _removed, ...rest } = prev
      return rest
    })
  }

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession()
      const nextUser = session?.user ?? null
      setUser(nextUser)

      if (nextUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("default_engine, default_language, engine, language")
          .eq("id", nextUser.id)
          .maybeSingle()

        if (profile) {
          const p = profile as {
            default_engine?: string | null
            default_language?: string | null
            engine?: string | null
            language?: string | null
          }
          const enginePref =
            p.default_engine?.trim() || p.engine?.trim() || ""
          const languagePref =
            p.default_language?.trim() || p.language?.trim() || ""

          if (enginePref && enginePref !== "any" && TEAM_FORM_ENGINE_VALUES.has(enginePref)) {
            setEngine(enginePref)
          }
          if (languagePref && languagePref !== "any" && TEAM_FORM_LANGUAGE_VALUES.has(languagePref)) {
            setLanguage(languagePref)
          }
        }
      }

      setCheckingAuth(false)
    }
    checkUser()
  }, [])

  useEffect(() => {
    if (step === 1) {
      step1Ref.current?.focus()
    } else if (step === 2) {
      step2Ref.current?.focus()
    } else if (step === 3) {
      step3Ref.current?.focus()
    }
  }, [step])

  useEffect(() => {
    if (step !== 3) {
      setPublishTapGuard(false)
      return
    }
    const id = window.setTimeout(() => setPublishTapGuard(false), 900)
    return () => clearTimeout(id)
  }, [step])

  function getCleanRoles() {
    return roles.filter((r) => r.role !== "" && r.level !== "")
  }

  function validateStep(currentStep: number) {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!teamName.trim()) {
        newErrors.teamName = "Team name is required"
      }
      if (!jamName.trim()) {
        newErrors.jamName = "Game jam name is required"
      }
    }

    if (currentStep === 2) {
      if (!engine) {
        newErrors.engine = "Please select an engine"
      }
      if (!language) {
        newErrors.language = "Please select a language"
      }
      const cleanRoles = getCleanRoles()
      if (cleanRoles.length < 1) {
        newErrors.roles = "Please add at least one role you are looking for"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }))
      toast.error("Please complete the required fields", {
        description: "Check the highlighted fields and try again.",
        icon: <AlertCircle className="size-5" />,
      })
      return false
    }

    return true
  }

  function goToNextStep() {
    if (!validateStep(step)) return
    if (step === 2) {
      setPublishTapGuard(true)
    }
    setStep((prev) => Math.min(prev + 1, totalSteps))
  }

  function goToPreviousStep() {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  function goToStep(targetStep: number) {
    // Only allow going back to completed steps
    if (targetStep < step) {
      setStep(targetStep)
    }
  }

  function handlePrimaryAction() {
    if (step < totalSteps) {
      goToNextStep()
      return
    }
    if (publishTapGuard) return
    formRef.current?.requestSubmit()
  }

  function addRole() {
    clearFieldError("roles")
    setRoles((prev) => [...prev, { id: roleIdCounter++, role: "", level: "" }])
  }

  function removeRole(id: number) {
    clearFieldError("roles")
    setRoles((prev) => prev.filter((r) => r.id !== id))
  }

  function updateRole(id: number, field: "role" | "level", value: string) {
    clearFieldError("roles")
    setRoles((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    if (step !== totalSteps) return

    // Ensure previous steps are valid before final submission
    if (!validateStep(1) || !validateStep(2)) {
      return
    }

    setLoading(true)
    setErrors({})

    const cleanRoles = getCleanRoles()
    if (cleanRoles.length < 1) {
      setLoading(false)
      setErrors((prev) => ({ ...prev, roles: "Please add at least one role" }))
      return
    }

    const discordLinkValue = discordLink.trim()
    if (
      discordLinkValue !== "" &&
      !/^https:\/\/discord\.(gg|com\/invite)\//.test(discordLinkValue)
    ) {
      setLoading(false)
      setErrors((prev) => ({ ...prev, discordLink: "Please enter a valid Discord invite link" }))
      return
    }

    try {
      const result = await createTeam({
        teamName: teamName.trim(),
        jamName: jamName.trim(),
        description: description.trim(),
        engine,
        language,
        lookingFor: cleanRoles,
        discordLink: discordLinkValue,
        teamVibe: teamVibe || null,
        experienceRequired: experienceRequired || null,
        jamId: jamId || null,
      })
      if (!result.success) {
        toast.error("Could not create the team", { 
          description: result.error,
          icon: <AlertCircle className="size-5" />,
        })
      } else {
        if (result.gamification && gamificationRewardHasToast(result.gamification)) {
          showGamificationRewards("CREATE_TEAM", result.gamification)
        }
        track("Created Team", { engine })
        toast.success("Team created successfully!", { 
          description: "Your listing is now live.",
          icon: <CheckCircle2 className="size-5" />,
        })
        setTeamName("")
        setJamName("")
        setEngine("")
        setLanguage("")
        setTeamVibe("")
        setExperienceRequired("")
        setDiscordLink("")
        setJamId(null)
        setErrors({})
        setDescription("")
        setRoles([{ id: roleIdCounter++, role: "", level: "" }])
        router.push(result.teamId ? `/teams/${result.teamId}/manage` : "/dashboard")
      }
    } catch (err) {
      toast.error("An error occurred", { 
        description: err instanceof Error ? err.message : "Please try again.",
        icon: <AlertCircle className="size-5" />,
      })
    } finally {
      setLoading(false)
    }
  }

  const stepDescriptions: Record<number, string> = {
    1: "Start by naming your team and the game jam.",
    2: "Set your engine, language, and roles needed.",
    3: "Add a description and optional Discord link.",
  }

  // Loading skeleton
  if (checkingAuth) {
    return (
      <Card className="rounded-3xl border-border/50 bg-card shadow-xl shadow-primary/5">
        <CardContent className="p-6 md:p-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="flex flex-col gap-2.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="flex flex-col gap-2.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Error message when not signed in */}
      {!checkingAuth && !user && (
        <Card className="mb-8 rounded-3xl border-destructive/50 bg-destructive/10">
          <CardContent className="p-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-destructive/20">
                <AlertCircle className="size-6 text-destructive" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-bold text-destructive">You must be signed in!</h3>
            <p className="mb-4 text-muted-foreground">Please sign in to post a team.</p>
            <SignInButton />
          </CardContent>
        </Card>
      )}

      {/* Form (shown only when user is signed in) */}
      {user && (
        <Card className="rounded-3xl border-border/50 bg-card shadow-xl shadow-primary/5">
          <CardContent className="p-6 md:p-10">
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Step Indicator */}
              <FormStepIndicator
                steps={FORM_STEPS}
                currentStep={step}
                onStepClick={goToStep}
                allowStepNavigation={true}
              />

              <div className="relative flex flex-col gap-8 pb-28 md:pb-10">
                {/* Step 1: Basics */}
                <FormStepContent step={1} currentStep={step}>
                  <div className="flex flex-col gap-6">
                    {/* Section header */}
                    <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-secondary/30 p-4">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                        <Users className="size-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Team Identity</h3>
                        <p className="text-xs text-muted-foreground">Let others know who you are</p>
                      </div>
                    </div>

                    {/* Team / Project Name */}
                    <div className="flex flex-col gap-2.5">
                      <Label htmlFor="teamName" className="text-sm font-bold text-foreground">
                        Team / Project Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="teamName"
                        name="teamName"
                        required
                        ref={step1Ref}
                        placeholder="e.g. The Pixel Knights"
                        value={teamName}
                        onChange={(e) => {
                          setTeamName(e.target.value)
                          clearFieldError("teamName")
                        }}
                        aria-invalid={!!fieldError("teamName")}
                        className={cn(
                          "h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground transition-colors",
                          fieldError("teamName") && "border-destructive focus-visible:ring-destructive/20"
                        )}
                      />
                      {fieldError("teamName") && (
                        <div className="status-error flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs">
                          <AlertCircle className="size-4 shrink-0" />
                          <span>{fieldError("teamName")}</span>
                        </div>
                      )}
                    </div>

                    {/* Game Jam Name */}
                    <div className="flex flex-col gap-2.5">
                      <Label htmlFor="jamName" className="text-sm font-bold text-foreground">
                        Game Jam Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="jamName"
                        name="jamName"
                        required
                        placeholder="e.g. Ludum Dare 57, GMTK 2026..."
                        value={jamName}
                        onChange={(e) => {
                          setJamName(e.target.value)
                          clearFieldError("jamName")
                        }}
                        aria-invalid={!!fieldError("jamName")}
                        className={cn(
                          "h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground transition-colors",
                          fieldError("jamName") && "border-destructive focus-visible:ring-destructive/20"
                        )}
                      />
                      {fieldError("jamName") && (
                        <div className="status-error flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs">
                          <AlertCircle className="size-4 shrink-0" />
                          <span>{fieldError("jamName")}</span>
                        </div>
                      )}
                    </div>

                    {/* Jam Itch.io (optional link) */}
                    <div className="flex flex-col gap-2.5">
                      <Label className="text-sm font-bold text-foreground">
                        Link to an Itch.io Jam{" "}
                        <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                      </Label>
                      <JamSearchSelector
                        value={jamId}
                        onValueChange={setJamId}
                        placeholder="Choose an Itch.io jam..."
                        syncOnOpen={true}
                        activeOnly={true}
                      />
                      <p className="text-xs text-muted-foreground">
                        Link your listing to an official jam for better visibility
                      </p>
                    </div>
                  </div>
                </FormStepContent>

                {/* Step 2: Team Setup */}
                <FormStepContent step={2} currentStep={step}>
                  <div className="flex flex-col gap-6">
                    {/* Section header */}
                    <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-secondary/30 p-4">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                        <Settings className="size-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Team Configuration</h3>
                        <p className="text-xs text-muted-foreground">Define your tech stack and team needs</p>
                      </div>
                    </div>

                    {/* Engine & Language row */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="flex flex-col gap-2.5">
                        <Label className="text-sm font-bold text-foreground">
                          Engine <span className="text-destructive">*</span>
                        </Label>
                        <Select 
                          value={engine} 
                          onValueChange={(v) => {
                            setEngine(v)
                            clearFieldError("engine")
                          }}
                          required
                        >
                          <SelectTrigger
                            ref={step2Ref}
                            className={cn(
                              "h-12 w-full rounded-xl border-border/60 bg-secondary/50",
                              fieldError("engine") && "border-destructive"
                            )}
                            aria-invalid={!!fieldError("engine")}
                          >
                            <SelectValue placeholder="Pick an engine" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {ENGINE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldError("engine") && (
                          <div className="status-error flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs">
                            <AlertCircle className="size-4 shrink-0" />
                            <span>{fieldError("engine")}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <Label className="text-sm font-bold text-foreground">
                          Spoken Language <span className="text-destructive">*</span>
                        </Label>
                        <Select 
                          value={language} 
                          onValueChange={(v) => {
                            setLanguage(v)
                            clearFieldError("language")
                          }}
                          required
                        >
                          <SelectTrigger 
                            className={cn(
                              "h-12 w-full rounded-xl border-border/60 bg-secondary/50",
                              fieldError("language") && "border-destructive"
                            )}
                            aria-invalid={!!fieldError("language")}
                          >
                            <SelectValue placeholder="Pick a language" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {LANGUAGE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldError("language") && (
                          <div className="status-error flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs">
                            <AlertCircle className="size-4 shrink-0" />
                            <span>{fieldError("language")}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Jam Style — full width to avoid dropdown overlap */}
                    <div className="flex flex-col gap-2.5">
                      <Label className="text-sm font-bold text-foreground">Jam Style</Label>
                      <Select value={teamVibe} onValueChange={setTeamVibe}>
                        <SelectTrigger className="h-12 w-full rounded-xl border-border/60 bg-secondary/50">
                          <SelectValue placeholder="What vibe is your team?" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {JAM_STYLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div>
                                <span className={`inline-flex items-center gap-2 rounded px-1.5 py-0.5 ${opt.color ?? "bg-muted text-muted-foreground"}`}>
                                  {opt.emoji} {opt.label}
                                </span>
                                <span className="ml-2 text-xs text-muted-foreground">— {opt.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Attracts jammers who match your team&apos;s energy.
                      </p>
                    </div>

                    {/* Experience Required */}
                    <div className="flex flex-col gap-2.5">
                      <Label className="text-sm font-bold text-foreground">Preferred Experience Level</Label>
                      <Select value={experienceRequired || "any"} onValueChange={setExperienceRequired}>
                        <SelectTrigger className="h-12 w-full rounded-xl border-border/60 bg-secondary/50">
                          <SelectValue placeholder="Minimum level (optional)" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="any">Any level</SelectItem>
                          {EXPERIENCE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span className={`inline-flex items-center gap-2 rounded px-1.5 py-0.5 ${opt.color ?? "bg-muted text-muted-foreground"}`}>
                                {opt.emoji} {opt.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Indicates the minimum experience you expect.
                      </p>
                    </div>

                    {/* Roles Needed */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold text-foreground">
                          Roles Needed <span className="text-destructive">*</span>
                        </Label>
                        <span className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                          getCleanRoles().length > 0 
                            ? "bg-success/10 text-success" 
                            : "bg-muted text-muted-foreground"
                        )}>
                          {getCleanRoles().length} role{getCleanRoles().length !== 1 ? "s" : ""} added
                        </span>
                      </div>

                      <div className="flex flex-col gap-3">
                        {roles.map((entry) => (
                          <div
                            key={entry.id}
                            className="group flex flex-col gap-3 rounded-2xl border border-border/40 bg-secondary/30 p-4 transition-colors hover:border-border/60 sm:flex-row sm:items-center"
                          >
                            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                              <Select value={entry.role} onValueChange={(v) => updateRole(entry.id, "role", v)}>
                                <SelectTrigger className="h-11 flex-1 rounded-xl border-border/50 bg-card text-foreground">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  {ROLE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Select value={entry.level} onValueChange={(v) => updateRole(entry.id, "level", v)}>
                                <SelectTrigger className="h-11 flex-1 rounded-xl border-border/50 bg-card text-foreground">
                                  <SelectValue placeholder="Experience" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  {EXPERIENCE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      <span className={`inline-flex items-center gap-2 rounded px-1.5 py-0.5 ${opt.color ?? "bg-muted text-muted-foreground"}`}>
                                        {opt.emoji} {opt.label}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {roles.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeRole(entry.id)}
                                className="size-9 shrink-0 self-end rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:self-auto"
                              >
                                <X className="size-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={addRole}
                        className="gap-2 self-start rounded-xl border-dashed border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary"
                      >
                        <Plus className="size-4" />
                        Add another role
                      </Button>
                      {fieldError("roles") && (
                        <div className="status-error flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
                          <AlertCircle className="size-4 shrink-0" />
                          <span>{fieldError("roles")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </FormStepContent>

                {/* Step 3: Final Details */}
                <FormStepContent step={3} currentStep={step}>
                  <div className="flex flex-col gap-6">
                    {/* Section header */}
                    <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-secondary/30 p-4">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                        <FileText className="size-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Final Details</h3>
                        <p className="text-xs text-muted-foreground">Share your vision and contact info</p>
                      </div>
                    </div>

                    {/* Discord Invitation Link */}
                    <div className="flex flex-col gap-2.5">
                      <Label htmlFor="discordLink" className="text-sm font-bold text-foreground">
                        Discord Invitation Link{" "}
                        <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                      </Label>
                      <Input
                        id="discordLink"
                        name="discordLink"
                        type="url"
                        placeholder="e.g. https://discord.gg/your-server"
                        value={discordLink}
                        onChange={(e) => {
                          setDiscordLink(e.target.value)
                          clearFieldError("discordLink")
                        }}
                        autoComplete="off"
                        aria-invalid={!!fieldError("discordLink")}
                        className={cn(
                          "h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground transition-colors",
                          fieldError("discordLink") && "border-destructive focus-visible:ring-destructive/20"
                        )}
                      />
                      {fieldError("discordLink") && (
                        <div className="status-error flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
                          <AlertCircle className="size-4 shrink-0" />
                          <span>{fieldError("discordLink")}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2.5">
                      <Label htmlFor="description" className="text-sm font-bold text-foreground">
                        Project Description / Vibe
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        required
                        ref={step3Ref}
                        placeholder="Tell people about your project idea..."
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="rounded-xl border-border/60 bg-secondary/50 text-foreground"
                      />
                    </div>

                    {/* Mini review */}
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
                      <div className="mb-3 flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-primary" />
                        <p className="font-semibold text-foreground">Quick preview before publishing</p>
                      </div>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="font-medium text-foreground">Team:</span>
                          {teamName || <span className="italic">Not set</span>}
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium text-foreground">Jam:</span>
                          {jamName || <span className="italic">Not set</span>}
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium text-foreground">Engine / Language:</span>
                          {engine || language
                            ? `${ENGINE_OPTIONS.find(e => e.value === engine)?.label || "Any"} • ${LANGUAGE_OPTIONS.find(l => l.value === language)?.label || "Any"}`
                            : <span className="italic">Not set</span>}
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium text-foreground">Roles needed:</span>
                          {getCleanRoles().length > 0
                            ? <span className="text-success">{getCleanRoles().length} role(s)</span>
                            : <span className="italic text-warning">No roles yet</span>}
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium text-foreground">Discord:</span>
                          {discordLink
                            ? <span className="truncate max-w-[200px]">{discordLink}</span>
                            : <span className="italic">No invite link</span>}
                        </li>
                      </ul>
                      <p className="mt-4 rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
                        Your listing will be visible for 30 days.
                      </p>
                    </div>
                  </div>
                </FormStepContent>

                {/* Sticky bottom actions */}
                <FormStepActions
                  currentStep={step}
                  totalSteps={totalSteps}
                  loading={loading}
                  disabled={step === totalSteps && publishTapGuard}
                  onPrevious={goToPreviousStep}
                  onNext={goToNextStep}
                  stepDescription={stepDescriptions[step]}
                  submitLabel="Publish Announcement"
                  submittingLabel="Publishing..."
                >
                  <Button
                    type="button"
                    disabled={loading || (step === totalSteps && publishTapGuard)}
                    onClick={handlePrimaryAction}
                    className="ml-auto flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] sm:flex-none sm:px-6"
                  >
                    {step === totalSteps ? (
                      loading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-4" />
                          Publish Announcement
                          <Rocket className="size-4" />
                        </>
                      )
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Next step
                      </>
                    )}
                  </Button>
                </FormStepActions>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  )
}
