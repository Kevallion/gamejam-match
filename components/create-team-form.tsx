"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
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
  { value: "beginner", label: "Beginner", emoji: "\uD83C\uDF31" },
  { value: "hobbyist", label: "Hobbyist", emoji: "\uD83D\uDEE0\uFE0F" },
  { value: "confirmed", label: "Confirmed", emoji: "\uD83D\uDE80" },
  { value: "veteran", label: "Veteran", emoji: "\u2B50" },
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
  const [roles, setRoles] = useState<RoleEntry[]>([
    { id: 0, role: "", level: "" },
  ])

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

  return (
    <Card className="rounded-3xl border-border/50 bg-card shadow-xl shadow-primary/5">
      <CardContent className="p-6 md:p-10">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-8"
        >
          {/* Game Jam Name */}
          <div className="flex flex-col gap-2.5">
            <Label
              htmlFor="jam-name"
              className="text-sm font-bold text-foreground"
            >
              Game Jam Name
            </Label>
            <Input
              id="jam-name"
              placeholder="e.g. Ludum Dare 57, GMTK 2026..."
              className="h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground placeholder:text-muted-foreground focus-visible:border-primary/50"
            />
          </div>

          {/* Engine & Language row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2.5">
              <Label className="text-sm font-bold text-foreground">
                Engine
              </Label>
              <Select>
                <SelectTrigger className="h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground hover:border-primary/40 transition-colors">
                  <SelectValue placeholder="Pick an engine" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {ENGINE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2.5">
              <Label className="text-sm font-bold text-foreground">
                Spoken Language
              </Label>
              <Select>
                <SelectTrigger className="h-12 rounded-xl border-border/60 bg-secondary/50 text-foreground hover:border-primary/40 transition-colors">
                  <SelectValue placeholder="Pick a language" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Roles Needed */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-foreground">
                Roles Needed
              </Label>
              <span className="text-xs font-medium text-muted-foreground">
                {roles.length} role{roles.length !== 1 ? "s" : ""} added
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {roles.map((entry, index) => (
                <div
                  key={entry.id}
                  className="group flex flex-col gap-3 rounded-2xl border border-border/40 bg-secondary/30 p-4 transition-colors hover:border-primary/20 sm:flex-row sm:items-center"
                >
                  <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                    <Select
                      value={entry.role}
                      onValueChange={(v) => updateRole(entry.id, "role", v)}
                    >
                      <SelectTrigger className="h-11 flex-1 rounded-xl border-border/50 bg-card text-foreground hover:border-primary/40 transition-colors">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {ROLE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={entry.level}
                      onValueChange={(v) => updateRole(entry.id, "level", v)}
                    >
                      <SelectTrigger className="h-11 flex-1 rounded-xl border-border/50 bg-card text-foreground hover:border-primary/40 transition-colors">
                        <SelectValue placeholder="Experience level" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {LEVEL_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.emoji} {opt.label}
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
                      className="size-9 shrink-0 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive self-end sm:self-auto"
                      aria-label={`Remove role ${index + 1}`}
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
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2.5">
            <Label
              htmlFor="description"
              className="text-sm font-bold text-foreground"
            >
              Project Description / Vibe
            </Label>
            <Textarea
              id="description"
              placeholder="Tell people about your project idea, the vibe you're going for, schedule expectations, and anything else they should know..."
              rows={5}
              className="rounded-xl border-border/60 bg-secondary/50 text-foreground placeholder:text-muted-foreground focus-visible:border-primary/50 leading-relaxed"
            />
            <p className="text-xs text-muted-foreground">
              Tip: Be specific about your vision and what makes this jam exciting
              for you!
            </p>
          </div>

          {/* Submit */}
          <div className="relative pt-2">
            <div className="absolute inset-x-0 bottom-0 h-16 rounded-2xl bg-primary/10 blur-xl" />
            <Button
              type="submit"
              size="lg"
              className="relative w-full gap-2.5 rounded-2xl bg-primary py-7 text-base font-extrabold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/85 hover:shadow-xl hover:shadow-primary/30 hover:gap-3"
            >
              <Sparkles className="size-5" />
              Publish Announcement
              <Rocket className="size-5" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
