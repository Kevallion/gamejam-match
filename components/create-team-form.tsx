"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, X, Rocket, Sparkles } from "lucide-react"
import { SignInButton } from "@/components/sign-in-button"
import { toast } from "sonner"
import { ENGINE_OPTIONS, EXPERIENCE_OPTIONS, JAM_STYLE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"

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

let roleIdCounter = 1

export function CreateTeamForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [engine, setEngine] = useState("")
  const [language, setLanguage] = useState("")
  const [teamVibe, setTeamVibe] = useState("")
  const [experienceRequired, setExperienceRequired] = useState("")
  const [roles, setRoles] = useState<RoleEntry[]>([{ id: 0, role: "", level: "" }])
  // Nouveau state pour le lien Discord
  const [discordLink, setDiscordLink] = useState("")
  const [discordLinkError, setDiscordLinkError] = useState("")

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

  function addRole() {
    setRoles((prev) => [...prev, { id: roleIdCounter++, role: "", level: "" }])
  }

  function removeRole(id: number) {
    setRoles((prev) => prev.filter((r) => r.id !== id))
  }

  function updateRole(id: number, field: "role" | "level", value: string) {
    setRoles((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    setLoading(true)
    setDiscordLinkError("") // Reset error before check

    const discordLinkValue = discordLink.trim()
    if (
      discordLinkValue !== "" &&
      !/^https:\/\/discord\.(gg|com\/invite)\//.test(discordLinkValue)
    ) {
      setLoading(false)
      setDiscordLinkError("Please enter a valid Discord invite link")
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    const cleanRoles = roles.filter(r => r.role !== "" && r.level !== "")

    const teamData = {
      user_id: user.id,
      team_name: formData.get('teamName'),
      game_name: formData.get('jamName'),
      description: formData.get('description'),
      engine: engine,
      language: language,
      looking_for: cleanRoles,
      discord_link: discordLinkValue,
      team_vibe: teamVibe || null,
      experience_required: experienceRequired && experienceRequired !== "any" ? experienceRequired : null,
    }

    try {
      const { data, error } = await supabase.from('teams').insert([teamData]).select('id').single()
      if (error) {
        toast.error("Could not create the team.", { description: error.message })
      } else {
        toast.success("Team created successfully!", { description: "Your listing is now live." })
        form.reset()
        setEngine("")
        setLanguage("")
        setTeamVibe("")
        setExperienceRequired("")
        setDiscordLink("")
        setDiscordLinkError("")
        setRoles([{ id: roleIdCounter++, role: "", level: "" }])
        router.push(data?.id ? `/teams/${data.id}/manage` : "/dashboard")
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
            <p className="mb-4 text-muted-foreground">Please sign in with Discord to post a team.</p>
            <SignInButton />
          </CardContent>
        </Card>
      )}

      {/* Form (shown only when user is signed in) */}
      {user && (
        <Card className="rounded-3xl border-border/50 bg-card shadow-xl shadow-primary/5">
          <CardContent className="p-6 md:p-10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              
              {/* Team / Project Name */}
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="teamName" className="text-sm font-bold text-foreground">
                  Team / Project Name
                </Label>
                <Input
                  id="teamName"
                  name="teamName"
                  required
                  placeholder="e.g. The Pixel Knights"
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
                  className="h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground"
                />
              </div>

              {/* Engine & Language row */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2.5">
                  <Label className="text-sm font-bold text-foreground">Engine</Label>
                  <Select value={engine} onValueChange={setEngine} required>
                    <SelectTrigger className="h-12 w-full rounded-xl border-border/60 bg-secondary/50">
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
                  Attracts jammers who match your team's energy.
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
                  {roles.map((entry, index) => (
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
              </div>

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
                  onChange={e => {
                    setDiscordLink(e.target.value)
                    if (discordLinkError) setDiscordLinkError("")
                  }}
                  autoComplete="off"
                  className={`h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground${discordLinkError ? " border-destructive" : ""}`}
                />
                {discordLinkError && (
                  <span className="text-sm text-destructive">{discordLinkError}</span>
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
                  placeholder="Tell people about your project idea..."
                  rows={5}
                  className="rounded-xl border-border/60 bg-secondary/50 text-foreground"
                />
              </div>

              <p className="text-sm text-muted-foreground">
                Your listing will be visible for 30 days.
              </p>

              {/* Submit */}
              <Button type="submit" disabled={loading} className="w-full rounded-2xl bg-primary py-7 font-extrabold text-primary-foreground">
                {loading ? "Publishing..." : (
                  <>
                    <Sparkles className="size-5 mr-2" />
                    Publish Announcement
                    <Rocket className="size-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  )
}