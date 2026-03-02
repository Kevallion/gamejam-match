"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { Sparkles, Hand, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ENGINE_OPTIONS_WITH_ANY, EXPERIENCE_OPTIONS, JAM_STYLE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"

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
  // Form state
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

  // Check if user is signed in
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
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single()
      if (data) {
        setUsername(data.username || "")
        setRole(data.role || "")
        setLevel(data.experience || data.experience_level || "")
        setJamStyle(data.jam_style || "")
        setEngine(data.engine || "")
        setLanguage(data.language || "")
        setBio(data.bio || "")
        setPortfolioLink(data.portfolio_link || "")
        setHasLoadedProfile(true)
      }
    }
    loadProfile()
  }, [user, hasLoadedProfile])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    // Client-side validation (backup if HTML required is bypassed)
    if (!role || !level || !engine || !language) {
      toast.error("Please fill all required fields.", { description: "Role, Experience Level, Engine, and Language are required." })
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    const usernameValue = String(formData.get("username") ?? username ?? "").trim()
    const bioValue = String(formData.get("about") ?? bio ?? "").trim()
    if (!usernameValue || !bioValue) {
      toast.error("Please fill all required fields.", { description: "Username and About Me are required." })
      return
    }

    setLoading(true)

    let dateString = "Not specified"
    if (dateRange?.from) {
      dateString = dateRange.to
        ? `${format(dateRange.from, "yyyy-MM-dd")} to ${format(dateRange.to, "yyyy-MM-dd")}`
        : format(dateRange.from, "yyyy-MM-dd")
    }

    try {
      // Check current count (max 3 per user)
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

      // Fetch existing avatar to avoid overwriting gallery choice
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single()

      const avatarUrl = existingProfile?.avatar_url ?? user.user_metadata?.avatar_url ?? null

      const { error: postError } = await supabase.from("availability_posts").insert({
        user_id: user.id,
        availability: dateString,
        username: usernameValue,
        role: role,
        experience: level,
        jam_style: jamStyle || null,
        engine: engine,
        language: language,
        bio: bioValue,
        portfolio_link: portfolioLink.trim() || null,
        avatar_url: avatarUrl,
      })

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
        }], { onConflict: "id" })
      }

      if (postError) {
        toast.error("Could not add announcement.", { description: postError.message })
      } else {
        toast.success("Announcement added!", {
          description: `You have ${(count ?? 0) + 1} of 3 announcements.`,
        })
        setDateRange(undefined)
        // Keep other fields so user can add another with same profile info
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
            <p className="mb-4 text-muted-foreground">Please sign in with Discord using the button in the navigation bar to post your availability.</p>
          </CardContent>
        </Card>
      )}

      {/* Form (shown only when user is signed in) */}
      {user && (
        <Card className="rounded-3xl border-border/50 bg-card shadow-xl shadow-lavender/5">
          <CardContent className="p-6 md:p-10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              
              {/* Username */}
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="username" className="text-sm font-bold text-foreground">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. PixelWizard42"
                  className="h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground"
                />
              </div>

              {/* Role & Level row */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2.5">
                  <Label className="text-sm font-bold text-foreground">Main Role</Label>
                  <Select value={role} onValueChange={setRole} required>
                    <SelectTrigger className="h-12 rounded-xl border-border/60 bg-secondary/50">
                      <SelectValue placeholder="What do you do?" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {ROLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2.5">
                  <Label className="text-sm font-bold text-foreground">Experience Level</Label>
                  <Select value={level} onValueChange={setLevel} required>
                    <SelectTrigger className="h-12 rounded-xl border-border/60 bg-secondary/50">
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
                </div>
              </div>

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
                  <Select value={engine} onValueChange={setEngine} required>
                    <SelectTrigger className="h-12 rounded-xl border-border/60 bg-secondary/50">
                      <SelectValue placeholder="Pick an engine" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {ENGINE_OPTIONS_WITH_ANY.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2.5">
                  <Label className="text-sm font-bold text-foreground">Spoken Language</Label>
                  <Select value={language} onValueChange={setLanguage} required>
                    <SelectTrigger className="h-12 rounded-xl border-border/60 bg-secondary/50">
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

              {/* Dates */}
              <div className="flex flex-col gap-2.5">
                <Label className="text-sm font-bold text-foreground">Availability Date(s)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("h-12 w-full justify-start gap-3 rounded-xl border-border/60 bg-secondary/50", !dateRange?.from && "text-muted-foreground")}>
                      <CalendarDays className="size-4 text-lavender" />
                      {dateRange?.from ? (
                        dateRange.to ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}` : format(dateRange.from, "MMM d")
                      ) : "Pick your available dates"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto rounded-2xl p-0">
                    <Calendar mode="range" selected={dateRange} onSelect={setDateRange} disabled={{ before: new Date() }} numberOfMonths={2} />
                  </PopoverContent>
                </Popover>
              </div>

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
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="rounded-xl border-border/60 bg-secondary/50"
                />
              </div>

              {/* Submit */}
              <Button type="submit" disabled={loading} className="w-full rounded-2xl bg-lavender py-7 font-extrabold text-lavender-foreground">
                {loading ? "Sending..." : "Post My Availability"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  )
}