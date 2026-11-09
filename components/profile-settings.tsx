"use client"

import { useState, useEffect, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ProfileCard } from "@/components/profile-card"
import { levelFromTotalXp } from "@/lib/gamification-level"
import { PushNotificationManager } from "@/components/push-notification-manager"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { deleteUserAccount } from "@/app/actions/auth-actions"
import { saveProfileSettings } from "@/app/actions/profile-settings-actions"
import {
  ROLE_OPTIONS,
  EXPERIENCE_OPTIONS,
  ENGINE_OPTIONS_WITH_ANY,
  LANGUAGE_OPTIONS,
  JAM_STYLE_OPTIONS,
  PROGRAMMING_LANGUAGE_OPTIONS,
  parseProgrammingLanguages,
  type ProgrammingLanguageValue,
} from "@/lib/constants"
import { ChevronDown, LoaderCircle, Trash2, UserRound, Settings, Bell, TriangleAlert, Link2, CodeXml, MessageSquareText } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { TagIcon } from "@/components/tag-icon"

type ProfileSettingsRole = {
  role: string
  experience_level: string
  is_primary: boolean
}

export type ProfileSettingsProfile = {
  id: string
  username?: string | null
  discord_username?: string | null
  avatar_url?: string | null
  default_role?: string | null
  jam_style?: string | null
  profile_roles?: ProfileSettingsRole[] | null
  default_engine?: string | null
  default_language?: string | null
  programming_languages?: string[] | null
  portfolio_url?: string | null
  xp?: number | null
  current_title?: string | null
}

type ProfileSettingsProps = {
  profile: ProfileSettingsProfile | null
  onProfileUpdated?: (patch?: { discord_username?: string | null }) => void
  /** Fallback when profile.username is empty (e.g. OAuth name before profile is saved) */
  displayNameFallback?: string | null
}

function SettingsSection({
  title,
  description,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string
  description: string
  icon: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="space-y-4">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl border border-border/40 bg-card/40 px-3 py-3 text-left transition-colors hover:bg-card/70"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-medium text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4">{children}</CollapsibleContent>
    </Collapsible>
  )
}

export function ProfileSettings({ profile, onProfileUpdated, displayNameFallback }: ProfileSettingsProps) {
  const [username, setUsername] = useState(profile?.username?.trim() ?? "")
  const [discordUsername, setDiscordUsername] = useState(profile?.discord_username?.trim() ?? "")
  const initialRoles = (profile?.profile_roles ?? [])
    .filter((role) => role?.role?.trim())
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
  const [primaryRole, setPrimaryRole] = useState(initialRoles[0]?.role?.trim() ?? profile?.default_role?.trim() ?? "")
  const [primaryExperience, setPrimaryExperience] = useState(initialRoles[0]?.experience_level?.trim() ?? "regular")
  const [secondaryRole, setSecondaryRole] = useState(initialRoles[1]?.role?.trim() ?? "")
  const [secondaryExperience, setSecondaryExperience] = useState(initialRoles[1]?.experience_level?.trim() ?? "regular")
  const [jamStyle, setJamStyle] = useState(profile?.jam_style?.trim() ?? "")
  const [defaultEngine, setDefaultEngine] = useState(profile?.default_engine?.trim() ?? "")
  const [defaultLanguage, setDefaultLanguage] = useState(profile?.default_language?.trim() ?? "")
  const [programmingLanguages, setProgrammingLanguages] = useState<ProgrammingLanguageValue[]>(
    parseProgrammingLanguages(profile?.programming_languages),
  )
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolio_url?.trim() ?? "")
  const [usernameTouched, setUsernameTouched] = useState(false)

  useEffect(() => {
    setUsername(profile?.username?.trim() ?? "")
    setUsernameTouched(false)
    setDiscordUsername(profile?.discord_username?.trim() ?? "")
    const nextRoles = (profile?.profile_roles ?? [])
      .filter((role) => role?.role?.trim())
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
    setPrimaryRole(nextRoles[0]?.role?.trim() ?? profile?.default_role?.trim() ?? "")
    setPrimaryExperience(nextRoles[0]?.experience_level?.trim() ?? "regular")
    setSecondaryRole(nextRoles[1]?.role?.trim() ?? "")
    setSecondaryExperience(nextRoles[1]?.experience_level?.trim() ?? "regular")
    setJamStyle(profile?.jam_style?.trim() ?? "")
    setDefaultEngine(profile?.default_engine?.trim() ?? "")
    setDefaultLanguage(profile?.default_language?.trim() ?? "")
    setProgrammingLanguages(parseProgrammingLanguages(profile?.programming_languages))
    setPortfolioUrl(profile?.portfolio_url?.trim() ?? "")
  }, [
    profile?.username,
    profile?.discord_username,
    profile?.default_role,
    profile?.jam_style,
    profile?.profile_roles,
    profile?.default_engine,
    profile?.default_language,
    profile?.programming_languages,
    profile?.portfolio_url,
    profile?.xp,
    profile?.current_title,
  ])

  const trimmedUsername = username.trim()
  const usernameEmpty = trimmedUsername.length === 0
  const usernameTooShort = trimmedUsername.length > 0 && trimmedUsername.length < 3
  const showUsernameError = usernameTooShort || (usernameTouched && usernameEmpty)
  const usernameErrorMessage = usernameTooShort
    ? "Username must be at least 3 characters long."
    : usernameEmpty
      ? "Username cannot be empty."
      : null
  const duplicateRoleSelected =
    primaryRole.trim().length > 0 &&
    secondaryRole.trim().length > 0 &&
    primaryRole.trim().toLowerCase() === secondaryRole.trim().toLowerCase()

  const [saving, setSaving] = useState(false)
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.id) return

    setUsernameTouched(true)
    if (usernameEmpty || trimmedUsername.length < 3) {
      toast.error("Invalid username", {
        description: usernameEmpty
          ? "Username cannot be empty."
          : "Username must be at least 3 characters long.",
      })
      return
    }

    if (duplicateRoleSelected) {
      toast.error("Roles must be different.", {
        description: "Please choose a different secondary role.",
      })
      return
    }

    setSaving(true)
    try {
      const roles = []
      if (primaryRole.trim()) {
        roles.push({
          role: primaryRole.trim(),
          experienceLevel: primaryExperience.trim() || "regular",
          isPrimary: true,
        })
      }
      if (secondaryRole.trim()) {
        roles.push({
          role: secondaryRole.trim(),
          experienceLevel: secondaryExperience.trim() || "regular",
          isPrimary: false,
        })
      }

      const result = await saveProfileSettings({
        username: trimmedUsername,
        discordUsername: discordUsername.trim() || null,
        defaultEngine: defaultEngine.trim() || null,
        defaultLanguage: defaultLanguage.trim() || null,
        programmingLanguages,
        portfolioUrl: portfolioUrl.trim() || null,
        jamStyle: jamStyle.trim() || null,
        roles,
      })

      if (!result.success) {
        toast.error("Could not update profile.", { description: result.error })
        return
      }
      toast.success(
        result.programmingLanguagesSaved === false && programmingLanguages.length > 0
          ? "Profile updated. Programming languages will save after the database update."
          : "Profile updated.",
      )
      onProfileUpdated?.({ discord_username: discordUsername.trim() || null })
    } catch (err) {
      toast.error("An error occurred.", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeletingAccount(true)
    try {
      const result = await deleteUserAccount()
      if (!result.success) {
        toast.error("Could not delete your account.", { description: result.error })
      }
    } catch (err) {
      const digest = err && typeof err === "object" && "digest" in err ? String((err as { digest?: string }).digest) : ""
      if (digest.startsWith("NEXT_REDIRECT")) throw err
      toast.error("An error occurred.", { description: err instanceof Error ? err.message : "Please try again." })
    } finally {
      setDeletingAccount(false)
    }
  }

  const displayName =
    profile?.username?.trim() ||
    profile?.discord_username?.trim() ||
    displayNameFallback?.trim() ||
    "Jammer"

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col space-y-8 py-2 md:space-y-10 md:py-8">
      {/* Page Header — hidden on mobile (MobileSectionTitle already shows Settings) */}
      <div className="hidden space-y-1 md:block">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        <SettingsSection
          title="Public profile"
          description="This is how others will see you on the platform."
          icon={<UserRound className="size-4 text-primary" />}
          defaultOpen
        >
          <Card className="border-border/50 bg-muted/30">
            <CardContent className="p-6 md:p-8">
              <div className="mb-8">
                <ProfileCard
                  avatarUrl={profile?.avatar_url ?? null}
                  displayName={displayName}
                  fallbackName={displayNameFallback ?? undefined}
                  currentTitle={
                    profile?.current_title?.trim()
                      ? profile.current_title.trim()
                      : "Rookie Jammer"
                  }
                  level={levelFromTotalXp(typeof profile?.xp === "number" ? profile.xp : 0)}
                  programmingLanguages={programmingLanguages}
                  size="lg"
                  subtitle="Your avatar is synced from your login provider"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="profile-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => setUsernameTouched(true)}
                  placeholder="e.g. PixelWizard42"
                  autoComplete="username"
                  aria-invalid={showUsernameError}
                  aria-describedby="profile-username-hint"
                  className={cn(
                    "h-11 rounded-lg border-border/50 bg-background transition-colors focus:border-primary/50",
                    showUsernameError && "border-destructive/60 focus-visible:ring-destructive/20",
                  )}
                />
                <p id="profile-username-hint" className="text-xs text-muted-foreground">
                  Your unique display name across the platform
                </p>
                {showUsernameError && usernameErrorMessage ? (
                  <p className="text-xs font-medium text-destructive">{usernameErrorMessage}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </SettingsSection>

        <SettingsSection
          title="Links"
          description="Discord and portfolio links for teammates"
          icon={<Link2 className="size-4 text-primary" />}
        >
          <Card className="border-border/50 bg-muted/30">
            <CardContent className="space-y-6 p-6 md:p-8">
              <div className="grid min-w-0 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profile-discord" className="flex items-center gap-2 text-sm font-medium">
                    <MessageSquareText className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    Discord Username
                  </Label>
                  <Input
                    id="profile-discord"
                    value={discordUsername}
                    onChange={(e) => setDiscordUsername(e.target.value)}
                    placeholder="e.g. gamer123"
                    className="h-11 w-full rounded-lg border-border/50 bg-background transition-colors focus:border-primary/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Visible to teammates for group chat invites
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-portfolio-url" className="flex items-center gap-2 text-sm font-medium">
                    <Link2 className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    Portfolio URL
                  </Label>
                  <Input
                    id="profile-portfolio-url"
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourname.itch.io or https://yourportfolio.com"
                    className="h-11 w-full rounded-lg border-border/50 bg-background transition-colors focus:border-primary/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Showcase your work to potential teammates
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </SettingsSection>

        <SettingsSection
          title="Default preferences"
          description="Pre-fill your availability posts automatically"
          icon={<Settings className="size-4 text-primary" />}
        >
          <Card className="border-border/50 bg-muted/30">
            <CardContent className="p-6 md:p-8">
              <div className="grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="profile-primary-role" className="text-sm font-medium">
                    Primary Role
                  </Label>
                  <Select value={primaryRole || "any"} onValueChange={(v) => setPrimaryRole(v === "any" ? "" : v)}>
                    <SelectTrigger id="profile-primary-role" className="h-11 rounded-lg border-border/50 bg-background">
                      <SelectValue placeholder="None / No default" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="any">None / No default</SelectItem>
                      {ROLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="inline-flex min-w-0 items-center gap-2">
                            <TagIcon kind="role" value={opt.value} size="xs" withTooltip={false} />
                            <span className="truncate">{opt.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Main role used as your default role
                  </p>
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="profile-primary-experience" className="text-sm font-medium">
                    Primary Role Experience
                  </Label>
                  <Select value={primaryExperience} onValueChange={setPrimaryExperience}>
                    <SelectTrigger id="profile-primary-experience" className="h-11 rounded-lg border-border/50 bg-background">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      {EXPERIENCE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="inline-flex min-w-0 items-center gap-2">
                            <TagIcon kind="level" value={opt.value} size="xs" withTooltip={false} />
                            <span className="truncate">{opt.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Your experience for this role
                  </p>
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="profile-secondary-role" className="text-sm font-medium">
                    Secondary Role (optional)
                  </Label>
                  <Select value={secondaryRole || "any"} onValueChange={(v) => setSecondaryRole(v === "any" ? "" : v)}>
                    <SelectTrigger
                      id="profile-secondary-role"
                      className={cn(
                        "h-11 rounded-lg border-border/50 bg-background",
                        duplicateRoleSelected && "border-destructive/60 focus-visible:ring-destructive/20",
                      )}
                    >
                      <SelectValue placeholder="None / No secondary role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="any">None / No secondary role</SelectItem>
                      {ROLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="inline-flex min-w-0 items-center gap-2">
                            <TagIcon kind="role" value={opt.value} size="xs" withTooltip={false} />
                            <span className="truncate">{opt.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Add a second role you can also contribute with
                  </p>
                  {duplicateRoleSelected ? (
                    <p className="text-xs font-medium text-destructive">
                      Secondary role must be different from primary role.
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="profile-secondary-experience" className="text-sm font-medium">
                    Secondary Role Experience
                  </Label>
                  <Select
                    value={secondaryExperience}
                    onValueChange={setSecondaryExperience}
                    disabled={!secondaryRole.trim()}
                  >
                    <SelectTrigger id="profile-secondary-experience" className="h-11 rounded-lg border-border/50 bg-background">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      {EXPERIENCE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="inline-flex min-w-0 items-center gap-2">
                            <TagIcon kind="level" value={opt.value} size="xs" withTooltip={false} />
                            <span className="truncate">{opt.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Only used when a secondary role is set
                  </p>
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="profile-jam-style" className="text-sm font-medium">
                    Jam Style
                  </Label>
                  <Select value={jamStyle || "any"} onValueChange={(v) => setJamStyle(v === "any" ? "" : v)}>
                    <SelectTrigger id="profile-jam-style" className="h-11 rounded-lg border-border/50 bg-background">
                      <SelectValue placeholder="None / No preference" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="any">None / No preference</SelectItem>
                      {JAM_STYLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="inline-flex min-w-0 items-center gap-2">
                            <TagIcon kind="style" value={opt.value} size="xs" withTooltip={false} />
                            <span className="truncate">{opt.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    The vibe you prefer during game jams
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-default-engine" className="text-sm font-medium">
                    Default Engine
                  </Label>
                  <Select value={defaultEngine || "any"} onValueChange={(v) => setDefaultEngine(v === "any" ? "" : v)}>
                    <SelectTrigger id="profile-default-engine" className="h-11 rounded-lg border-border/50 bg-background">
                      <SelectValue placeholder="Any / No Preference" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      {ENGINE_OPTIONS_WITH_ANY.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Preferred game engine
                  </p>
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="profile-default-language" className="text-sm font-medium">
                    Default Language
                  </Label>
                  <Select value={defaultLanguage || "any"} onValueChange={(v) => setDefaultLanguage(v === "any" ? "" : v)}>
                    <SelectTrigger id="profile-default-language" className="h-11 rounded-lg border-border/50 bg-background">
                      <SelectValue placeholder="None / No default" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="any">None / No default</SelectItem>
                      {LANGUAGE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Communication language
                  </p>
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                  <Label id="profile-programming-languages" className="flex items-center gap-2 text-sm font-medium">
                    <CodeXml className="size-3.5 text-muted-foreground" />
                    Programming languages
                  </Label>
                  <div
                    role="group"
                    aria-labelledby="profile-programming-languages"
                    className="flex min-w-0 flex-wrap gap-2"
                  >
                    {PROGRAMMING_LANGUAGE_OPTIONS.map((option) => {
                      const selected = programmingLanguages.includes(option.value)
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            setProgrammingLanguages((current) =>
                              current.includes(option.value)
                                ? current.filter((value) => value !== option.value)
                                : [...current, option.value],
                            )
                          }
                          className={cn(
                            "inline-flex max-w-full min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors",
                            selected
                              ? "border-lavender/40 bg-lavender/15 text-lavender"
                              : "border-border/60 bg-card text-muted-foreground hover:border-border hover:text-foreground",
                          )}
                        >
                          <span aria-hidden>{option.short}</span>
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Languages you write in. Shown on your profile and member cards.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </SettingsSection>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving}
            size="lg"
            className="min-w-[160px] gap-2 rounded-lg font-medium shadow-sm transition-all hover:shadow-md"
          >
            {saving ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-accent">
            <Bell className="size-4 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">Notifications</h2>
            <p className="text-sm text-muted-foreground">Get notified about squad applications and invites</p>
          </div>
        </div>

        <Card className="border-border/50 bg-muted/30">
          <CardContent className="p-6 md:p-8">
            <PushNotificationManager />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10">
            <TriangleAlert className="size-4 text-destructive" />
          </div>
          <div>
            <h2 className="text-base font-medium text-destructive">Danger Zone</h2>
            <p className="text-sm text-muted-foreground">Irreversible actions. Proceed with caution.</p>
          </div>
        </div>

        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This cannot be undone.
                </p>
              </div>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteAccountDialog(true)}
                className="shrink-0 gap-2 rounded-lg font-medium"
              >
                <Trash2 className="size-4" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <AlertDialog open={showDeleteAccountDialog} onOpenChange={(open) => !deletingAccount && setShowDeleteAccountDialog(open)}>
        <AlertDialogContent className="rounded-2xl border-border/50">
          <AlertDialogHeader>
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/10">
                <TriangleAlert className="size-6 text-destructive" />
              </div>
              <div className="space-y-1">
                <AlertDialogTitle className="text-left">Delete your account?</AlertDialogTitle>
                <AlertDialogDescription className="text-left text-sm">
                  This action cannot be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              This will permanently delete your account, your profile, your availability posts, and remove you from any teams.
            </p>
          </div>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel disabled={deletingAccount} className="rounded-lg">
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="gap-2 rounded-lg"
            >
              {deletingAccount ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, delete my account"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
