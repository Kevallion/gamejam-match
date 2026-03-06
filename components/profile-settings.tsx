"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"
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
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

export type ProfileSettingsProfile = {
  id: string
  username?: string | null
  discord_username?: string | null
  avatar_url?: string | null
  default_role?: string | null
  default_engine?: string | null
  default_language?: string | null
  portfolio_url?: string | null
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

  useEffect(() => {
    setUsername(profile?.username?.trim() ?? "")
    setDiscordUsername(profile?.discord_username?.trim() ?? "")
    setDefaultRole(profile?.default_role?.trim() ?? "")
    setDefaultEngine(profile?.default_engine?.trim() ?? "")
    setDefaultLanguage(profile?.default_language?.trim() ?? "")
    setPortfolioUrl(profile?.portfolio_url?.trim() ?? "")
  }, [profile?.username, profile?.discord_username, profile?.default_role, profile?.default_engine, profile?.default_language, profile?.portfolio_url])
  const [saving, setSaving] = useState(false)
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.id) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim() || null,
          discord_username: discordUsername.trim() || null,
          default_role: defaultRole.trim() || null,
          default_engine: defaultEngine.trim() || null,
          default_language: defaultLanguage.trim() || null,
          portfolio_url: portfolioUrl.trim() || null,
        })
        .eq("id", profile.id)

      if (error) {
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
    <div className="flex flex-col space-y-8">
      <form onSubmit={handleSaveProfile} className="flex flex-col space-y-8">
          {/* Card 1: Public Profile */}
        <Card className="rounded-xl border-border/60">
        <CardHeader>
          <CardTitle>Public Profile</CardTitle>
          <CardDescription>This is how others will see you on the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-center">
              <UserAvatar
                src={profile?.avatar_url ?? null}
                fallbackName={displayName}
                size="lg"
                className="size-24 shrink-0 rounded-2xl ring-2 ring-border/60"
              />
            </div>
            <p className="text-center text-sm font-medium text-foreground">{displayName}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-username">Username</Label>
              <Input
                id="profile-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. PixelWizard42"
                className="rounded-xl border-border/60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-discord">Discord Username</Label>
              <Input
                id="profile-discord"
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value)}
                placeholder="ex: gamer123"
                className="rounded-xl border-border/60"
              />
              <p className="text-xs text-muted-foreground">
                Visible to teammates in your squad. Used so they can invite you to group chats.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-portfolio-url">Portfolio URL</Label>
            <Input
              id="profile-portfolio-url"
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://yourname.itch.io or https://yourportfolio.com"
              className="rounded-xl border-border/60"
            />
          </div>
        </CardContent>
        </Card>

        {/* Card 2: Default Preferences */}
        <Card className="rounded-xl border-border/60">
        <CardHeader>
          <CardTitle>Default Preferences</CardTitle>
          <CardDescription>These settings will automatically pre-fill your availability posts to save you time.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="profile-default-role">Default Role</Label>
              <Select value={defaultRole || "any"} onValueChange={(v) => setDefaultRole(v === "any" ? "" : v)}>
                <SelectTrigger id="profile-default-role" className="rounded-xl border-border/60">
                  <SelectValue placeholder="None / No default" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="any">None / No default</SelectItem>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-default-engine">Default Engine</Label>
              <Select value={defaultEngine || "any"} onValueChange={(v) => setDefaultEngine(v === "any" ? "" : v)}>
                <SelectTrigger id="profile-default-engine" className="rounded-xl border-border/60">
                  <SelectValue placeholder="Any / No Preference" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {ENGINE_OPTIONS_WITH_ANY.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-default-language">Default Language</Label>
              <Select value={defaultLanguage || "any"} onValueChange={(v) => setDefaultLanguage(v === "any" ? "" : v)}>
                <SelectTrigger id="profile-default-language" className="rounded-xl border-border/60">
                  <SelectValue placeholder="None / No default" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="any">None / No default</SelectItem>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        </Card>

        {/* Single Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg" className="min-w-[180px] gap-2 rounded-xl">
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

      {/* Card 3: Notifications */}
      <Card className="rounded-xl border-border/60">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Enable Web Push to get notified when someone applies to your team or invites you.</CardDescription>
        </CardHeader>
        <CardContent>
          <PushNotificationManager />
        </CardContent>
      </Card>

      {/* Card 4: Danger Zone */}
      <Card className="rounded-xl border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions. Proceed with caution.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
          <button
            type="button"
            onClick={() => setShowDeleteAccountDialog(true)}
            className="flex shrink-0 items-center justify-center gap-2 self-end rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 sm:self-auto"
          >
            <Trash2 className="size-4" />
            Delete Account
          </button>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteAccountDialog} onOpenChange={(open) => !deletingAccount && setShowDeleteAccountDialog(open)}>
        <AlertDialogContent className="rounded-2xl border-border/60">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/15">
                <Trash2 className="size-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-left">Are you absolutely sure?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              This action cannot be undone. This will permanently delete your account, your profile, your availability posts, and remove you from any teams.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:justify-end">
            <AlertDialogCancel disabled={deletingAccount}>Cancel</AlertDialogCancel>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
            >
              {deletingAccount ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, delete my account"
              )}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
