"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase" // Notre pont vers Supabase
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, X, Rocket, Sparkles } from "lucide-react"

type RoleEntry = {
  id: number
  role: string
  level: string
}

const ROLE_OPTIONS = [
  { value: "developer", label: "Developer" },
  { value: "2d-artist", label: "2D Artist" },
  { value: "3d-artist", label: "3D Artist" },
  { value: "audio", label: "Audio / Music" },
  { value: "writer", label: "Writer / Narrative" },
  { value: "game-design", label: "Game Designer" },
  { value: "ui-ux", label: "UI / UX" },
  { value: "qa", label: "QA / Playtester" },
]

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner", emoji: "🌱" },
  { value: "hobbyist", label: "Hobbyist", emoji: "🛠️" },
  { value: "confirmed", label: "Confirmed", emoji: "🚀" },
  { value: "veteran", label: "Veteran", emoji: "⭐" },
]

const ENGINE_OPTIONS = [
  { value: "godot", label: "Godot" },
  { value: "unity", label: "Unity" },
  { value: "unreal", label: "Unreal Engine" },
  { value: "gamemaker", label: "GameMaker" },
  { value: "pico8", label: "PICO-8" },
  { value: "custom", label: "Custom / Other" },
]

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

  
  const [loading, setLoading] = useState(false)
  const [engine, setEngine] = useState("")
  const [language, setLanguage] = useState("")
  const [roles, setRoles] = useState<RoleEntry[]>([{ id: 0, role: "", level: "" }])
  
  // 🔐 NOUVEAU : On vérifie si l'utilisateur est connecté
  const [user, setUser] = useState<any>(null)
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
    
    const form = event.currentTarget
    setLoading(true)

    const formData = new FormData(form)

    // On nettoie la liste des rôles pour ne garder que ceux qui sont remplis
    const cleanRoles = roles.filter(r => r.role !== "" && r.level !== "")

    const teamData = {
      team_name: formData.get('teamName'), // Le nouveau champ qu'on va créer
      jam_name: formData.get('jamName'),   // L'ancien champ
      project_description: formData.get('description'),
      engine: engine,
      language: language,
      looking_for: JSON.stringify(cleanRoles), 
    }

    const { error } = await supabase
      .from('teams')
      .insert([teamData])

    setLoading(false)

    if (error) {
      alert("Error: " + error.message)
    } else {
      alert("Success! Your team announcement is live. 🚀")
      form.reset()
      setEngine("")
      setLanguage("")
      setRoles([{ id: roleIdCounter++, role: "", level: "" }]) // On remet un seul rôle vide
    }
  }

  return (
    <>
      {/* 🛑 MESSAGE D'ERREUR SI NON CONNECTÉ */}
      {!checkingAuth && !user && (
        <Card className="mb-8 rounded-3xl border-destructive/50 bg-destructive/10">
          <CardContent className="p-6 text-center">
            <h3 className="mb-2 text-lg font-bold text-destructive">You must be signed in!</h3>
            <p className="mb-4 text-muted-foreground">Please sign in with Discord using the button in the navigation bar to post a team.</p>
          </CardContent>
        </Card>
      )}

      {/* ✅ TON FORMULAIRE ACTUEL (affiché seulement si l'utilisateur est connecté) */}
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
                    <SelectTrigger className="h-12 rounded-xl border-border/60 bg-secondary/50">
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
                            <SelectValue placeholder="Experience level" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {LEVEL_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</SelectItem>
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

              {/* Description */}
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="description" className="text-sm font-bold text-foreground">
                  Project Description / Vibe
                </Label>
                <Textarea
                  id="description"
                  name="description" // TRÈS IMPORTANT
                  required
                  placeholder="Tell people about your project idea..."
                  rows={5}
                  className="rounded-xl border-border/60 bg-secondary/50 text-foreground"
                />
              </div>

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