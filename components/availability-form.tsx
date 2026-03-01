"use client"

import { useState } from "react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Spinner } from "@/components/ui/spinner"
import { supabase } from "@/lib/supabase" // Ton import Supabase
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
import { CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

// Options (gardées de ton code original)
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
  { value: "expert", label: "Expert", emoji: "👑" },
]

const ENGINE_OPTIONS = [
  { value: "any", label: "Any / No Preference" },
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

export function AvailabilityForm() {
  // États pour capturer les données
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [role, setRole] = useState("")
  const [level, setLevel] = useState("")
  const [engine, setEngine] = useState("")
  const [language, setLanguage] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    // 1. On capture le formulaire et on lance le chargement
    const form = event.currentTarget 
    setLoading(true)

    // 2. On prépare les données
    const formData = new FormData(form)
    
    let dateString = "Not specified"
    if (dateRange?.from) {
      dateString = dateRange.to 
        ? `${format(dateRange.from, "yyyy-MM-dd")} to ${format(dateRange.to, "yyyy-MM-dd")}`
        : format(dateRange.from, "yyyy-MM-dd")
    }

    const profileData = {
      username: formData.get('username'),
      role: role,
      experience: level,
      engine: engine,
      language: language,
      bio: formData.get('about'),
      availability: dateString,
    }

    // 3. ON ENVOIE À SUPABASE (C'est ici qu'on crée 'error')
    const { error } = await supabase
      .from('profiles')
      .insert([profileData])

    setLoading(false)

    // 4. On vérifie le résultat
    if (error) {
      alert("Error: " + error.message)
    } else {
      alert("Success! Your availability is now live. 🚀")
      
      // 5. On nettoie tout
      form.reset() 
      setDateRange(undefined)
      setRole("")
      setLevel("")
      setEngine("")
      setLanguage("")
    }
  }

  return (
    <Card className="rounded-3xl border-border/50 bg-card shadow-xl shadow-lavender/5">
      <CardContent className="p-6 md:p-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* Username */}
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="username" className="text-sm font-bold text-foreground">
              Username / Pseudo
            </Label>
            <Input
              id="username"
              name="username"
              required
              placeholder="e.g. PixelWizard42"
              className="h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground"
            />
          </div>

          {/* Role & Level row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2.5">
              <Label className="text-sm font-bold text-foreground">Main Role</Label>
              <Select onValueChange={setRole} required>
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
              <Select onValueChange={setLevel} required>
                <SelectTrigger className="h-12 rounded-xl border-border/60 bg-secondary/50">
                  <SelectValue placeholder="How experienced?" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {LEVEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Engine & Language row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2.5">
              <Label className="text-sm font-bold text-foreground">Preferred Engine</Label>
              <Select onValueChange={setEngine} required>
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
              <Select onValueChange={setLanguage} required>
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

          {/* About Me */}
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="about" className="text-sm font-bold text-foreground">About Me</Label>
            <Textarea id="about" name="about" required rows={4} className="rounded-xl border-border/60 bg-secondary/50" />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full rounded-2xl bg-lavender py-7 font-extrabold text-lavender-foreground gap-2 transition-all hover:bg-lavender/90"
          >
            {loading ? (
              <>
                <Spinner className="text-lavender-foreground" />
                <span>Sending...</span>
              </>
            ) : (
              "Post My Availability"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}