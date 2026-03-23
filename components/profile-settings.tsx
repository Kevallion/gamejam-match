"use client"

import { useState, useEffect } from "react"
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
import { deleteUserAccount } from "@/app/actions/auth-actions"
import { supabase } from "@/lib/supabase"
import { ROLE_OPTIONS, ENGINE_OPTIONS_WITH_ANY, LANGUAGE_OPTIONS } from "@/lib/constants"
import { Loader2, Trash2, User, Settings, Bell, AlertTriangle, Link2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

function isUsernameUniqueViolation(error: {
  code?: string
  message?: string
  details?: string | null
}): boolean {
  if (error.code !== "23505") return false
  const combined = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase()
  return combined.includes("username")
}

export type ProfileSettingsProfile = {
  id: string
  username?: string | null
  discord_username?: string | null
  avatar_url?: string | null
  default_role?: string | null
  default_engine?: string | null
  default_language?: string | null
  portfolio_url?: string | null
  xp?: number | null
  current_title?: string | null
}

type ProfileSettingsProps = {
  profile: ProfileSettingsProfile | null
  onProfileUpdated?: () => void
  /** Fallback when profile.username is empty (e.g. OAuth name before profile is saved) */
  displayNameFallback?: string | null
}

export function ProfileSettings({ profile, onProfileUpdated, displayNameFallback }: ProfileSettingsProps) {
  const [username, setUsername] = useState(profile?.username?.trim() ?? "")
  const [discordUsername, setDiscordUsername] = useState(profile?.discord_username?.trim() ?? "")
  const [defaultRole, setDefaultRole] = useState(profile?.default_role?.trim() ?? "")
  const [defaultEngine, setDefaultEngine] = useState(profile?.default_engine?.trim() ?? "")
  const [defaultLanguage, setDefaultLanguage] = useState(profile?.default_language?.trim() ?? "")
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolio_url?.trim() ?? "")
  const [usernameTouched, setUsernameTouched] = useState(false)

  useEffect(() => {
    setUsername(profile?.username?.trim() ?? "")
    setUsernameTouched(false)
    setDiscordUsername(profile?.discord_username?.trim() ?? "")
    setDefaultRole(profile?.default_role?.trim() ?? "")
    setDefaultEngine(profile?.default_engine?.trim() ?? "")
    setDefaultLanguage(profile?.default_language?.trim() ?? "")
    setPortfolioUrl(profile?.portfolio_url?.trim() ?? "")
  }, [
    profile?.username,
    profile?.discord_username,
    profile?.default_role,
    profile?.default_engine,
    profile?.default_language,
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

    setSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: trimmedUsername,
          discord_username: discordUsername.trim() || null,
          default_role: defaultRole.trim() || null,
          default_engine: defaultEngine.trim() || null,
          default_language: defaultLanguage.trim() || null,
          portfolio_url: portfolioUrl.trim() || null,
        })
        .eq("id", profile.id)

      if (error) {
        if (isUsernameUniqueViolation(error)) {
          toast.error("This username is already taken. Please choose another one.")
          return
        }
        toast.error("Could not update profile.", { description: error.message })
        return
      }
      toast.success("Profile updated.")
      onProfileUpdated?.()
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
    <div className="flex w-full flex-col space-y-10 py-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Section: Public Profile */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <User className="size-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-medium text-foreground">Public Profile</h2>
              <p className="text-sm text-muted-foreground">This is how others will see you on the platform.</p>
            </div>
          </div>

          <Card className="border-border/50 bg-muted/30">
            <CardContent className="p-6 md:p-8">
              {/* Avatar + jammer title / level */}
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
                  size="lg"
                  subtitle="Your avatar is synced from your login provider"
                />
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
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
                        showUsernameError && "border-destructive/60 focus-visible:ring-destructive/20"
                      )}
                    />
                    <p id="profile-username-hint" className="text-xs text-muted-foreground">
                      Your unique display name across the platform
                    </p>
                    {showUsernameError && usernameErrorMessage ? (
                      <p className="text-xs font-medium text-destructive">{usernameErrorMessage}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-discord" className="text-sm font-medium">
                      Discord Username
                    </Label>
                    <Input
                      id="profile-discord"
                      value={discordUsername}
                      onChange={(e) => setDiscordUsername(e.target.value)}
                      placeholder="e.g. gamer123"
                      className="h-11 rounded-lg border-border/50 bg-background transition-colors focus:border-primary/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Visible to teammates for group chat invites
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-portfolio-url" className="flex items-center gap-2 text-sm font-medium">
                    <Link2 className="size-3.5 text-muted-foreground" />
                    Portfolio URL
                  </Label>
                  <Input
                    id="profile-portfolio-url"
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourname.itch.io or https://yourportfolio.com"
                    className="h-11 rounded-lg border-border/50 bg-background transition-colors focus:border-primary/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Showcase your work to potential teammates
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section: Default Preferences */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
              <Settings className="size-4 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="text-base font-medium text-foreground">Default Preferences</h2>
              <p className="text-sm text-muted-foreground">Pre-fill your availability posts automatically</p>
            </div>
          </div>

          <Card className="border-border/50 bg-muted/30">
            <CardContent className="p-6 md:p-8">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="profile-default-role" className="text-sm font-medium">
                    Default Role
                  </Label>
                  <Select value={defaultRole || "any"} onValueChange={(v) => setDefaultRole(v === "any" ? "" : v)}>
                    <SelectTrigger id="profile-default-role" className="h-11 rounded-lg border-border/50 bg-background">
                      <SelectValue placeholder="None / No default" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="any">None / No default</SelectItem>
                      {ROLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Your primary contribution
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
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving}
            size="lg"
            className="min-w-[160px] gap-2 rounded-lg font-medium shadow-sm transition-all hover:shadow-md"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>

      {/* Section: Notifications */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-accent">
            <Bell className="size-4 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">Notifications</h2>
            <p className="text-sm text-muted-foreground">Get notified about team applications and invites</p>
          </div>
        </div>

        <Card className="border-border/50 bg-muted/30">
          <CardContent className="p-6 md:p-8">
            <PushNotificationManager />
          </CardContent>
        </Card>
      </section>

      {/* Section: Danger Zone */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10">
            <AlertTriangle className="size-4 text-destructive" />
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

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteAccountDialog} onOpenChange={(open) => !deletingAccount && setShowDeleteAccountDialog(open)}>
        <AlertDialogContent className="rounded-2xl border-border/50">
          <AlertDialogHeader>
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/10">
                <AlertTriangle className="size-6 text-destructive" />
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
                  <Loader2 className="size-4 animate-spin" />
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
