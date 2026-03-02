"use client"

import { useState } from "react"
import { UserAvatar } from "@/components/user-avatar"
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
  RotateCcw,
  Save,
  Shuffle,
  Trash2,
  X,
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { AVATAR_GALLERY, getRandomAvatarGallery } from "@/lib/avatar-gallery"
import { toast } from "sonner"

import {
  ENGINE_OPTIONS_WITH_ANY,
  EXPERIENCE_OPTIONS,
  EXPERIENCE_STYLES,
  ROLE_OPTIONS,
  ROLE_STYLES,
} from "@/lib/constants"

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

const FALLBACK_ROLE = { label: "Other", emoji: "❓", color: "bg-muted text-muted-foreground" }
const FALLBACK_LEVEL = EXPERIENCE_STYLES["beginner"]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ProfileData = {
  id: string
  username: string
  avatar_url?: string | null
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
  onAvatarUpdate?: (id: string, avatarUrl: string | null) => void
  discordAvatarUrl?: string | null
}

function ProfileCard({ profile, onDelete, onAvatarUpdate, discordAvatarUrl }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [displayedAvatars, setDisplayedAvatars] = useState(() => [...AVATAR_GALLERY])

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
  const displayLevel = EXPERIENCE_STYLES[rawLevel] ?? FALLBACK_LEVEL

  const handleEdit = () => {
    setEditRole(rawRole)
    setEditLevel(rawLevel)
    setEditEngine(engine)
    setEditLanguage(language)
    setEditPortfolioLink(portfolioLink)
    setDisplayedAvatars([...AVATAR_GALLERY])
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleAvatarSelect = async (url: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", profile.id)
    if (error) {
      toast.error("Error updating avatar.", { description: error.message })
      return
    }
    toast.success("Avatar updated.")
    onAvatarUpdate?.(profile.id, url)
  }

  const handleAvatarReset = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", profile.id)
    if (error) {
      toast.error("Error during reset.", { description: error.message })
      return
    }
    toast.success("Avatar reset (Discord by default).")
    onAvatarUpdate?.(profile.id, null)
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
      toast.error("Error saving.", { description: error.message })
    } else {
      toast.success("Profile updated.")
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
          <UserAvatar
            profileAvatarUrl={profile.avatar_url}
            discordAvatarUrl={discordAvatarUrl}
            fallbackImageUrl={`https://api.dicebear.com/9.x/adventurer/svg?seed=${profile.username}&backgroundColor=d1d4f9`}
            username={profile.username}
            size="md"
          />
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

        {/* Section Apparence (galerie) — en mode édition */}
        {isEditing && (
          <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-secondary/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Appearance</span>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDisplayedAvatars(getRandomAvatarGallery())}
                  className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Shuffle className="size-3.5" />
                  Randomiser
                </Button>
                {(profile.avatar_url ?? null) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAvatarReset}
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="size-3.5" />
                    Reset
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Choose an avatar from the gallery. Otherwise, your Discord avatar will be displayed.
            </p>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-9">
              {displayedAvatars.map((item) => {
                const isSelected = profile.avatar_url === item.url
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAvatarSelect(item.url)}
                    className={`relative flex size-12 items-center justify-center overflow-hidden rounded-xl border-2 transition-all hover:scale-105 ${
                      isSelected
                        ? "border-lavender ring-2 ring-lavender/30"
                        : "border-border/60 hover:border-lavender/50"
                    }`}
                  >
                    <img
                      src={item.url}
                      alt=""
                      className="size-full object-cover"
                    />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Role & Level */}
        {isEditing ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Role</Label>
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
              <Label className="text-xs font-semibold text-muted-foreground">Experience</Label>
              <Select value={editLevel} onValueChange={setEditLevel}>
                <SelectTrigger className="h-8 rounded-lg border-border/60 bg-secondary/50 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_OPTIONS.map((opt) => (
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

        {/* Game engine */}
        {isEditing ? (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Game engine</Label>
            <div className="flex items-center gap-1.5">
              <Cpu className="size-3.5 shrink-0 text-lavender" />
              <Select value={editEngine} onValueChange={setEditEngine}>
                <SelectTrigger className="h-8 flex-1 rounded-lg border-border/60 bg-secondary/50 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENGINE_OPTIONS_WITH_ANY.map((opt) => (
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
              <span className="font-normal text-muted-foreground/60">(optional)</span>
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
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              className="w-full gap-2 rounded-xl"
            >
              <X className="size-4" />
              Cancel
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
              Edit my profile
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
  onAvatarUpdate?: (id: string, avatarUrl: string | null) => void
  discordAvatarUrl?: string | null
}

export function DashboardMyAvailability({
  profiles,
  onDelete,
  onAvatarUpdate,
  discordAvatarUrl,
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
            <ProfileCard
              key={profile.id}
              profile={profile}
              onDelete={onDelete}
              onAvatarUpdate={onAvatarUpdate}
              discordAvatarUrl={discordAvatarUrl}
            />
          ))}
        </div>
      )}
    </section>
  )
}
