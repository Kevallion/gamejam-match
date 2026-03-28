"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DateRangeField } from "@/components/date-range-field"
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
import { Loader2, AlertCircle } from "lucide-react"
import { SignInButton } from "@/components/sign-in-button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ENGINE_OPTIONS_WITH_ANY, EXPERIENCE_OPTIONS, JAM_STYLE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"
import { JamSearchSelector } from "@/components/jam-search-selector"
import { claimAvailabilityPostXp } from "@/app/actions/availability-actions"
import { showGamificationRewards } from "@/components/gamification-reward-toasts"
import { gamificationRewardHasToast } from "@/lib/gamification-reward-types"

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

export function AvailabilityForm() {
  const totalSteps = 3
  const [step, setStep] = useState(1)
  // Form state
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [role, setRole] = useState("")
  const [level, setLevel] = useState("")
  const [jamStyle, setJamStyle] = useState("")
  const [engine, setEngine] = useState("")
  const [language, setLanguage] = useState("")
  const [portfolioLink, setPortfolioLink] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [jamId, setJamId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Check if user is signed in
  const [user, setUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false)

  const step1Ref = useRef<HTMLInputElement | null>(null)
  const step2Ref = useRef<HTMLButtonElement | null>(null)
  const step3Ref = useRef<HTMLTextAreaElement | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)
  /** Même correctif que create-team : évite clic/tactile fantôme quand le bouton devient « envoyer ». */
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
      setUser(session?.user || null)
      setCheckingAuth(false)
    }
    checkUser()
  }, [])

  useEffect(() => {
    if (!user || hasLoadedProfile) return
    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("username, role, experience, experience_level, jam_style, engine, language, bio, portfolio_link, default_role, default_engine, default_language, portfolio_url")
        .eq("id", user!.id)
        .single()
      if (data) {
        const d = data as {
          default_role?: string | null
          default_engine?: string | null
          default_language?: string | null
          portfolio_url?: string | null
        }
        setUsername(data.username || "")
        setRole(d.default_role?.trim() || data.role || "")
        setLevel(data.experience || data.experience_level || "")
        setJamStyle(data.jam_style || "")
        setEngine(d.default_engine?.trim() || data.engine || "")
        setLanguage(d.default_language?.trim() || data.language || "")
        setBio(data.bio || "")
        setPortfolioLink(d.portfolio_url?.trim() || data.portfolio_link || "")
        setHasLoadedProfile(true)
      }
    }
    loadProfile()
  }, [user, hasLoadedProfile])

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

  function validateStep(currentStep: number) {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!username.trim()) {
        newErrors.username = "Username is required"
      }
      if (!role) {
        newErrors.role = "Please select your main role"
      }
      if (!level) {
        newErrors.level = "Please select your experience level"
      }
    }

    if (currentStep === 2) {
      if (!engine) {
        newErrors.engine = "Please select a preferred engine"
      }
      if (!language) {
        newErrors.language = "Please select a spoken language"
      }
    }

    if (currentStep === 3) {
      if (!bio.trim()) {
        newErrors.bio = "About Me is required"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }))
      toast.error("Please fill all required fields.", {
        description: "Check the highlighted fields and try again.",
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

  function handlePrimaryAction() {
    if (submitted) return
    if (step < totalSteps) {
      goToNextStep()
      return
    }
    if (publishTapGuard) return
    formRef.current?.requestSubmit()
  }

  function resetForNewAnnouncement() {
    setSubmitted(false)
    setStep(1)
    setDateRange(undefined)
    setJamId(null)
    setErrors({})
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    if (step !== totalSteps) return
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return
    }

    setLoading(true)

    let dateString = "Not specified"
    if (dateRange?.from) {
      dateString = dateRange.to
        ? `${format(dateRange.from, "yyyy-MM-dd")} to ${format(dateRange.to, "yyyy-MM-dd")}`
        : format(dateRange.from, "yyyy-MM-dd")
    }

    const usernameValue = username.trim()
    const bioValue = bio.trim()

    try {
      // Check current count (max 3 per user)
      const { count, error: countError } = await supabase
        .from("availability_posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("expires_at", new Date().toISOString())

      if (countError) {
        toast.error("Could not check your announcements.", { description: countError.message })
        setLoading(false)
        return
      }
      if ((count ?? 0) >= 3) {
        toast.error("Maximum reached.", {
          description: "You can have up to 3 availability announcements. Delete one from your dashboard to add another.",
        })
        setLoading(false)
        return
      }

      // Fetch existing avatar to avoid overwriting gallery choice
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single()

      const avatarUrl = existingProfile?.avatar_url ?? user.user_metadata?.avatar_url ?? null

      // username et avatar_url viennent de profiles (jointure à la lecture), pas stockés dans availability_posts
      const { data: insertedPost, error: postError } = await supabase
        .from("availability_posts")
        .insert({
          user_id: user.id,
          availability: dateString,
          role: role,
          experience: level,
          jam_style: jamStyle || null,
          engine: engine,
          language: language,
          bio: bioValue,
          portfolio_link: portfolioLink.trim() || null,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select("id")
        .single()

      if (!postError) {
        await supabase.from("profiles").upsert([{
          id: user.id,
          username: usernameValue,
          role: role,
          experience: level,
          experience_level: level,
          jam_style: jamStyle || null,
          engine: engine,
          language: language,
          bio: bioValue,
          portfolio_link: portfolioLink.trim() || null,
          avatar_url: avatarUrl,
          jam_id: jamId || null,
        }], { onConflict: "id" })
      }

      if (postError) {
        toast.error("Could not add announcement.", { description: postError.message })
      } else {
        if (insertedPost?.id) {
          void claimAvailabilityPostXp(insertedPost.id).then((xpRes) => {
            if (!xpRes.ok && "error" in xpRes && xpRes.error && xpRes.error !== "Reward window expired.") {
              return
            }
            if (xpRes.ok && "reward" in xpRes && xpRes.reward && gamificationRewardHasToast(xpRes.reward)) {
              showGamificationRewards("POST_ANNOUNCEMENT", xpRes.reward)
            }
          })
        }
        toast.success("Announcement added!", {
          description: `You have ${(count ?? 0) + 1} of 3 announcements.`,
        })
        setDateRange(undefined)
        // Keep other fields so user can add another with same profile info
        setSubmitted(true)
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
            <p className="mb-4 text-muted-foreground">Please sign in to post your availability.</p>
            <SignInButton />
          </CardContent>
        </Card>
      )}

      {/* Form (shown only when user is signed in) */}
      {user && (
        <Card className="rounded-3xl border-border/50 bg-card shadow-xl shadow-lavender/5">
          <CardContent className="p-6 md:p-10">
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="mb-2 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Step {step} of {totalSteps}</span>
                  <span>
                    {step === 1 && "Who you are"}
                    {step === 2 && "Your Preferences"}
                    {step === 3 && "Your Profile"}
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
                    {/* Username */}
                    <div className="flex flex-col gap-2.5">
                      <Label htmlFor="username" className="text-sm font-bold text-foreground">
                        Username
                      </Label>
                      <Input
                        id="username"
                        name="username"
                        required
                        ref={step1Ref}
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value)
                          clearFieldError("username")
                        }}
                        placeholder="e.g. PixelWizard42"
                        className={cn(
                          "h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground",
                          fieldError("username") && "border-destructive",
                        )}
                        aria-invalid={!!fieldError("username")}
                      />
                      {fieldError("username") && (
                        <div className="status-error flex items-center gap-1.5 text-xs text-destructive">
                          <AlertCircle className="size-4 shrink-0" />
                          <span>{fieldError("username")}</span>
                        </div>
                      )}
                    </div>

                    {/* Role & Level row */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="flex flex-col gap-2.5">
                        <Label className="text-sm font-bold text-foreground">Main Role</Label>
                        <Select
                          value={role}
                          onValueChange={(value) => {
                            setRole(value)
                            clearFieldError("role")
                          }}
                          required
                        >
                          <SelectTrigger
                            ref={step2Ref}
                            className={cn(
                              "h-12 rounded-xl border-border/60 bg-secondary/50",
                              fieldError("role") && "border-destructive",
                            )}
                            aria-invalid={!!fieldError("role")}
                          >
                            <SelectValue placeholder="What do you do?" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {ROLE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldError("role") && (
                          <div className="status-error flex items-center gap-1.5 text-xs text-destructive">
                            <AlertCircle className="size-4 shrink-0" />
                            <span>{fieldError("role")}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <Label className="text-sm font-bold text-foreground">Experience Level</Label>
                        <Select
                          value={level}
                          onValueChange={(value) => {
                            setLevel(value)
                            clearFieldError("level")
                          }}
                          required
                        >
                          <SelectTrigger
                            className={cn(
                              "h-12 rounded-xl border-border/60 bg-secondary/50",
                              fieldError("level") && "border-destructive",
                            )}
                            aria-invalid={!!fieldError("level")}
                          >
                            <SelectValue placeholder="How experienced?" />
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
                        {fieldError("level") && (
                          <div className="status-error flex items-center gap-1.5 text-xs text-destructive">
                            <AlertCircle className="size-4 shrink-0" />
                            <span>{fieldError("level")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-2 duration-200">
                    {/* Jam Style */}
                    <div className="flex flex-col gap-2.5">
                      <Label className="text-sm font-bold text-foreground">Jam Style</Label>
                      <Select value={jamStyle} onValueChange={setJamStyle}>
                        <SelectTrigger className="h-12 rounded-xl border-border/60 bg-secondary/50">
                          <SelectValue placeholder="What vibe are you looking for?" />
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
                        Chill ☕, Learning 📖, Dedicated 🔥, Competitive 🏆 — helps match you with teams that share your approach.
                      </p>
                    </div>

                    {/* Engine & Language row */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="flex flex-col gap-2.5">
                        <Label className="text-sm font-bold text-foreground">Preferred Engine</Label>
                        <Select
                          value={engine}
                          onValueChange={(value) => {
                            setEngine(value)
                            clearFieldError("engine")
                          }}
                          required
                        >
                          <SelectTrigger
                            className={cn(
                              "h-12 rounded-xl border-border/60 bg-secondary/50",
                              fieldError("engine") && "border-destructive",
                            )}
                            aria-invalid={!!fieldError("engine")}
                          >
                            <SelectValue placeholder="Pick an engine" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {ENGINE_OPTIONS_WITH_ANY.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldError("engine") && (
                          <div className="status-error flex items-center gap-1.5 text-xs text-destructive">
                            <AlertCircle className="size-4 shrink-0" />
                            <span>{fieldError("engine")}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <Label className="text-sm font-bold text-foreground">Spoken Language</Label>
                        <Select
                          value={language}
                          onValueChange={(value) => {
                            setLanguage(value)
                            clearFieldError("language")
                          }}
                          required
                        >
                          <SelectTrigger
                            className={cn(
                              "h-12 rounded-xl border-border/60 bg-secondary/50",
                              fieldError("language") && "border-destructive",
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
                          <div className="status-error flex items-center gap-1.5 text-xs text-destructive">
                            <AlertCircle className="size-4 shrink-0" />
                            <span>{fieldError("language")}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Jam Itch.io (optional) */}
                    <div className="flex flex-col gap-2.5">
                      <Label className="text-sm font-bold text-foreground">Link to an Itch.io Jam (optional)</Label>
                      <JamSearchSelector
                        value={jamId}
                        onValueChange={setJamId}
                        placeholder="Choose an Itch.io jam…"
                        syncOnOpen={true}
                        activeOnly={true}
                      />
                    </div>

                    <DateRangeField
                      label="Availability Date(s)"
                      value={dateRange}
                      onChange={setDateRange}
                      placeholder="Pick your available dates"
                      drawerTitle="Choose your availability"
                      dateFormat="short"
                      rangeSeparator=" - "
                      disabled={{ before: new Date() }}
                      numberOfMonthsDesktop={2}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-2 duration-200">
                    {/* Portfolio / Itch.io */}
                    <div className="flex flex-col gap-2.5">
                      <Label htmlFor="portfolio_link" className="text-sm font-bold text-foreground">
                        Portfolio / Itch.io{" "}
                        <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                      </Label>
                      <Input
                        id="portfolio_link"
                        name="portfolio_link"
                        type="url"
                        placeholder="https://yourname.itch.io or https://yourportfolio.com"
                        value={portfolioLink}
                        onChange={(e) => setPortfolioLink(e.target.value)}
                        className="h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground"
                      />
                      <p className="text-xs text-muted-foreground">
                        Show off your best projects and games!
                      </p>
                    </div>

                    {/* About Me */}
                    <div className="flex flex-col gap-2.5">
                      <Label htmlFor="about" className="text-sm font-bold text-foreground">About Me</Label>
                      <Textarea
                        id="about"
                        name="about"
                        required
                        rows={4}
                        ref={step3Ref}
                        value={bio}
                        onChange={(e) => {
                          setBio(e.target.value)
                          clearFieldError("bio")
                        }}
                        className={cn(
                          "rounded-xl border-border/60 bg-secondary/50",
                          fieldError("bio") && "border-destructive",
                        )}
                        aria-invalid={!!fieldError("bio")}
                      />
                      {fieldError("bio") && (
                        <div className="status-error flex items-center gap-1.5 text-xs text-destructive">
                          <AlertCircle className="size-4 shrink-0" />
                          <span>{fieldError("bio")}</span>
                        </div>
                      )}
                    </div>

                    {/* Review */}
                    <div className="rounded-2xl border border-border/60 bg-secondary/40 p-4 text-sm text-muted-foreground">
                      <p className="mb-2 font-semibold text-foreground">Quick review of your profile</p>
                      <ul className="space-y-1.5">
                        <li>
                          <span className="font-medium text-foreground">Username:</span>{" "}
                          {username || <span className="italic text-muted-foreground">Not set</span>}
                        </li>
                        <li>
                          <span className="font-medium text-foreground">Role / Level:</span>{" "}
                          {role || level
                            ? `${role || "Any"} • ${level || "Any"}`
                            : <span className="italic text-muted-foreground">Not set</span>}
                        </li>
                        <li>
                          <span className="font-medium text-foreground">Engine / Language:</span>{" "}
                          {engine || language
                            ? `${engine || "Any"} • ${language || "Any"}`
                            : <span className="italic text-muted-foreground">Not set</span>}
                        </li>
                        <li>
                          <span className="font-medium text-foreground">Jam Style:</span>{" "}
                          {jamStyle
                            ? JAM_STYLE_OPTIONS.find((j) => j.value === jamStyle)?.label ?? jamStyle
                            : <span className="italic text-muted-foreground">Not set</span>}
                        </li>
                        <li>
                          <span className="font-medium text-foreground">Availability:</span>{" "}
                          {dateRange?.from
                            ? dateRange.to
                              ? `${format(dateRange.from, "yyyy-MM-dd")} → ${format(dateRange.to, "yyyy-MM-dd")}`
                              : format(dateRange.from, "yyyy-MM-dd")
                            : <span className="italic text-muted-foreground">Not specified</span>}
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Sticky bottom actions */}
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur md:static md:mt-4 md:border-none md:bg-transparent md:px-0 md:py-0 md:sticky md:bottom-0">
                  <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
                    <div className="hidden text-xs text-muted-foreground md:block">
                      {step === 1 && "Who you are — username & role."}
                      {step === 2 && "Your preferences — jam style, engine & language."}
                      {step === 3 && "Your profile — links and bio."}
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={step === 1 || loading || submitted}
                        onClick={goToPreviousStep}
                        className="rounded-xl text-muted-foreground hover:text-foreground"
                      >
                        Back
                      </Button>
                      {submitted ? (
                        <div className="ml-auto flex flex-1 items-center justify-end gap-2 sm:flex-none">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={resetForNewAnnouncement}
                            className="rounded-2xl px-4 text-sm font-semibold"
                          >
                            Post another availability
                          </Button>
                          <Button
                            type="button"
                            disabled
                            className="rounded-2xl bg-primary/80 py-3 text-sm font-extrabold text-primary-foreground"
                          >
                            Announcement posted
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          disabled={loading || (step === totalSteps && publishTapGuard)}
                          onClick={handlePrimaryAction}
                          className="ml-auto flex-1 justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground sm:flex-none sm:px-6"
                        >
                          {step === totalSteps
                            ? loading
                              ? (
                                <>
                                  <Loader2 className="size-4 animate-spin" />
                                  Sending...
                                </>
                              )
                              : "Post My Availability"
                            : "Next step"}
                        </Button>
                      )}
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