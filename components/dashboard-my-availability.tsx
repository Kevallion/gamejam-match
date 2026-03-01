"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Cpu,
  ExternalLink,
  Globe,
  Hand,
  PenLine,
  Save,
  Trash2,
  X,
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Styles par valeur (pour re-dériver les badges après une mise à jour)
// ---------------------------------------------------------------------------
const ROLE_STYLES: Record<string, { label: string; emoji: string; color: string }> = {
  developer: { label: "Developer", emoji: "💻", color: "bg-teal/15 text-teal" },
  "2d-artist": { label: "2D Artist", emoji: "🎨", color: "bg-pink/15 text-pink" },
  "3d-artist": { label: "3D Artist", emoji: "🗿", color: "bg-peach/15 text-peach" },
  audio: { label: "Audio", emoji: "🎵", color: "bg-lavender/15 text-lavender" },
  writer: { label: "Writer", emoji: "✍️", color: "bg-pink/15 text-pink" },
  "game-design": { label: "Game Designer", emoji: "🎯", color: "bg-peach/15 text-peach" },
  "ui-ux": { label: "UI / UX", emoji: "✨", color: "bg-mint/15 text-mint" },
  qa: { label: "QA / Playtester", emoji: "🐛", color: "bg-peach/15 text-peach" },
}

const LEVEL_STYLES: Record<string, { label: string; emoji: string; color: string }> = {
  beginner: { label: "Beginner", emoji: "🌱", color: "bg-mint/15 text-mint" },
  hobbyist: { label: "Hobbyist", emoji: "🛠️", color: "bg-peach/15 text-peach" },
  confirmed: { label: "Confirmed", emoji: "🚀", color: "bg-teal/15 text-teal" },
  veteran: { label: "Veteran", emoji: "⭐", color: "bg-lavender/15 text-lavender" },
  expert: { label: "Expert", emoji: "👑", color: "bg-lavender/15 text-lavender" },
}

const FALLBACK_ROLE = { label: "Other", emoji: "❓", color: "bg-muted text-muted-foreground" }
const FALLBACK_LEVEL = LEVEL_STYLES["beginner"]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ProfileData = {
  id: string
  username: string
  avatarUrl: string
  role: { label: string; emoji: string; color: string }
  level: { label: string; emoji: string; color: string }
  engine: string
  language: string
  bio: string
  rawRole: string
  rawLevel: string
  portfolio_link?: string | null
}

// ---------------------------------------------------------------------------
// Carte individuelle avec mode édition
// ---------------------------------------------------------------------------
interface ProfileCardProps {
  profile: ProfileData
  onDelete: (id: string) => void
}

function ProfileCard({ profile, onDelete }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // États d'affichage (mis à jour après sauvegarde)
  const [rawRole, setRawRole] = useState(profile.rawRole)
  const [rawLevel, setRawLevel] = useState(profile.rawLevel)
  const [engine, setEngine] = useState(profile.engine)
  const [language, setLanguage] = useState(profile.language)
  const [portfolioLink, setPortfolioLink] = useState(profile.portfolio_link ?? "")

  // États temporaires pendant l'édition
  const [editRole, setEditRole] = useState(profile.rawRole)
  const [editLevel, setEditLevel] = useState(profile.rawLevel)
  const [editEngine, setEditEngine] = useState(profile.engine)
  const [editLanguage, setEditLanguage] = useState(profile.language)
  const [editPortfolioLink, setEditPortfolioLink] = useState(profile.portfolio_link ?? "")

  const displayRole = ROLE_STYLES[rawRole] ?? { ...FALLBACK_ROLE, label: rawRole }
  const displayLevel = LEVEL_STYLES[rawLevel] ?? FALLBACK_LEVEL

  const handleEdit = () => {
    setEditRole(rawRole)
    setEditLevel(rawLevel)
    setEditEngine(engine)
    setEditLanguage(language)
    setEditPortfolioLink(portfolioLink)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from("profiles")
      .update({
        role: editRole,
        experience: editLevel,
        engine: editEngine,
        language: editLanguage,
        portfolio_link: editPortfolioLink.trim() || null,
      })
      .eq("id", profile.id)

    if (error) {
      alert("Erreur lors de la sauvegarde : " + error.message)
    } else {
      setRawRole(editRole)
      setRawLevel(editLevel)
      setEngine(editEngine)
      setLanguage(editLanguage)
      setPortfolioLink(editPortfolioLink.trim())
      setIsEditing(false)
    }
    setSaving(false)
  }

  return (
    <Card className="group relative flex flex-col rounded-2xl border-border/50 bg-card transition-all duration-300 hover:border-lavender/30 hover:shadow-lg hover:shadow-lavender/5">
      <CardContent className="flex flex-1 flex-col gap-4 pt-6">
        {/* Avatar + Username */}
        <div className="flex items-center gap-3.5">
          <Avatar className="size-12 ring-2 ring-border/60">
            <AvatarImage src={profile.avatarUrl} alt={profile.username} />
            <AvatarFallback className="bg-secondary text-sm font-bold text-secondary-foreground">
              {profile.username
                .split(/[\s_]+/)
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-foreground">
              {profile.username}
            </h3>
            {isEditing ? (
              <div className="mt-1 flex items-center gap-1.5">
                <Globe className="size-3.5 shrink-0 text-teal" />
                <Select value={editLanguage} onValueChange={setEditLanguage}>
                  <SelectTrigger className="h-7 rounded-lg border-border/60 bg-secondary/50 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Globe className="size-3.5 text-teal" />
                {language}
              </div>
            )}
          </div>
        </div>

        {/* Rôle & Niveau */}
        {isEditing ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Rôle</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger className="h-8 rounded-lg border-border/60 bg-secondary/50 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Expérience</Label>
              <Select value={editLevel} onValueChange={setEditLevel}>
                <SelectTrigger className="h-8 rounded-lg border-border/60 bg-secondary/50 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.emoji} {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={`rounded-full px-3 py-1 text-xs font-semibold ${displayRole.color}`}
            >
              {displayRole.emoji} {displayRole.label}
            </Badge>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${displayLevel.color}`}
            >
              {displayLevel.emoji} {displayLevel.label}
            </span>
          </div>
        )}

        {/* Moteur de jeu */}
        {isEditing ? (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Moteur de jeu</Label>
            <div className="flex items-center gap-1.5">
              <Cpu className="size-3.5 shrink-0 text-lavender" />
              <Select value={editEngine} onValueChange={setEditEngine}>
                <SelectTrigger className="h-8 flex-1 rounded-lg border-border/60 bg-secondary/50 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENGINE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Cpu className="size-3.5 text-lavender" />
            {engine}
          </div>
        )}

        {/* Portfolio */}
        {isEditing ? (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              Portfolio / Itch.io{" "}
              <span className="font-normal text-muted-foreground/60">(optionnel)</span>
            </Label>
            <Input
              type="url"
              value={editPortfolioLink}
              onChange={(e) => setEditPortfolioLink(e.target.value)}
              placeholder="https://yourname.itch.io"
              className="h-8 rounded-lg border-border/60 bg-secondary/50 text-xs"
            />
          </div>
        ) : portfolioLink ? (
          <a
            href={portfolioLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-lavender hover:underline"
          >
            <ExternalLink className="size-3.5" />
            Portfolio
          </a>
        ) : null}

        {/* Bio */}
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {profile.bio}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        {isEditing ? (
          <>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full gap-2 rounded-xl bg-lavender text-lavender-foreground hover:bg-lavender/85"
            >
              <Save className="size-4" />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              className="w-full gap-2 rounded-xl"
            >
              <X className="size-4" />
              Annuler
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={handleEdit}
              className="w-full gap-2 rounded-xl border-lavender/30 text-lavender hover:bg-lavender/10 hover:text-lavender"
            >
              <PenLine className="size-4" />
              Modifier mon profil
            </Button>
            <Button
              variant="outline"
              onClick={() => onDelete(profile.id)}
              className="w-full gap-2 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
              Remove Profile
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------
interface DashboardMyAvailabilityProps {
  profiles: ProfileData[]
  onDelete: (id: string) => void
}

export function DashboardMyAvailability({
  profiles,
  onDelete,
}: DashboardMyAvailabilityProps) {
  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">My Availability</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your posted availability profiles
          </p>
        </div>
        <Button
          asChild
          className="gap-2 rounded-xl bg-lavender text-lavender-foreground hover:bg-lavender/85"
        >
          <Link href="/create-profile">
            <Hand className="size-4" />
            Post Availability
          </Link>
        </Button>
      </div>

      {profiles.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 rounded-2xl border-border/50 bg-card px-6 py-12 text-center">
          <PenLine className="size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            You haven{"'"}t posted your availability yet.
          </p>
          <Button
            asChild
            variant="outline"
            className="mt-2 gap-2 rounded-xl border-lavender/30 text-lavender hover:bg-lavender/10 hover:text-lavender"
          >
            <Link href="/create-profile">Let teams find you</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  )
}
