"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { TagIcon } from "@/components/tag-icon"
import { SectionAnchorNav } from "@/components/section-anchor-nav"
import { useSectionScrollSpy } from "@/hooks/use-section-scroll-spy"
import { JammerCardPreview, type JammerCardData } from "@/components/player-card"
import { AppIcon, IconTile } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"

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
  displayNameFallback?: string | null
}

export const SETTINGS_SECTION_IDS = {
  profile: "settings-profile",
  preferences: "settings-preferences",
  notifications: "settings-notifications",
  account: "settings-account",
} as const

const SETTINGS_ANCHORS = [
  { id: SETTINGS_SECTION_IDS.profile, label: "Profile" },
  { id: SETTINGS_SECTION_IDS.preferences, label: "Preferences" },
  { id: SETTINGS_SECTION_IDS.notifications, label: "Notifications" },
  { id: SETTINGS_SECTION_IDS.account, label: "Account" },
]

const AUTOSAVE_DEBOUNCE_MS = 600

type SavedTextBaseline = {
  username: string
  discordUsername: string
  portfolioUrl: string
}

type SavedSelectBaseline = {
  primaryRole: string
  primaryExperience: string
  secondaryRole: string
  secondaryExperience: string
  jamStyle: string
  defaultEngine: string
  defaultLanguage: string
  programmingLanguages: ProgrammingLanguageValue[]
}

function rolesFromProfile(profile: ProfileSettingsProfile | null) {
  return (profile?.profile_roles ?? [])
    .filter((role) => role?.role?.trim())
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
}

function buildSelectBaseline(profile: ProfileSettingsProfile | null): SavedSelectBaseline {
  const roles = rolesFromProfile(profile)
  return {
    primaryRole: roles[0]?.role?.trim() ?? profile?.default_role?.trim() ?? "",
    primaryExperience: roles[0]?.experience_level?.trim() ?? "regular",
    secondaryRole: roles[1]?.role?.trim() ?? "",
    secondaryExperience: roles[1]?.experience_level?.trim() ?? "regular",
    jamStyle: profile?.jam_style?.trim() ?? "",
    defaultEngine: profile?.default_engine?.trim() ?? "",
    defaultLanguage: profile?.default_language?.trim() ?? "",
    programmingLanguages: parseProgrammingLanguages(profile?.programming_languages),
  }
}

function buildTextBaseline(profile: ProfileSettingsProfile | null): SavedTextBaseline {
  return {
    username: profile?.username?.trim() ?? "",
    discordUsername: profile?.discord_username?.trim() ?? "",
    portfolioUrl: profile?.portfolio_url?.trim() ?? "",
  }
}

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((value, index) => value === sortedB[index])
}

function SettingsSectionPanel({
  id,
  title,
  description,
  tone,
  children,
}: {
  id: string
  title: string
  description: string
  tone: "teal" | "lavender" | "peach" | "destructive"
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28 space-y-4 md:scroll-mt-32">
      <div className="flex items-start gap-3">
        <IconTile
          icon={
            tone === "teal"
              ? ICON.jammer
              : tone === "lavender"
                ? ICON.settings
                : tone === "peach"
                  ? ICON.notifications
                  : ICON.danger
          }
          tone={tone === "destructive" ? "destructive" : tone}
        />
        <div className="min-w-0">
          <h2
            className={cn(
              "text-base font-semibold text-foreground",
              tone === "destructive" && "text-destructive",
            )}
          >
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

export function ProfileSettings({ profile, onProfileUpdated, displayNameFallback }: ProfileSettingsProps) {
  const [username, setUsername] = useState(profile?.username?.trim() ?? "")
  const [discordUsername, setDiscordUsername] = useState(profile?.discord_username?.trim() ?? "")
  const initialRoles = rolesFromProfile(profile)
  const [primaryRole, setPrimaryRole] = useState(
    initialRoles[0]?.role?.trim() ?? profile?.default_role?.trim() ?? "",
  )
  const [primaryExperience, setPrimaryExperience] = useState(
    initialRoles[0]?.experience_level?.trim() ?? "regular",
  )
  const [secondaryRole, setSecondaryRole] = useState(initialRoles[1]?.role?.trim() ?? "")
  const [secondaryExperience, setSecondaryExperience] = useState(
    initialRoles[1]?.experience_level?.trim() ?? "regular",
  )
  const [jamStyle, setJamStyle] = useState(profile?.jam_style?.trim() ?? "")
  const [defaultEngine, setDefaultEngine] = useState(profile?.default_engine?.trim() ?? "")
  const [defaultLanguage, setDefaultLanguage] = useState(profile?.default_language?.trim() ?? "")
  const [programmingLanguages, setProgrammingLanguages] = useState<ProgrammingLanguageValue[]>(
    parseProgrammingLanguages(profile?.programming_languages),
  )
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolio_url?.trim() ?? "")
  const [usernameTouched, setUsernameTouched] = useState(false)

  const [textBaseline, setTextBaseline] = useState<SavedTextBaseline>(() => buildTextBaseline(profile))
  const [selectBaseline, setSelectBaseline] = useState<SavedSelectBaseline>(() =>
    buildSelectBaseline(profile),
  )

  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autosaveInFlightRef = useRef(false)
  const [autosaving, setAutosaving] = useState(false)
  const [autosavedAt, setAutosavedAt] = useState<number | null>(null)

  useEffect(() => {
    const nextText = buildTextBaseline(profile)
    const nextSelect = buildSelectBaseline(profile)
    setUsername(nextText.username)
    setDiscordUsername(nextText.discordUsername)
    setPortfolioUrl(nextText.portfolioUrl)
    setTextBaseline(nextText)
    setSelectBaseline(nextSelect)
    setUsernameTouched(false)
    const nextRoles = rolesFromProfile(profile)
    setPrimaryRole(nextRoles[0]?.role?.trim() ?? profile?.default_role?.trim() ?? "")
    setPrimaryExperience(nextRoles[0]?.experience_level?.trim() ?? "regular")
    setSecondaryRole(nextRoles[1]?.role?.trim() ?? "")
    setSecondaryExperience(nextRoles[1]?.experience_level?.trim() ?? "regular")
    setJamStyle(profile?.jam_style?.trim() ?? "")
    setDefaultEngine(profile?.default_engine?.trim() ?? "")
    setDefaultLanguage(profile?.default_language?.trim() ?? "")
    setProgrammingLanguages(parseProgrammingLanguages(profile?.programming_languages))
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

  const textDirty = useMemo(() => {
    return (
      trimmedUsername !== textBaseline.username ||
      discordUsername.trim() !== textBaseline.discordUsername ||
      portfolioUrl.trim() !== textBaseline.portfolioUrl
    )
  }, [trimmedUsername, discordUsername, portfolioUrl, textBaseline])

  const selectDirty = useMemo(() => {
    return (
      primaryRole !== selectBaseline.primaryRole ||
      primaryExperience !== selectBaseline.primaryExperience ||
      secondaryRole !== selectBaseline.secondaryRole ||
      secondaryExperience !== selectBaseline.secondaryExperience ||
      jamStyle !== selectBaseline.jamStyle ||
      defaultEngine !== selectBaseline.defaultEngine ||
      defaultLanguage !== selectBaseline.defaultLanguage ||
      !arraysEqual(programmingLanguages, selectBaseline.programmingLanguages)
    )
  }, [
    primaryRole,
    primaryExperience,
    secondaryRole,
    secondaryExperience,
    jamStyle,
    defaultEngine,
    defaultLanguage,
    programmingLanguages,
    selectBaseline,
  ])

  const [saving, setSaving] = useState(false)
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  const activeSection = useSectionScrollSpy([
    SETTINGS_SECTION_IDS.profile,
    SETTINGS_SECTION_IDS.preferences,
    SETTINGS_SECTION_IDS.notifications,
    SETTINGS_SECTION_IDS.account,
  ])

  const buildRolesPayload = useCallback(() => {
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
    return roles
  }, [primaryRole, primaryExperience, secondaryRole, secondaryExperience])

  const persistSettings = useCallback(
    async (textValues: SavedTextBaseline, mode: "manual" | "auto") => {
      if (!profile?.id) return { ok: false as const }

      const usernameValue = textValues.username.trim()
      if (usernameValue.length < 3) {
        if (mode === "manual") {
          toast.error("Invalid username", {
            description: "Username must be at least 3 characters long.",
          })
        }
        return { ok: false as const }
      }

      if (duplicateRoleSelected) {
        if (mode === "manual") {
          toast.error("Roles must be different.", {
            description: "Please choose a different secondary role.",
          })
        }
        return { ok: false as const }
      }

      const result = await saveProfileSettings({
        username: usernameValue,
        discordUsername: textValues.discordUsername.trim() || null,
        defaultEngine: defaultEngine.trim() || null,
        defaultLanguage: defaultLanguage.trim() || null,
        programmingLanguages,
        portfolioUrl: textValues.portfolioUrl.trim() || null,
        jamStyle: jamStyle.trim() || null,
        roles: buildRolesPayload(),
      })

      if (!result.success) {
        if (mode === "manual") {
          toast.error("Could not update profile.", { description: result.error })
        } else {
          toast.error("Autosave failed.", { description: result.error })
        }
        return { ok: false as const }
      }

      const nextText = {
        username: usernameValue,
        discordUsername: textValues.discordUsername.trim(),
        portfolioUrl: textValues.portfolioUrl.trim(),
      }
      setTextBaseline(nextText)
      setSelectBaseline({
        primaryRole,
        primaryExperience,
        secondaryRole,
        secondaryExperience,
        jamStyle,
        defaultEngine,
        defaultLanguage,
        programmingLanguages: [...programmingLanguages],
      })

      if (mode === "manual") {
        toast.success(
          result.programmingLanguagesSaved === false && programmingLanguages.length > 0
            ? "Profile updated. Programming languages will save after the database update."
            : "Profile updated.",
        )
        onProfileUpdated?.({ discord_username: nextText.discordUsername || null })
      } else {
        setAutosavedAt(Date.now())
        onProfileUpdated?.({ discord_username: nextText.discordUsername || null })
      }

      return { ok: true as const }
    },
    [
      profile?.id,
      defaultEngine,
      defaultLanguage,
      programmingLanguages,
      jamStyle,
      buildRolesPayload,
      duplicateRoleSelected,
      primaryRole,
      primaryExperience,
      secondaryRole,
      secondaryExperience,
      onProfileUpdated,
    ],
  )

  const runAutosaveImpl = useCallback(async () => {
    if (!profile?.id || !selectDirty || autosaveInFlightRef.current || duplicateRoleSelected) return
    autosaveInFlightRef.current = true
    setAutosaving(true)
    try {
      await persistSettings(textBaseline, "auto")
    } finally {
      autosaveInFlightRef.current = false
      setAutosaving(false)
    }
  }, [profile?.id, selectDirty, persistSettings, textBaseline, duplicateRoleSelected])

  useEffect(() => {
    if (!selectDirty || !profile?.id) return
    if (duplicateRoleSelected) return

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    autosaveTimerRef.current = setTimeout(() => {
      void runAutosaveImpl()
    }, AUTOSAVE_DEBOUNCE_MS)

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    }
  }, [
    selectDirty,
    textDirty,
    profile?.id,
    duplicateRoleSelected,
    runAutosaveImpl,
    primaryRole,
    primaryExperience,
    secondaryRole,
    secondaryExperience,
    jamStyle,
    defaultEngine,
    defaultLanguage,
    programmingLanguages,
  ])

  useEffect(() => {
    if (!autosavedAt) return
    const timer = setTimeout(() => setAutosavedAt(null), 3500)
    return () => clearTimeout(timer)
  }, [autosavedAt])

  useEffect(() => {
    if (!textDirty) return
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [textDirty])

  const handleSaveProfile = async () => {
    setUsernameTouched(true)
    setSaving(true)
    try {
      await persistSettings(
        {
          username: trimmedUsername,
          discordUsername,
          portfolioUrl,
        },
        "manual",
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDiscardText = () => {
    setUsername(textBaseline.username)
    setDiscordUsername(textBaseline.discordUsername)
    setPortfolioUrl(textBaseline.portfolioUrl)
    setUsernameTouched(false)
  }

  const handleDeleteAccount = async () => {
    setDeletingAccount(true)
    try {
      const result = await deleteUserAccount()
      if (!result.success) {
        toast.error("Could not delete your account.", { description: result.error })
      }
    } catch (err) {
      const digest =
        err && typeof err === "object" && "digest" in err ? String((err as { digest?: string }).digest) : ""
      if (digest.startsWith("NEXT_REDIRECT")) throw err
      toast.error("An error occurred.", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setDeletingAccount(false)
    }
  }

  const previewName =
    trimmedUsername ||
    textBaseline.username ||
    profile?.discord_username?.trim() ||
    displayNameFallback?.trim() ||
    "Jammer"

  const previewPlayer = useMemo((): JammerCardData => {
    const roleKey = primaryRole.trim().toLowerCase()
    const roleLabel = ROLE_OPTIONS.find((opt) => opt.value === roleKey)?.label ?? primaryRole.trim()
    const levelKey = primaryExperience.trim().toLowerCase() || "regular"
    const levelOpt = EXPERIENCE_OPTIONS.find((opt) => opt.value === levelKey)
    const jamKey = jamStyle.trim().toLowerCase()
    const jamOpt = JAM_STYLE_OPTIONS.find((opt) => opt.value === jamKey)

    return {
      id: profile?.id ?? "preview",
      username: previewName,
      avatar_url: profile?.avatar_url ?? null,
      role: {
        key: roleKey || undefined,
        label: roleLabel || "—",
        color: "",
      },
      level: {
        key: levelKey,
        label: levelOpt?.label ?? "—",
        color: levelOpt?.color ?? "bg-muted text-muted-foreground",
      },
      jamStyle: jamOpt ? { key: jamKey, label: jamOpt.label, color: jamOpt.color } : undefined,
      engine: defaultEngine.trim(),
      bio: "",
      language: defaultLanguage.trim(),
      portfolio_link: portfolioUrl.trim() || undefined,
      jammerTitle: profile?.current_title?.trim() || "Rookie Jammer",
      jammerLevel: levelFromTotalXp(typeof profile?.xp === "number" ? profile.xp : 0),
      programmingLanguages,
    }
  }, [
    primaryRole,
    primaryExperience,
    jamStyle,
    defaultEngine,
    defaultLanguage,
    portfolioUrl,
    programmingLanguages,
    previewName,
    profile?.avatar_url,
    profile?.current_title,
    profile?.id,
    profile?.xp,
  ])

  const showAutosaved = autosavedAt !== null && !autosaving
  const showAutosaveSpinner = autosaving

  return (
    <div className="relative flex w-full min-w-0 max-w-full flex-col gap-6 pb-24 md:gap-8">
      <div className="hidden space-y-1 md:block">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <AutosaveIndicator
        showAutosaved={showAutosaved}
        showAutosaveSpinner={showAutosaveSpinner}
      />

      <SectionAnchorNav items={SETTINGS_ANCHORS} activeId={activeSection} />

      <div className="grid min-w-0 gap-8 lg:grid-cols-12 lg:gap-10">
        <SettingsFormColumn
          className="min-w-0 space-y-8 lg:col-span-8"
          onSubmit={(event) => {
            event.preventDefault()
            void handleSaveProfile()
          }}
        >
          <SettingsSectionPanel
            id={SETTINGS_SECTION_IDS.profile}
            title="Public profile"
            description="This is how others will see you on the platform."
            tone="teal"
          >
            <Card className="border-border/50 bg-muted/30">
              <CardContent className="space-y-6 p-6 md:p-8">
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
                      "h-11 rounded-xl border-border/50 bg-background transition-colors focus:border-primary/50",
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

                <div className="grid min-w-0 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-discord" className="flex items-center gap-2 text-sm font-medium">
                      <AppIcon icon={ICON.note} size="sm" className="text-muted-foreground" />
                      Discord Username
                    </Label>
                    <Input
                      id="profile-discord"
                      value={discordUsername}
                      onChange={(e) => setDiscordUsername(e.target.value)}
                      placeholder="e.g. gamer123"
                      className="h-11 w-full rounded-xl border-border/50 bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-portfolio-url" className="flex items-center gap-2 text-sm font-medium">
                      <AppIcon icon={ICON.link} size="sm" className="text-muted-foreground" />
                      Portfolio URL
                    </Label>
                    <Input
                      id="profile-portfolio-url"
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://yourname.itch.io"
                      className="h-11 w-full rounded-xl border-border/50 bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </SettingsSectionPanel>

          <SettingsSectionPanel
            id={SETTINGS_SECTION_IDS.preferences}
            title="Default preferences"
            description="Pre-fill your availability posts automatically. Changes save on their own."
            tone="lavender"
          >
            <Card className="border-border/50 bg-muted/30">
              <CardContent className="p-6 md:p-8">
                <div className="grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="profile-primary-role" className="text-sm font-medium">
                      Primary Role
                    </Label>
                    <Select
                      value={primaryRole || "any"}
                      onValueChange={(v) => setPrimaryRole(v === "any" ? "" : v)}
                    >
                      <SelectTrigger id="profile-primary-role" className="h-11 rounded-xl border-border/50 bg-background">
                        <SelectValue placeholder="None / No default" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
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
                  </div>
                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="profile-primary-experience" className="text-sm font-medium">
                      Primary Role Experience
                    </Label>
                    <Select value={primaryExperience} onValueChange={setPrimaryExperience}>
                      <SelectTrigger
                        id="profile-primary-experience"
                        className="h-11 rounded-xl border-border/50 bg-background"
                      >
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
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
                  </div>
                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="profile-secondary-role" className="text-sm font-medium">
                      Secondary Role (optional)
                    </Label>
                    <Select
                      value={secondaryRole || "any"}
                      onValueChange={(v) => setSecondaryRole(v === "any" ? "" : v)}
                    >
                      <SelectTrigger
                        id="profile-secondary-role"
                        className={cn(
                          "h-11 rounded-xl border-border/50 bg-background",
                          duplicateRoleSelected && "border-destructive/60",
                        )}
                      >
                        <SelectValue placeholder="None / No secondary role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
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
                      <SelectTrigger
                        id="profile-secondary-experience"
                        className="h-11 rounded-xl border-border/50 bg-background"
                      >
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
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
                  </div>
                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="profile-jam-style" className="text-sm font-medium">
                      Jam Style
                    </Label>
                    <Select value={jamStyle || "any"} onValueChange={(v) => setJamStyle(v === "any" ? "" : v)}>
                      <SelectTrigger id="profile-jam-style" className="h-11 rounded-xl border-border/50 bg-background">
                        <SelectValue placeholder="None / No preference" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-default-engine" className="text-sm font-medium">
                      Default Engine
                    </Label>
                    <Select
                      value={defaultEngine || "any"}
                      onValueChange={(v) => setDefaultEngine(v === "any" ? "" : v)}
                    >
                      <SelectTrigger id="profile-default-engine" className="h-11 rounded-xl border-border/50 bg-background">
                        <SelectValue placeholder="Any / No Preference" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {ENGINE_OPTIONS_WITH_ANY.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="profile-default-language" className="text-sm font-medium">
                      Default Language
                    </Label>
                    <Select
                      value={defaultLanguage || "any"}
                      onValueChange={(v) => setDefaultLanguage(v === "any" ? "" : v)}
                    >
                      <SelectTrigger
                        id="profile-default-language"
                        className="h-11 rounded-xl border-border/50 bg-background"
                      >
                        <SelectValue placeholder="None / No default" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="any">None / No default</SelectItem>
                        {LANGUAGE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                    <Label
                      id="profile-programming-languages"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <AppIcon icon={ICON.programmingLanguage} size="sm" className="text-muted-foreground" />
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
                  </div>
                </div>
              </CardContent>
            </Card>
          </SettingsSectionPanel>
        </SettingsFormColumn>

        <aside className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-28 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Member card preview
            </p>
            <p className="text-sm text-muted-foreground">Updates live while you edit</p>
            <JammerCardPreview player={previewPlayer} />
          </div>
        </aside>
      </div>

      <SettingsSectionPanel
        id={SETTINGS_SECTION_IDS.notifications}
        title="Notifications"
        description="Get notified about squad applications and invites"
        tone="peach"
      >
        <Card className="border-border/50 bg-muted/30">
          <CardContent className="p-6 md:p-8">
            <PushNotificationManager />
          </CardContent>
        </Card>
      </SettingsSectionPanel>

      <SettingsSectionPanel
        id={SETTINGS_SECTION_IDS.account}
        title="Account"
        description="Irreversible actions. Proceed with caution."
        tone="destructive"
      >
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
                className="shrink-0 gap-2 rounded-xl font-medium"
              >
                <AppIcon icon={ICON.delete} size="sm" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </SettingsSectionPanel>

      {textDirty ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-card/95 px-4 py-3 shadow-lg backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">Unsaved text changes</p>
            <div className="flex shrink-0 items-center gap-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={handleDiscardText}>
                Discard
              </Button>
              <Button
                type="button"
                className="gap-2 rounded-xl"
                disabled={saving}
                onClick={() => void handleSaveProfile()}
              >
                {saving ? (
                  <>
                    <AppIcon icon={ICON.loading} size="sm" className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <AlertDialog
        open={showDeleteAccountDialog}
        onOpenChange={(open) => !deletingAccount && setShowDeleteAccountDialog(open)}
      >
        <AlertDialogContent className="rounded-2xl border-border/50">
          <AlertDialogHeader>
            <div className="flex items-center gap-4">
              <IconTile icon={ICON.danger} tone="destructive" />
              <div className="space-y-1">
                <AlertDialogTitle className="text-left">Delete your account?</AlertDialogTitle>
                <AlertDialogDescription className="text-left text-sm">
                  This action cannot be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              This will permanently delete your account, your profile, your availability posts, and remove you from any
              teams.
            </p>
          </div>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel disabled={deletingAccount} className="rounded-xl">
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="gap-2 rounded-xl"
            >
              {deletingAccount ? (
                <>
                  <AppIcon icon={ICON.loading} size="sm" className="animate-spin" />
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

function AutosaveIndicator({
  showAutosaved,
  showAutosaveSpinner,
}: {
  showAutosaved: boolean
  showAutosaveSpinner: boolean
}) {
  if (!showAutosaved && !showAutosaveSpinner) return null
  return (
    <div
      className="flex items-center justify-end gap-2 text-xs font-semibold text-muted-foreground"
      aria-live="polite"
    >
      {showAutosaveSpinner ? (
        <>
          <AppIcon icon={ICON.loading} size="sm" className="animate-spin text-teal" />
          Saving preferences…
        </>
      ) : (
        <>
          <AppIcon icon={ICON.confirm} size="sm" tone="teal" />
          Autosaved
        </>
      )}
    </div>
  )
}

function SettingsFormColumn({
  className,
  onSubmit,
  children,
}: {
  className?: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  children: ReactNode
}) {
  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
    </form>
  )
}
