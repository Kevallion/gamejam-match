"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, X, Rocket, Sparkles, Loader2, AlertCircle, ArrowLeft, ArrowRight, Check } from "lucide-react"
import { SignInButton } from "@/components/sign-in-button"
import { toast } from "sonner"
import { ENGINE_OPTIONS, EXPERIENCE_OPTIONS, JAM_STYLE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"
import { JamSearchSelector } from "@/components/jam-search-selector"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

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

const TOTAL_STEPS = 3
const STEP_TITLES = ["Your Project", "Team Setup", "Final Details"]

let roleIdCounter = 1

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1.5 text-sm text-destructive" role="alert">
      <AlertCircle className="size-4 shrink-0" />
      {message}
    </p>
  )
}

export function CreateTeamForm() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const stepRef = useRef<HTMLDivElement>(null)

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [engine, setEngine] = useState("")
  const [language, setLanguage] = useState("")
  const [teamVibe, setTeamVibe] = useState("")
  const [experienceRequired, setExperienceRequired] = useState("")
  const [roles, setRoles] = useState<RoleEntry[]>([{ id: 0, role: "", level: "" }])
  const [discordLink, setDiscordLink] = useState("")
  const [teamName, setTeamName] = useState("")
  const [jamName, setJamName] = useState("")
  const [description, setDescription] = useState("")
  const [jamId, setJamId] = useState<string | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const [user, setUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setCheckingAuth(false)
    }
    checkUser()
  }, [])

  // Focus first input on step change
  useEffect(() => {
    const timer = setTimeout(() => {
      const firstInput = stepRef.current?.querySelector<HTMLElement>(
        "input:not([type=hidden]), textarea, select, [role=combobox]"
      )
      firstInput?.focus()
    }, 150)
    return () => clearTimeout(timer)
  }, [step])

  function clearError(field: string) {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function addRole() {
    clearError("roles")
    setRoles((prev) => [...prev, { id: roleIdCounter++, role: "", level: "" }])
  }

  function removeRole(id: number) {
    clearError("roles")
    setRoles((prev) => prev.filter((r) => r.id !== id))
  }

  function updateRole(id: number, field: "role" | "level", value: string) {
    clearError("roles")
    setRoles((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  const validateStep = useCallback((s: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (s === 1) {
      if (!teamName.trim()) newErrors.teamName = "Team name is required."
      if (!jamName.trim()) newErrors.jamName = "Game jam name is required."
    }

    if (s === 2) {
      if (!engine) newErrors.engine = "Please select an engine."
      if (!language) newErrors.language = "Please select a language."
      const cleanRoles = roles.filter(r => r.role !== "" && r.level !== "")
      if (cleanRoles.length < 1) newErrors.roles = "Please add at least one role with an experience level."
    }

    if (s === 3) {
      const discordVal = discordLink.trim()
      if (
        discordVal !== "" &&
        !/^https:\/\/discord\.(gg|com\/invite)\//.test(discordVal)
      ) {
        newErrors.discordLink = "Please enter a valid Discord invite link."
      }
      if (!description.trim()) newErrors.description = "A project description is required."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [teamName, jamName, engine, language, roles, discordLink, description])

  function goNext() {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS))
    }
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 1))
  }

  async function handleSubmit() {
    if (!user) return
    if (!validateStep(3)) return

    setLoading(true)

    const cleanRoles = roles.filter(r => r.role !== "" && r.level !== "")
    const discordLinkValue = discordLink.trim()

    const teamData = {
      user_id: user.id,
      team_name: teamName.trim(),
      game_name: jamName.trim(),
      description: description.trim(),
      engine,
      language,
      looking_for: cleanRoles,
      discord_link: discordLinkValue,
      team_vibe: teamVibe || null,
      experience_required: experienceRequired && experienceRequired !== "any" ? experienceRequired : null,
      jam_id: jamId || null,
    }

    try {
      const { data, error } = await supabase.from("teams").insert([teamData]).select("id").single()
      if (error) {
        toast.error("Could not create the team.", { description: error.message })
      } else {
        toast.success("Team created successfully!", { description: "Your listing is now live." })
        router.push(data?.id ? `/teams/${data.id}/manage` : "/dashboard")
      }
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const progressValue = (step / TOTAL_STEPS) * 100

  // ── Not signed in ──
  if (!checkingAuth && !user) {
    return (
      <Card className="mb-8 rounded-3xl border-destructive/50 bg-destructive/10">
        <CardContent className="p-6 text-center">
          <h3 className="mb-2 text-lg font-bold text-destructive">You must be signed in!</h3>
          <p className="mb-4 text-muted-foreground">Please sign in with Discord to post a team.</p>
          <SignInButton />
        </CardContent>
      </Card>
    )
  }

  if (checkingAuth || !user) return null

  return (
    <div className={cn("relative", isMobile && "pb-24")}>
      <Card className="rounded-3xl border-border/50 bg-card shadow-xl shadow-primary/5">
        <CardContent className="p-6 md:p-10">
          {/* ── Step Indicator ── */}
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Step {step} of {TOTAL_STEPS}
              </p>
              <p className="text-sm font-bold text-foreground">
                {STEP_TITLES[step - 1]}
              </p>
            </div>
            <Progress value={progressValue} className="h-2" />
            {/* Step dots */}
            <div className="mt-3 flex items-center justify-between">
              {STEP_TITLES.map((title, i) => (
                <div key={title} className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs font-bold transition-colors",
                      i + 1 < step && "bg-primary text-primary-foreground",
                      i + 1 === step && "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
                      i + 1 > step && "bg-muted text-muted-foreground"
                    )}
                  >
                    {i + 1 < step ? <Check className="size-3.5" /> : i + 1}
                  </div>
                  <span className={cn(
                    "hidden text-xs font-medium sm:inline",
                    i + 1 <= step ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Step Content ── */}
          <div ref={stepRef} className="min-h-[280px]">
            {/* ═══ STEP 1 — Your Project ═══ */}
            {step === 1 && (
              <div className="flex flex-col gap-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <div className="flex flex-col gap-2.5">
                  <Label htmlFor="teamName" className="text-sm font-bold text-foreground">
                    Team / Project Name
                  </Label>
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={(e) => { setTeamName(e.target.value); clearError("teamName") }}
                    required
                    placeholder="e.g. The Pixel Knights"
                    className={cn(
                      "h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground",
                      errors.teamName && "border-destructive"
                    )}
                  />
                  <FieldError message={errors.teamName} />
                </div>

                <div className="flex flex-col gap-2.5">
                  <Label htmlFor="jamName" className="text-sm font-bold text-foreground">
                    Game Jam Name
                  </Label>
                  <Input
                    id="jamName"
                    value={jamName}
                    onChange={(e) => { setJamName(e.target.value); clearError("jamName") }}
                    required
                    placeholder="e.g. Ludum Dare 57, GMTK 2026..."
                    className={cn(
                      "h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground",
                      errors.jamName && "border-destructive"
                    )}
                  />
                  <FieldError message={errors.jamName} />
                </div>

                <div className="flex flex-col gap-2.5">
                  <Label className="text-sm font-bold text-foreground">
                    Link to an Itch.io Jam (optional)
                  </Label>
                  <JamSearchSelector
                    value={jamId}
                    onValueChange={setJamId}
                    placeholder="Choose an Itch.io jam..."
                    syncOnOpen={true}
                    activeOnly={true}
                  />
                  <p className="text-xs text-muted-foreground">
                    Link your team listing to a specific jam on Itch.io.
                  </p>
                </div>
              </div>
            )}

            {/* ═══ STEP 2 — Team Setup ═══ */}
            {step === 2 && (
              <div className="flex flex-col gap-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-2.5">
                    <Label className="text-sm font-bold text-foreground">Engine</Label>
                    <Select value={engine} onValueChange={(v) => { setEngine(v); clearError("engine") }}>
                      <SelectTrigger className={cn(
                        "h-12 w-full rounded-xl border-border/60 bg-secondary/50",
                        errors.engine && "border-destructive"
                      )}>
                        <SelectValue placeholder="Pick an engine" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {ENGINE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={errors.engine} />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label className="text-sm font-bold text-foreground">Spoken Language</Label>
                    <Select value={language} onValueChange={(v) => { setLanguage(v); clearError("language") }}>
                      <SelectTrigger className={cn(
                        "h-12 w-full rounded-xl border-border/60 bg-secondary/50",
                        errors.language && "border-destructive"
                      )}>
                        <SelectValue placeholder="Pick a language" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {LANGUAGE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={errors.language} />
                  </div>
                </div>

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
                            <span className="ml-2 text-xs text-muted-foreground">{"--"} {opt.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Attracts jammers who match your team&apos;s energy.
                  </p>
                </div>

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

                {/* Roles */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold text-foreground">Roles Needed</Label>
                    <span className="text-xs font-medium text-muted-foreground">
                      {roles.length} role{roles.length !== 1 ? "s" : ""} added
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {roles.map((entry) => (
                      <div key={entry.id} className="group flex flex-col gap-3 rounded-2xl border border-border/40 bg-secondary/30 p-4 sm:flex-row sm:items-center">
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
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeRole(entry.id)} className="size-9 shrink-0 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive self-end sm:self-auto">
                            <X className="size-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button type="button" variant="outline" onClick={addRole} className="gap-2 self-start rounded-xl border-dashed border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary">
                    <Plus className="size-4" />
                    Add another role
                  </Button>
                  <FieldError message={errors.roles} />
                </div>
              </div>
            )}

            {/* ═══ STEP 3 — Final Details ═══ */}
            {step === 3 && (
              <div className="flex flex-col gap-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <div className="flex flex-col gap-2.5">
                  <Label htmlFor="discordLink" className="text-sm font-bold text-foreground">
                    Discord Invitation Link (optional)
                  </Label>
                  <Input
                    id="discordLink"
                    type="url"
                    placeholder="e.g. https://discord.gg/your-server"
                    value={discordLink}
                    onChange={e => { setDiscordLink(e.target.value); clearError("discordLink") }}
                    autoComplete="off"
                    className={cn(
                      "h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground",
                      errors.discordLink && "border-destructive"
                    )}
                  />
                  <FieldError message={errors.discordLink} />
                </div>

                <div className="flex flex-col gap-2.5">
                  <Label htmlFor="description" className="text-sm font-bold text-foreground">
                    Project Description / Vibe
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => { setDescription(e.target.value); clearError("description") }}
                    required
                    placeholder="Tell people about your project idea..."
                    rows={5}
                    className={cn(
                      "rounded-xl border-border/60 bg-secondary/50 text-foreground",
                      errors.description && "border-destructive"
                    )}
                  />
                  <FieldError message={errors.description} />
                </div>

                {/* Summary card */}
                <div className="rounded-2xl border border-border/40 bg-secondary/20 p-5">
                  <h4 className="mb-3 text-sm font-bold text-foreground">Summary</h4>
                  <dl className="grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Team</dt>
                      <dd className="font-medium text-foreground">{teamName || "--"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Jam</dt>
                      <dd className="font-medium text-foreground">{jamName || "--"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Engine</dt>
                      <dd className="font-medium text-foreground">{ENGINE_OPTIONS.find(o => o.value === engine)?.label || "--"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Language</dt>
                      <dd className="font-medium text-foreground">{LANGUAGE_OPTIONS.find(o => o.value === language)?.label || "--"}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Roles</dt>
                      <dd className="font-medium text-foreground">
                        {roles.filter(r => r.role).map(r => ROLE_OPTIONS.find(o => o.value === r.role)?.label).filter(Boolean).join(", ") || "--"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <p className="text-sm text-muted-foreground">
                  Your listing will be visible for 30 days.
                </p>
              </div>
            )}
          </div>

          {/* ── Desktop Navigation ── */}
          {!isMobile && (
            <div className="mt-8 flex items-center gap-3">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={goBack} className="gap-2 rounded-2xl">
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
              )}
              <div className="flex-1" />
              {step < TOTAL_STEPS ? (
                <Button type="button" onClick={goNext} className="gap-2 rounded-2xl bg-primary px-8 font-bold text-primary-foreground">
                  Next
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button type="button" disabled={loading} onClick={handleSubmit} className="gap-2 rounded-2xl bg-primary px-8 py-6 font-extrabold text-primary-foreground">
                  {loading ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-5" />
                      Publish Announcement
                      <Rocket className="size-5" />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Mobile Sticky Bottom Bar ── */}
      {isMobile && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/50 bg-background/95 px-4 py-3 backdrop-blur-lg">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={goBack} className="gap-2 rounded-xl" size="lg">
                <ArrowLeft className="size-4" />
                Back
              </Button>
            ) : (
              <div className="flex-1" />
            )}
            <div className="flex-1" />
            {step < TOTAL_STEPS ? (
              <Button type="button" onClick={goNext} className="gap-2 rounded-xl bg-primary font-bold text-primary-foreground" size="lg">
                Next
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button type="button" disabled={loading} onClick={handleSubmit} className="gap-2 rounded-xl bg-primary font-extrabold text-primary-foreground" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-5" />
                    Publish
                    <Rocket className="size-5" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
