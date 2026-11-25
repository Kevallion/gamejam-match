"use client"

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
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
import { saveProfileSettings, setDirectoryVisibility } from "@/app/actions/profile-settings-actions"
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
import { AppIcon, IconTile, type AppIconTone } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"
import { EmailPreferencesRows } from "@/components/settings/email-preferences"
import { readEmailPreferences } from "@/lib/email-preferences"
import { openCookieSettings } from "@/lib/consent"
import { useSignOut } from "@/hooks/use-sign-out"
import { useSectionScrollSpy } from "@/hooks/use-section-scroll-spy"

/** Anchors of the Settings sections: `/dashboard?tab=settings#settings-notifications`. */
export const SETTINGS_SECTION_IDS = {
  profile: "settings-profile",
  preferences: "settings-preferences",
  notifications: "settings-notifications",
  account: "settings-account",
} as const

type SectionIcon = (typeof ICON)[keyof typeof ICON]

const SECTIONS: { id: string; label: string; hint: string; icon: SectionIcon }[] = [
  { id: SETTINGS_SECTION_IDS.profile, label: "Profile", hint: "Public profile", icon: ICON.jammer },
  { id: SETTINGS_SECTION_IDS.preferences, label: "Preferences", hint: "Post defaults", icon: ICON.filters },
  { id: SETTINGS_SECTION_IDS.notifications, label: "Notifications", hint: "Push and email", icon: ICON.notifications },
  { id: SETTINGS_SECTION_IDS.account, label: "Account", hint: "Sessions, delete", icon: ICON.locked },
]
const SECTION_ID_LIST = SECTIONS.map((s) => s.id)
/** Legacy anchor kept working (`#privacy` scrolls to the sessions block). */
const LEGACY_ANCHORS = ["privacy"]

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
const CARD = "rounded-2xl border border-border bg-card text-card-foreground shadow-[3px_3px_0_0_var(--neo-shadow)]"
const FIELD = "h-10 w-full rounded-xl border-border bg-background"
const TRIGGER = "w-full rounded-xl border-border bg-background data-[size=default]:h-10"
const ROW = "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-border bg-background/40 p-3"

function scrollToSection(id: string, behavior: ScrollBehavior = "smooth") {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior, block: "start" })
}

function SectionLink({
  section,
  active,
  variant,
}: {
  section: (typeof SECTIONS)[number]
  active: boolean
  variant: "rail" | "bar"
}) {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    scrollToSection(section.id)
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${section.id}`)
  }
  if (variant === "bar") {
    return (
      <a
        href={`#${section.id}`}
        aria-current={active ? "location" : undefined}
        onClick={onClick}
        className={cn(
          "flex min-w-0 shrink-0 flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors",
          active ? "bg-teal text-teal-foreground shadow-[2px_2px_0_0_var(--neo-shadow)]" : "text-muted-foreground hover:text-foreground",
          FOCUS,
        )}
      >
        <AppIcon icon={section.icon} size="md" />
        <span className="leading-none tracking-tight">{section.label}</span>
      </a>
    )
  }
  return (
    <a
      href={`#${section.id}`}
      aria-current={active ? "location" : undefined}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-2 py-2 transition-colors",
        active
          ? "border-teal/40 bg-teal/15 text-foreground"
          : "border-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
        FOCUS,
      )}
    >
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", active ? "bg-teal text-teal-foreground" : "bg-secondary/80")}>
        <AppIcon icon={section.icon} size="sm" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold">{section.label}</span>
        <span className="block truncate text-xs text-muted-foreground">{section.hint}</span>
      </span>
    </a>
  )
}

/** Desktop (lg+): sticky rail with the section list and the save reminder. */
function SectionRail({ activeSection }: { activeSection: string }) {
  return (
    <nav aria-label="Settings sections" className={cn(CARD, "sticky top-24 flex flex-col gap-3 p-3")}>
      <p className="px-2 pt-1 text-sm text-muted-foreground">Manage your profile and preferences</p>
      <ul className="flex flex-col gap-1">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <SectionLink section={s} active={activeSection === s.id} variant="rail" />
          </li>
        ))}
      </ul>
      <p className="flex items-start gap-2 border-t border-border/60 px-2 pt-3 pb-0.5 text-xs text-muted-foreground">
        <AppIcon icon={ICON.info} size="sm" tone="muted" className="mt-px" />
        Profile and preferences apply when you save. Other settings save on their own.
      </p>
    </nav>
  )
}

/** Mobile / tablet: sticky scrollable section bar under the header. */
function SectionBar({ activeSection }: { activeSection: string }) {
  return (
    <nav
      aria-label="Settings sections"
      className={cn(CARD, "sticky top-[60px] z-20 flex gap-1 overflow-x-auto bg-card p-1 lg:hidden")}
    >
      {SECTIONS.map((s) => (
        <SectionLink key={s.id} section={s} active={activeSection === s.id} variant="bar" />
      ))}
    </nav>
  )
}

function SectionCard({
  id,
  icon,
  tone,
  title,
  description,
  danger,
  className,
  children,
}: {
  id?: string
  icon: SectionIcon
  tone: AppIconTone
  title: string
  description: string
  danger?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
      className={cn(
        CARD,
        "flex min-w-0 scroll-mt-32 flex-col gap-4 p-4 md:p-5 lg:scroll-mt-24",
        danger && "border-destructive/40",
        className,
      )}
    >
      <header className="flex items-start gap-3">
        <IconTile icon={icon} tone={tone} />
        <div className="min-w-0 flex-1">
          <h2 id={id ? `${id}-title` : undefined} className={cn("font-display text-xl font-extrabold tracking-tight", danger ? "text-destructive" : "text-foreground")}>
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </header>
      {children}
    </section>
  )
}

function SubLabel({ id, icon, children, aside }: { id?: string; icon?: SectionIcon; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h3 id={id} className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
        {icon ? <AppIcon icon={icon} size="sm" tone="muted" /> : null}
        {children}
      </h3>
      {aside}
    </div>
  )
}

function Field({ id, label, icon, hint, children }: { id: string; label: string; icon?: SectionIcon; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold">
        {icon ? <AppIcon icon={icon} size="sm" tone="muted" /> : null}
        {label}
      </Label>
      {children}
      {hint}
    </div>
  )
}

function Hint({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="text-xs text-muted-foreground">
      {children}
    </p>
  )
}

function RoleSelect({ id, value, onChange, noneLabel, invalid }: { id: string; value: string; onChange: (v: string) => void; noneLabel: string; invalid?: boolean }) {
  return (
    <Select value={value || "any"} onValueChange={(v) => onChange(v === "any" ? "" : v)}>
      <SelectTrigger id={id} className={cn(TRIGGER, invalid && "border-destructive/60 focus-visible:ring-destructive/20")}>
        <SelectValue placeholder={noneLabel} />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <SelectItem value="any">{noneLabel}</SelectItem>
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
  )
}

function ExperienceSelect({ id, value, onChange, disabled }: { id: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger id={id} className={TRIGGER}>
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
  )
}

/** One role slot (Primary / Secondary): equal panels side by side from sm. */
function RoleSlot({ title, role, children }: { title: string; role: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-background/40 p-3">
      <div className="flex min-h-6 items-center justify-between gap-2">
        <span className="text-sm font-extrabold text-foreground">{title}</span>
        {role ? <TagIcon kind="role" value={role} size="xs" withTooltip={false} /> : <span className="text-xs text-muted-foreground">Not set</span>}
      </div>
      {children}
    </div>
  )
}

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
  /** S3 email preferences (true = subscribed). */
  email_team_activity?: boolean | null
  email_matching_announcements?: boolean | null
  /** false when the S3 columns are missing in the database: switches are disabled. */
  email_preferences_available?: boolean
  /** DIR-2: false hides the profile from the member directory. Defaults to true. */
  directory_visible?: boolean | null
}

type ProfileSettingsProps = {
  profile: ProfileSettingsProfile | null
  onProfileUpdated?: (patch?: { discord_username?: string | null }) => void
  /** Fallback when profile.username is empty (e.g. OAuth name before profile is saved) */
  displayNameFallback?: string | null
}

function directoryVisibilityError(
  result: Extract<Awaited<ReturnType<typeof setDirectoryVisibility>>, { success: false }>,
): string {
  if (result.code === "UNAUTHORIZED") return "You must be signed in to change this."
  if (result.code === "INVALID_INPUT") return "That visibility setting is not valid."
  return result.error?.trim() || "Could not update directory visibility. Please try again."
}

function DirectoryVisibilityRow({ initialVisible }: { initialVisible: boolean }) {
  const [visible, setVisible] = useState(initialVisible)
  const [pending, setPending] = useState(false)
  const requestId = useRef(0)
  const switchId = useId()
  const descId = `${switchId}-desc`

  const update = async (next: boolean) => {
    const previous = visible
    setVisible(next)
    setPending(true)
    const id = ++requestId.current
    try {
      const result = await setDirectoryVisibility(next)
      if (id !== requestId.current) return
      if (result.success) {
        setVisible(result.visible)
        return
      }
      setVisible(previous)
      toast.error("Could not update directory visibility.", {
        description: directoryVisibilityError(result),
      })
    } catch (err) {
      if (id !== requestId.current) return
      setVisible(previous)
      toast.error("Could not update directory visibility.", {
        description: err instanceof Error ? err.message : "Could not update directory visibility. Please try again.",
      })
    } finally {
      if (id === requestId.current) setPending(false)
    }
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-3">
      <div className="min-w-0 flex-1 basis-48">
        <label htmlFor={switchId} className="text-sm font-bold text-foreground">
          Show me in the member directory
        </label>
        <p id={descId} className="text-xs text-muted-foreground">
          Other signed-in members can see your username, avatar, title, roles, engine, languages, and bio in the member directory.
        </p>
      </div>
      <Switch
        id={switchId}
        checked={visible}
        disabled={pending}
        aria-describedby={descId}
        aria-busy={pending}
        onCheckedChange={(value) => void update(value)}
        className="shrink-0"
      />
    </li>
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
  const [showSignOutAllDialog, setShowSignOutAllDialog] = useState(false)
  const { signOut, pending: signOutPending } = useSignOut()

  const handleSaveProfile = async (e: FormEvent) => {
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

  const activeSection = useSectionScrollSpy(SECTION_ID_LIST, 132)

  // Deep links (`?tab=settings#settings-notifications`): scroll once the tab content is laid out.
  useEffect(() => {
    const target = window.location.hash.replace(/^#/, "")
    if (!target || (!SECTION_ID_LIST.includes(target) && !LEGACY_ANCHORS.includes(target))) return
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => scrollToSection(target, "auto"))
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="grid w-full min-w-0 max-w-full gap-3 py-2 md:gap-4 md:py-4 lg:grid-cols-12 lg:gap-[18px]">
      <div className="lg:col-span-12">
        <Link
          href="/dashboard?hub=me"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-1 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <AppIcon icon={ICON.navLeft} size="sm" />
          Me
        </Link>
      </div>
      <div className="hidden lg:col-span-3 lg:block">
        <SectionRail activeSection={activeSection} />
      </div>
      <SectionBar activeSection={activeSection} />

      <div className="grid min-w-0 gap-3 md:gap-4 lg:col-span-9 lg:gap-[18px]">
        <form onSubmit={handleSaveProfile} className="grid min-w-0 gap-3 md:gap-4 lg:gap-[18px]" aria-label="Profile and preferences">
          <div className="grid min-w-0 gap-3 md:gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] lg:gap-[18px]">
            <SectionCard
              id={SETTINGS_SECTION_IDS.profile}
              icon={ICON.jammer}
              tone="teal"
              title="Public profile"
              description="This is how others will see you on the platform."
            >
              <Field
                id="profile-username"
                label="Username"
                hint={
                  <>
                    <Hint id="profile-username-hint">Your unique display name across the platform</Hint>
                    {showUsernameError && usernameErrorMessage ? (
                      <p className="text-xs font-medium text-destructive">{usernameErrorMessage}</p>
                    ) : null}
                  </>
                }
              >
                <Input
                  id="profile-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => setUsernameTouched(true)}
                  placeholder="e.g. PixelWizard42"
                  autoComplete="username"
                  aria-invalid={showUsernameError}
                  aria-describedby="profile-username-hint"
                  className={cn(FIELD, showUsernameError && "border-destructive/60 focus-visible:ring-destructive/20")}
                />
              </Field>
              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <Field
                  id="profile-discord"
                  label="Discord Username"
                  icon={ICON.chat}
                  hint={<Hint>Visible to teammates for group chat invites</Hint>}
                >
                  <Input
                    id="profile-discord"
                    value={discordUsername}
                    onChange={(e) => setDiscordUsername(e.target.value)}
                    placeholder="e.g. gamer123"
                    className={FIELD}
                  />
                </Field>
                <Field
                  id="profile-portfolio-url"
                  label="Portfolio URL"
                  icon={ICON.link}
                  hint={<Hint>Showcase your work to potential teammates</Hint>}
                >
                  <Input
                    id="profile-portfolio-url"
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourname.itch.io or https://yourportfolio.com"
                    className={FIELD}
                  />
                </Field>
              </div>
            </SectionCard>

            <aside
              aria-label="Your profile card"
              className={cn(CARD, "flex min-w-0 flex-col gap-4 border border-border bg-card p-4 shadow-[3px_3px_0_0_var(--neo-shadow)]")}
            >
              <h2 className="font-display text-xl font-extrabold text-foreground">Your profile card</h2>
              <ProfileCard
                avatarUrl={profile?.avatar_url ?? null}
                displayName={displayName}
                fallbackName={displayNameFallback ?? undefined}
                currentTitle={profile?.current_title?.trim() ? profile.current_title.trim() : "Rookie Jammer"}
                level={levelFromTotalXp(typeof profile?.xp === "number" ? profile.xp : 0)}
                programmingLanguages={programmingLanguages}
                maxVisibleProgrammingLanguages={3}
                size="lg"
                subtitle="Your avatar is synced from your login provider"
              />
            </aside>
          </div>

          <SectionCard
            id={SETTINGS_SECTION_IDS.preferences}
            icon={ICON.filters}
            tone="lavender"
            title="Default preferences"
            description="Pre-fill your availability posts automatically."
          >
            <div className="space-y-2">
              <SubLabel>Roles</SubLabel>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                <RoleSlot title="Primary" role={primaryRole}>
                  <Field id="profile-primary-role" label="Primary Role" hint={<Hint>Main role used as your default role</Hint>}>
                    <RoleSelect id="profile-primary-role" value={primaryRole} onChange={setPrimaryRole} noneLabel="None / No default" />
                  </Field>
                  <Field id="profile-primary-experience" label="Primary Role Experience" hint={<Hint>Your experience for this role</Hint>}>
                    <ExperienceSelect id="profile-primary-experience" value={primaryExperience} onChange={setPrimaryExperience} />
                  </Field>
                </RoleSlot>
                <RoleSlot title="Secondary (optional)" role={secondaryRole}>
                  <Field
                    id="profile-secondary-role"
                    label="Secondary Role"
                    hint={
                      <>
                        <Hint>Add a second role you can also contribute with</Hint>
                        {duplicateRoleSelected ? (
                          <p className="text-xs font-medium text-destructive">Secondary role must be different from primary role.</p>
                        ) : null}
                      </>
                    }
                  >
                    <RoleSelect
                      id="profile-secondary-role"
                      value={secondaryRole}
                      onChange={setSecondaryRole}
                      noneLabel="None / No secondary role"
                      invalid={duplicateRoleSelected}
                    />
                  </Field>
                  <Field id="profile-secondary-experience" label="Secondary Role Experience" hint={<Hint>Only used when a secondary role is set</Hint>}>
                    <ExperienceSelect
                      id="profile-secondary-experience"
                      value={secondaryExperience}
                      onChange={setSecondaryExperience}
                      disabled={!secondaryRole.trim()}
                    />
                  </Field>
                </RoleSlot>
              </div>
            </div>

            <div className="space-y-2">
              <SubLabel>Jam defaults</SubLabel>
              <div className="grid min-w-0 gap-3 sm:grid-cols-3">
                <Field id="profile-jam-style" label="Jam Style" hint={<Hint>The vibe you prefer during game jams</Hint>}>
                  <Select value={jamStyle || "any"} onValueChange={(v) => setJamStyle(v === "any" ? "" : v)}>
                    <SelectTrigger id="profile-jam-style" className={TRIGGER}>
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
                </Field>
                <Field id="profile-default-engine" label="Default Engine" icon={ICON.engine} hint={<Hint>Preferred game engine</Hint>}>
                  <Select value={defaultEngine || "any"} onValueChange={(v) => setDefaultEngine(v === "any" ? "" : v)}>
                    <SelectTrigger id="profile-default-engine" className={TRIGGER}>
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
                </Field>
                <Field id="profile-default-language" label="Default Language" icon={ICON.language} hint={<Hint>Communication language</Hint>}>
                  <Select value={defaultLanguage || "any"} onValueChange={(v) => setDefaultLanguage(v === "any" ? "" : v)}>
                    <SelectTrigger id="profile-default-language" className={TRIGGER}>
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
                </Field>
              </div>
            </div>

            <div className="space-y-2">
              <SubLabel
                id="profile-programming-languages"
                icon={ICON.programmingLanguage}
                aside={<span className="text-xs font-semibold tabular-nums text-muted-foreground">{programmingLanguages.length} selected</span>}
              >
                Programming languages
              </SubLabel>
              <div role="group" aria-labelledby="profile-programming-languages" className="flex min-w-0 flex-wrap gap-2">
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
                        "inline-flex min-h-9 max-w-full items-center gap-2 rounded-lg border px-3 text-xs font-bold transition-colors",
                        selected
                          ? "border-lavender/60 bg-lavender/20 text-foreground shadow-[2px_2px_0_0_var(--neo-shadow)]"
                          : "border-border bg-background/50 text-muted-foreground hover:text-foreground",
                        FOCUS,
                      )}
                    >
                      <span aria-hidden className="grid min-w-5 place-items-center rounded bg-secondary/80 px-1 text-xs font-bold">
                        {option.short}
                      </span>
                      {option.label}
                      {selected ? <AppIcon icon={ICON.confirm} size="xs" tone="lavender" /> : null}
                    </button>
                  )
                })}
              </div>
              <Hint>Languages you write in. Shown on your profile and member cards.</Hint>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 border-t border-border/60 pt-4">
              <p className="text-xs text-muted-foreground">Saves your public profile and default preferences.</p>
              <Button type="submit" disabled={saving} className="gap-2 rounded-xl font-semibold">
                {saving ? (
                  <>
                    <AppIcon icon={ICON.loading} size="sm" className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <AppIcon icon={ICON.confirm} size="sm" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </SectionCard>
        </form>

        <SectionCard
          id={SETTINGS_SECTION_IDS.notifications}
          icon={ICON.notifications}
          tone="peach"
          title="Notifications"
          description="Get notified about squad applications and invites"
        >
          <div className={ROW}>
            <div className="min-w-0 flex-1 basis-48">
              <p className="text-sm font-bold text-foreground">Push notifications</p>
              <p className="text-xs text-muted-foreground">Alerts on this device for applications, invites and replies.</p>
            </div>
            <div className="shrink-0">
              <PushNotificationManager />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background/40 p-3">
            <EmailPreferencesRows
              key={`${profile?.email_preferences_available === true}-${profile?.email_team_activity !== false}-${profile?.email_matching_announcements !== false}`}
              initial={readEmailPreferences(profile)}
              available={profile?.email_preferences_available === true}
            />
          </div>
        </SectionCard>

        <SectionCard
          id={SETTINGS_SECTION_IDS.account}
          icon={ICON.locked}
          tone="primary"
          title="Account"
          description="Cookies, sessions and account deletion"
        >
          <div id="privacy" className="scroll-mt-32 space-y-2 lg:scroll-mt-24">
            <SubLabel>Privacy and sessions</SubLabel>
            <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-background/40">
              {profile ? (
                <DirectoryVisibilityRow
                  key={`${profile.id}-${profile.directory_visible === false ? "hidden" : "visible"}`}
                  initialVisible={profile.directory_visible !== false}
                />
              ) : (
                <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-3">
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="text-sm font-bold text-foreground">Show me in the member directory</p>
                    <p className="text-xs text-muted-foreground">This setting could not be loaded. Refresh the page to try again.</p>
                  </div>
                  <Switch checked disabled aria-label="Show me in the member directory" className="shrink-0" />
                </li>
              )}
              <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-3">
                <div className="min-w-0 flex-1 basis-48">
                  <p className="text-sm font-bold text-foreground">Cookie settings</p>
                  <p className="text-xs text-muted-foreground">Allow or refuse optional analytics on this browser.</p>
                </div>
                <Button type="button" variant="outline" size="sm" className="shrink-0 gap-2 rounded-xl" aria-haspopup="dialog" onClick={openCookieSettings}>
                  <AppIcon icon={ICON.cookies} size="sm" />
                  Cookie settings
                </Button>
              </li>
              <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-3">
                <div className="min-w-0 flex-1 basis-48">
                  <p className="text-sm font-bold text-foreground">Log out of all devices</p>
                  <p className="text-xs text-muted-foreground">Ends every session of your account, including this one.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-2 rounded-xl"
                  disabled={signOutPending !== null}
                  onClick={() => setShowSignOutAllDialog(true)}
                >
                  <AppIcon icon={ICON.signOutAll} size="sm" />
                  Log out of all devices
                </Button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <SubLabel>Danger zone</SubLabel>
            <div className={cn(ROW, "border-destructive/30 bg-destructive/5")}>
              <div className="min-w-0 flex-1 basis-56">
                <p className="text-sm font-bold text-foreground">Delete Account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data. This cannot be undone.</p>
              </div>
              <Button type="button" variant="destructive" size="sm" onClick={() => setShowDeleteAccountDialog(true)} className="shrink-0 gap-2 rounded-xl">
                <AppIcon icon={ICON.delete} size="sm" />
                Delete Account
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>

      <AlertDialog open={showSignOutAllDialog} onOpenChange={(open) => signOutPending === null && setShowSignOutAllDialog(open)}>
        <AlertDialogContent className="rounded-2xl border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of all devices?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out everywhere: this browser, your phone and any other device. You can sign in again anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel disabled={signOutPending !== null} className="rounded-xl">
              Cancel
            </AlertDialogCancel>
            <Button type="button" onClick={() => void signOut("global")} disabled={signOutPending !== null} className="gap-2 rounded-xl">
              {signOutPending === "global" ? (
                <>
                  <AppIcon icon={ICON.loading} className="animate-spin" />
                  Logging out…
                </>
              ) : (
                <>
                  <AppIcon icon={ICON.signOutAll} />
                  Log out everywhere
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteAccountDialog} onOpenChange={(open) => !deletingAccount && setShowDeleteAccountDialog(open)}>
        <AlertDialogContent className="rounded-2xl border-border">
          <AlertDialogHeader>
            <div className="flex items-center gap-4">
              <IconTile icon={ICON.danger} tone="destructive" />
              <div className="space-y-1">
                <AlertDialogTitle className="text-left">Delete your account?</AlertDialogTitle>
                <AlertDialogDescription className="text-left text-sm">This action cannot be undone.</AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              This will permanently delete your account, your profile, your availability posts, and remove you from any teams.
            </p>
          </div>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel disabled={deletingAccount} className="rounded-xl">
              Cancel
            </AlertDialogCancel>
            <Button type="button" variant="destructive" onClick={handleDeleteAccount} disabled={deletingAccount} className="gap-2 rounded-xl">
              {deletingAccount ? (
                <>
                  <AppIcon icon={ICON.loading} size="sm" className="animate-spin" />
                  Deleting…
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
