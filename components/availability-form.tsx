"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { format } from "date-fns"
import { useIsMobile } from "@/hooks/use-mobile"
import type { DateRange } from "react-day-picker"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { CalendarDays, Loader2, AlertCircle, ArrowLeft, ArrowRight, Check, Send } from "lucide-react"
import { SignInButton } from "@/components/sign-in-button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ENGINE_OPTIONS_WITH_ANY, EXPERIENCE_OPTIONS, JAM_STYLE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"
import { JamSearchSelector } from "@/components/jam-search-selector"

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
const STEP_TITLES = ["Who You Are", "Your Preferences", "Your Profile"]

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1.5 text-sm text-destructive" role="alert">
      <AlertCircle className="size-4 shrink-0" />
      {message}
    </p>
  )
}

export function AvailabilityForm() {
  const isMobile = useIsMobile()
  const stepRef = useRef<HTMLDivElement>(null)

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [role, setRole] = useState("")
  const [level, setLevel] = useState("")
  const [jamStyle, setJamStyle] = useState("")
  const [engine, setEngine] = useState("")
  const [language, setLanguage] = useState("")
  const [portfolioLink, setPortfolioLink] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [discordUsername, setDiscordUsername] = useState("")
  const [jamId, setJamId] = useState<string | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const [user, setUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false)

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
        .select("username, role, experience, experience_level, jam_style, engine, language, bio, portfolio_link, jam_id, discord_username")
        .eq("id", user!.id)
        .single()
      if (data) {
        setUsername(data.username || "")
        setRole(data.role || "")
        setLevel(data.experience || data.experience_level || "")
        setJamStyle(data.jam_style || "")
        setEngine(data.engine || "")
        setLanguage(data.language || "")
        setBio(data.bio || "")
        setPortfolioLink(data.portfolio_link || "")
        setDiscordUsername((data as { discord_username?: string | null }).discord_username || "")
        setJamId((data as { jam_id?: string | null }).jam_id ?? null)
        setHasLoadedProfile(true)
      }
    }
    loadProfile()
  }, [user, hasLoadedProfile])

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

  const validateStep = useCallback((s: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (s === 1) {
      if (!username.trim()) newErrors.username = "Username is required."
      if (!role) newErrors.role = "Please select your main role."
      if (!level) newErrors.level = "Please select your experience level."
    }

    if (s === 2) {
      if (!engine) newErrors.engine = "Please select an engine."
      if (!language) newErrors.language = "Please select a language."
    }

    if (s === 3) {
      if (!bio.trim()) newErrors.bio = "Tell others a bit about yourself."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [username, role, level, engine, language, bio])

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

    let dateString = "Not specified"
    if (dateRange?.from) {
      dateString = dateRange.to
        ? `${format(dateRange.from, "yyyy-MM-dd")} to ${format(dateRange.to, "yyyy-MM-dd")}`
        : format(dateRange.from, "yyyy-MM-dd")
    }

    try {
      const { count, error: countError } = await supabase
        .from("availability_posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

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

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single()

      const avatarUrl = existingProfile?.avatar_url ?? user.user_metadata?.avatar_url ?? null

      const { error: postError } = await supabase.from("availability_posts").insert({
        user_id: user.id,
        availability: dateString,
        username: username.trim(),
        role,
        experience: level,
        jam_style: jamStyle || null,
        engine,
        language,
        bio: bio.trim(),
        portfolio_link: portfolioLink.trim() || null,
        avatar_url: avatarUrl,
      })

      if (!postError) {
        await supabase.from("profiles").upsert([{
          id: user.id,
          username: username.trim(),
          role,
          experience: level,
          experience_level: level,
          jam_style: jamStyle || null,
          engine,
          language,
          bio: bio.trim(),
          portfolio_link: portfolioLink.trim() || null,
          avatar_url: avatarUrl,
          jam_id: jamId || null,
          discord_username: discordUsername.trim() || null,
        }], { onConflict: "id" })
      }

      if (postError) {
        toast.error("Could not add announcement.", { description: postError.message })
      } else {
        toast.success("Announcement added!", {
          description: `You have ${(count ?? 0) + 1} of 3 announcements.`,
        })
        setDateRange(undefined)
      }
    } catch (err) {
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const progressValue = (step / TOTAL_STEPS) * 100

  // ── Date picker: Drawer on mobile, Popover on desktop ──
  function DatePickerField() {
    const triggerButton = (
      <Button
        type="button"
        variant="outline"
        className={cn(
          "h-12 w-full justify-start gap-3 rounded-xl border-border/60 bg-secondary/50",
          !dateRange?.from && "text-muted-foreground"
        )}
      >
        <CalendarDays className="size-4 text-lavender" />
        {dateRange?.from ? (
          dateRange.to
            ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
            : format(dateRange.from, "MMM d")
        ) : (
          "Pick your available dates"
        )}
      </Button>
    )

    if (isMobile) {
      return (
        <Drawer open={calendarOpen} onOpenChange={setCalendarOpen}>
          <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Select Dates</DrawerTitle>
            </DrawerHeader>
            <div className="flex justify-center px-4 pb-6">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                disabled={{ before: new Date() }}
                numberOfMonths={1}
              />
            </div>
          </DrawerContent>
        </Drawer>
      )
    }

    return (
      <Popover>
        <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
        <PopoverContent className="w-auto rounded-2xl p-0">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={setDateRange}
            disabled={{ before: new Date() }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    )
  }

  // ── Not signed in ──
  if (!checkingAuth && !user) {
    return (
      <Card className="mb-8 rounded-3xl border-destructive/50 bg-destructive/10">
        <CardContent className="p-6 text-center">
          <h3 className="mb-2 text-lg font-bold text-destructive">You must be signed in!</h3>
          <p className="mb-4 text-muted-foreground">Please sign in with Discord to post your availability.</p>
          <SignInButton />
        </CardContent>
      </Card>
    )
  }

  if (checkingAuth || !user) return null

  return (
    <div className={cn("relative", isMobile && "pb-24")}>
      <Card className="rounded-3xl border-border/50 bg-card shadow-xl shadow-lavender/5">
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
            {/* ═══ STEP 1 -- Who You Are ═══ */}
            {step === 1 && (
              <div className="flex flex-col gap-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <div className="flex flex-col gap-2.5">
                  <Label htmlFor="username" className="text-sm font-bold text-foreground">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); clearError("username") }}
                    required
                    placeholder="e.g. PixelWizard42"
                    className={cn(
                      "h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground",
                      errors.username && "border-destructive"
                    )}
                    aria-invalid={!!errors.username}
                  />
                  <FieldError message={errors.username} />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-2.5">
                    <Label className="text-sm font-bold text-foreground">Main Role</Label>
                    <Select value={role} onValueChange={(v) => { setRole(v); clearError("role") }} required>
                      <SelectTrigger
                        className={cn(
                          "h-12 rounded-xl border-border/60 bg-secondary/50",
                          errors.role && "border-destructive"
                        )}
                        aria-invalid={!!errors.role}
                      >
                        <SelectValue placeholder="What do you do?" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {ROLE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={errors.role} />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label className="text-sm font-bold text-foreground">Experience Level</Label>
                    <Select value={level} onValueChange={(v) => { setLevel(v); clearError("level") }} required>
                      <SelectTrigger
                        className={cn(
                          "h-12 rounded-xl border-border/60 bg-secondary/50",
                          errors.level && "border-destructive"
                        )}
                        aria-invalid={!!errors.level}
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
                    <FieldError message={errors.level} />
                  </div>
                </div>
              </div>
            )}

            {/* ═══ STEP 2 -- Your Preferences ═══ */}
            {step === 2 && (
              <div className="flex flex-col gap-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
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
                            <span className="ml-2 text-xs text-muted-foreground">{"--"} {opt.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Helps match you with teams that share your approach.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-2.5">
                    <Label className="text-sm font-bold text-foreground">Preferred Engine</Label>
                    <Select value={engine} onValueChange={(v) => { setEngine(v); clearError("engine") }} required>
                      <SelectTrigger
                        className={cn(
                          "h-12 rounded-xl border-border/60 bg-secondary/50",
                          errors.engine && "border-destructive"
                        )}
                        aria-invalid={!!errors.engine}
                      >
                        <SelectValue placeholder="Pick an engine" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {ENGINE_OPTIONS_WITH_ANY.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={errors.engine} />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label className="text-sm font-bold text-foreground">Spoken Language</Label>
                    <Select value={language} onValueChange={(v) => { setLanguage(v); clearError("language") }} required>
                      <SelectTrigger
                        className={cn(
                          "h-12 rounded-xl border-border/60 bg-secondary/50",
                          errors.language && "border-destructive"
                        )}
                        aria-invalid={!!errors.language}
                      >
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
                  <Label className="text-sm font-bold text-foreground">Link to an Itch.io Jam (optional)</Label>
                  <JamSearchSelector
                    value={jamId}
                    onValueChange={setJamId}
                    placeholder="Choose an Itch.io jam..."
                    syncOnOpen={true}
                    activeOnly={true}
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <Label className="text-sm font-bold text-foreground">Availability Date(s)</Label>
                  <DatePickerField />
                  <p className="text-xs text-muted-foreground">
                    Let teams know when you are free to jam.
                  </p>
                </div>
              </div>
            )}

            {/* ═══ STEP 3 -- Your Profile ═══ */}
            {step === 3 && (
              <div className="flex flex-col gap-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <div className="flex flex-col gap-2.5">
                  <Label htmlFor="portfolio_link" className="text-sm font-bold text-foreground">
                    Portfolio / Itch.io{" "}
                    <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="portfolio_link"
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

                <div className="flex flex-col gap-2.5">
                  <Label htmlFor="discord_username" className="text-sm font-bold text-foreground">
                    Discord Username{" "}
                    <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="discord_username"
                    placeholder="e.g. gamer123"
                    value={discordUsername}
                    onChange={(e) => setDiscordUsername(e.target.value)}
                    className="h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    This username will only be shared with jammers you accept as direct contacts.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <Label htmlFor="about" className="text-sm font-bold text-foreground">About Me</Label>
                  <Textarea
                    id="about"
                    value={bio}
                    onChange={(e) => { setBio(e.target.value); clearError("bio") }}
                    required
                    rows={4}
                    placeholder="Tell potential teammates about yourself, your skills, and what you are looking for..."
                    className={cn(
                      "rounded-xl border-border/60 bg-secondary/50 text-foreground",
                      errors.bio && "border-destructive"
                    )}
                    aria-invalid={!!errors.bio}
                  />
                  <FieldError message={errors.bio} />
                </div>

                {/* Summary card */}
                <div className="rounded-2xl border border-border/40 bg-secondary/20 p-5">
                  <h4 className="mb-3 text-sm font-bold text-foreground">Summary</h4>
                  <dl className="grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Username</dt>
                      <dd className="font-medium text-foreground">{username || "--"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Role</dt>
                      <dd className="font-medium text-foreground">
                        {ROLE_OPTIONS.find(o => o.value === role)?.label || "--"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Engine</dt>
                      <dd className="font-medium text-foreground">
                        {ENGINE_OPTIONS_WITH_ANY.find(o => o.value === engine)?.label || "--"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Dates</dt>
                      <dd className="font-medium text-foreground">
                        {dateRange?.from
                          ? dateRange.to
                            ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
                            : format(dateRange.from, "MMM d")
                          : "Not specified"}
                      </dd>
                    </div>
                  </dl>
                </div>
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="size-5" />
                      Post My Availability
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
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="size-5" />
                    Post
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
