"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DateRangeField } from "@/components/date-range-field"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, X, Rocket, Sparkles, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { SignInButton } from "@/components/sign-in-button"
import { toast } from "sonner"
import { track } from "@vercel/analytics"
import { ENGINE_OPTIONS, EXPERIENCE_OPTIONS, JAM_STYLE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"
import { JamSearchSelector } from "@/components/jam-search-selector"
import { createTeam } from "@/app/actions/create-team-actions"
import { showGamificationRewards } from "@/components/gamification-reward-toasts"
import { gamificationRewardHasToast } from "@/lib/gamification-reward-types"
import { dateInputToUtcEnd, dateInputToUtcStart } from "@/lib/jam-date-utc"
import { dateRangeFromExternalJam } from "@/lib/jam-dates-from-external"
import type { ExternalJam } from "@/app/actions/jam-actions"

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

/** Retourne les bornes YYYY-MM-DD si début et fin sont choisis. */
function jamRangeToYmd(range: DateRange | undefined): { start: string; end: string } | null {
  if (!range?.from || !range?.to) return null
  return {
    start: format(range.from, "yyyy-MM-dd"),
    end: format(range.to, "yyyy-MM-dd"),
  }
}

let roleIdCounter = 1

export function CreateTeamForm() {
  const router = useRouter()
  const totalSteps = 3
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
  const [discordLinkError, setDiscordLinkError] = useState("")
  const [rolesError, setRolesError] = useState("")
  const [jamId, setJamId] = useState<string | null>(null)
  const [jamDateRange, setJamDateRange] = useState<DateRange | undefined>(undefined)

  const handleJamMetaChange = useCallback((jam: ExternalJam | null) => {
    if (!jam) return
    const title = jam.title?.trim()
    if (title) setJamName(title)
    const range = dateRangeFromExternalJam(jam)
    if (range) setJamDateRange(range)
  }, [])
  const [description, setDescription] = useState("")

  const [user, setUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const step1Ref = useRef<HTMLInputElement | null>(null)
  const step2Ref = useRef<HTMLButtonElement | null>(null)
  const step3Ref = useRef<HTMLTextAreaElement | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)
  /** Évite un second « clic » sur le bouton qui devient « Publish » au même endroit (surtout au tactile). */
  const [publishTapGuard, setPublishTapGuard] = useState(false)

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
    if (currentStep === 1) {
      if (!teamName.trim() || !jamName.trim()) {
        toast.error("Please complete the required basics.", {
          description: "Team / Project Name and Game Jam Name are required.",
        })
        return false
      }
      const ymd = jamRangeToYmd(jamDateRange)
      if (!ymd) {
        toast.error("Jam dates required.", {
          description: "Choose when your jam starts and ends so your listing stays accurate.",
        })
        return false
      }
      const startMs = new Date(dateInputToUtcStart(ymd.start)).getTime()
      const endMs = new Date(dateInputToUtcEnd(ymd.end)).getTime()
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs >= endMs) {
        toast.error("Invalid jam dates.", {
          description: "Jam end must be after jam start.",
        })
        return false
      }
    }

    if (currentStep === 2) {
      let valid = true
      const cleanRoles = getCleanRoles()

      if (!engine) {
        valid = false
      }
      if (!language) {
        valid = false
      }
      if (cleanRoles.length < 1) {
        setRolesError("Please select at least one role you are looking for.")
        valid = false
      }

      if (!valid) {
        toast.error("Please complete the team setup.", {
          description: "Engine, language and at least one role are required.",
        })
        return false
      }
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

  function handlePrimaryAction() {
    if (step < totalSteps) {
      goToNextStep()
      return
    }
    if (publishTapGuard) return
    formRef.current?.requestSubmit()
  }

  function addRole() {
    setRolesError("")
    setRoles((prev) => [...prev, { id: roleIdCounter++, role: "", level: "" }])
  }

  function removeRole(id: number) {
    setRolesError("")
    setRoles((prev) => prev.filter((r) => r.id !== id))
  }

  function updateRole(id: number, field: "role" | "level", value: string) {
    setRolesError("")
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
    setDiscordLinkError("")
    setRolesError("")

    const cleanRoles = getCleanRoles()
    if (cleanRoles.length < 1) {
      setLoading(false)
      setRolesError("Please select at least one role you are looking for.")
      return
    }

    const discordLinkValue = discordLink.trim()
    if (
      discordLinkValue !== "" &&
      !/^https:\/\/discord\.(gg|com\/invite)\//.test(discordLinkValue)
    ) {
      setLoading(false)
      setDiscordLinkError("Please enter a valid Discord invite link")
      return
    }

    const jamYmd = jamRangeToYmd(jamDateRange)
    if (!jamYmd) {
      setLoading(false)
      toast.error("Jam dates required.", {
        description: "Select a full date range (start and end) for your jam.",
      })
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
        jamStartDate: dateInputToUtcStart(jamYmd.start),
        jamEndDate: dateInputToUtcEnd(jamYmd.end),
      })
      if (!result.success) {
        toast.error("Could not create the team.", { description: result.error })
      } else {
        if (result.gamification && gamificationRewardHasToast(result.gamification)) {
          showGamificationRewards("CREATE_TEAM", result.gamification)
        }
        track("Created Team", { engine })
        toast.success("Team created successfully!", { description: "Your listing is now live." })
        setTeamName("")
        setJamName("")
        setEngine("")
        setLanguage("")
        setTeamVibe("")
        setExperienceRequired("")
        setDiscordLink("")
        setJamId(null)
        setJamDateRange(undefined)
        setDiscordLinkError("")
        setDescription("")
        setRoles([{ id: roleIdCounter++, role: "", level: "" }])
        router.push(result.teamId ? `/teams/${result.teamId}/manage` : "/dashboard")
      }
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Error message when not signed in */}
      {!checkingAuth && !user && (
        <Card className="mb-8 rounded-3xl border-destructive/50 bg-destructive/10">
          <CardContent className="p-6 text-center">
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
              <div className="mb-2 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Step {step} of {totalSteps}</span>
                  <span>
                    {step === 1 && "Basics"}
                    {step === 2 && "Team Setup"}
                    {step === 3 && "Final Details"}
                  </span>
                </div>
                <Progress
                  value={(step / totalSteps) * 100}
                  className="h-2 rounded-full bg-secondary/80"
                />
              </div>

              <div className="relative flex flex-col gap-8 pb-28 md:pb-10">
                {step === 1 && (
                  <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-2 duration-200">
                    {/* Team / Project Name */}
                    <div className="flex flex-col gap-2.5">
                      <Label htmlFor="teamName" className="text-sm font-bold text-foreground">
                        Team / Project Name
                      </Label>
                      <Input
                        id="teamName"
                        name="teamName"
                        required
                        ref={step1Ref}
                        placeholder="e.g. The Pixel Knights"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground"
                      />
                    </div>

                    {/* Game Jam Name */}
                    <div className="flex flex-col gap-2.5">
                      <Label htmlFor="jamName" className="text-sm font-bold text-foreground">
                        Game Jam Name
                      </Label>
                      <Input
                        id="jamName"
                        name="jamName"
                        required
                        placeholder="e.g. Ludum Dare 57, GMTK 2026..."
                        value={jamName}
                        onChange={(e) => setJamName(e.target.value)}
                        className="h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground"
                      />
                    </div>

                    {/* Jam Itch.io (optional link) */}
                    <div className="flex flex-col gap-2.5">
                      <Label className="text-sm font-bold text-foreground">
                        Link to an Itch.io Jam (optional)
                      </Label>
                      <JamSearchSelector
                        value={jamId}
                        onValueChange={setJamId}
                        onJamMetaChange={handleJamMetaChange}
                        placeholder="Choose an Itch.io jam…"
                        syncOnOpen={true}
                        activeOnly={true}
                      />
                    </div>

                    <DateRangeField
                      label="Jam date range"
                      value={jamDateRange}
                      onChange={setJamDateRange}
                      placeholder="Choose your jam start and end dates"
                      drawerTitle="When does your jam run?"
                      dateFormat="long"
                      numberOfMonthsDesktop={2}
                      helperText="Your listing stays public until the jam end date (shown on your squad card). You can extend it later from the dashboard."
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-2 duration-200">
                    {/* Engine & Language row */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="flex flex-col gap-2.5">
                        <Label className="text-sm font-bold text-foreground">Engine</Label>
                        <Select value={engine} onValueChange={setEngine} required>
                          <SelectTrigger
                            ref={step2Ref}
                            className="h-12 w-full rounded-xl border-border/60 bg-secondary/50"
                          >
                            <SelectValue placeholder="Pick an engine" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {ENGINE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <Label className="text-sm font-bold text-foreground">Spoken Language</Label>
                        <Select value={language} onValueChange={setLanguage} required>
                          <SelectTrigger className="h-12 w-full rounded-xl border-border/60 bg-secondary/50">
                            <SelectValue placeholder="Pick a language" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {LANGUAGE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Label className="text-sm font-bold text-foreground">Roles Needed</Label>
                        <span className="text-xs font-medium text-muted-foreground">
                          {roles.length} role{roles.length !== 1 ? "s" : ""} added
                        </span>
                      </div>

                      <div className="flex flex-col gap-3">
                        {roles.map((entry) => (
                          <div
                            key={entry.id}
                            className="group flex flex-col gap-3 rounded-2xl border border-border/40 bg-secondary/30 p-4 sm:flex-row sm:items-center"
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
                      {rolesError && (
                        <div className="status-error flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="size-4 shrink-0" />
                          <span>{rolesError}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-2 duration-200">
                    {/* Discord Invitation Link */}
                    <div className="flex flex-col gap-2.5">
                      <Label htmlFor="discordLink" className="text-sm font-bold text-foreground">
                        Discord Invitation Link (optional)
                      </Label>
                      <Input
                        id="discordLink"
                        name="discordLink"
                        type="url"
                        placeholder="e.g. https://discord.gg/your-server"
                        value={discordLink}
                        onChange={(e) => {
                          setDiscordLink(e.target.value)
                          if (discordLinkError) setDiscordLinkError("")
                        }}
                        autoComplete="off"
                        className={`h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground${discordLinkError ? " border-destructive" : ""}`}
                      />
                      {discordLinkError && (
                        <div className="status-error flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="size-4 shrink-0" />
                          <span>{discordLinkError}</span>
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
                    <div className="rounded-2xl border border-border/60 bg-secondary/40 p-4 text-sm text-muted-foreground">
                      <p className="mb-2 font-semibold text-foreground">Quick preview before publishing</p>
                      <ul className="space-y-1.5">
                        <li>
                          <span className="font-medium text-foreground">Team:</span>{" "}
                          {teamName || <span className="italic text-muted-foreground">Not set</span>}
                        </li>
                        <li>
                          <span className="font-medium text-foreground">Jam:</span>{" "}
                          {jamName || <span className="italic text-muted-foreground">Not set</span>}
                        </li>
                        <li>
                          <span className="font-medium text-foreground">Engine / Language:</span>{" "}
                          {engine || language
                            ? `${engine || "Any"} • ${language || "Any"}`
                            : <span className="italic text-muted-foreground">Not set</span>}
                        </li>
                        <li>
                          <span className="font-medium text-foreground">Roles needed:</span>{" "}
                          {getCleanRoles().length > 0
                            ? `${getCleanRoles().length} role(s)`
                            : <span className="italic text-muted-foreground">No roles yet</span>}
                        </li>
                        <li>
                          <span className="font-medium text-foreground">Discord:</span>{" "}
                          {discordLink
                            ? discordLink
                            : <span className="italic text-muted-foreground">No invite link</span>}
                        </li>
                      </ul>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Listing visible until{" "}
                        <span className="font-medium text-foreground">
                          {jamDateRange?.to
                            ? format(jamDateRange.to, "MMM d, yyyy")
                            : "—"}
                        </span>{" "}
                        (jam end).
                      </p>
                    </div>
                  </div>
                )}

                {/* Sticky bottom actions */}
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur md:static md:mt-4 md:border-none md:bg-transparent md:px-0 md:py-0 md:sticky md:bottom-0">
                  <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
                    <div className="hidden text-xs text-muted-foreground md:block">
                      {step === 1 && "Basics — team name & jam."}
                      {step === 2 && "Team setup — engine, language & roles."}
                      {step === 3 && "Final details — description & Discord."}
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={step === 1 || loading}
                        onClick={goToPreviousStep}
                        className="rounded-xl text-muted-foreground hover:text-foreground"
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        disabled={loading || (step === totalSteps && publishTapGuard)}
                        onClick={handlePrimaryAction}
                        className="ml-auto flex-1 justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground sm:flex-none sm:px-6"
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
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  )
}