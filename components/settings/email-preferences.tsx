"use client"

import { useId, useRef, useState } from "react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { AppIcon } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { updateEmailPreferences } from "@/app/actions/email-preferences-actions"
import { EMAIL_PREFERENCES_UNAVAILABLE, type EmailPreferences } from "@/lib/email-preferences"

type SaveStatus = "idle" | "saving" | "saved" | "error"

type EmailPreferencesRowsProps = {
  initial: EmailPreferences
  /** false while the S3 columns are not in the database yet. */
  available: boolean
}

const ROWS: { key: keyof EmailPreferences; label: string; description: string }[] = [
  {
    key: "teamActivity",
    label: "Team activity emails",
    description: "Applications, invites, replies, squad chat and team updates.",
  },
  {
    key: "matchingAnnouncements",
    label: "Matching & announcements emails",
    description: "New squads that need your skills, reminders and jam announcements.",
  },
]

const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "Not saved",
}

/** Two compact switch rows, saved on change (optimistic, rolled back on error). */
export function EmailPreferencesRows({ initial, available: availableProp }: EmailPreferencesRowsProps) {
  const [prefs, setPrefs] = useState<EmailPreferences>(initial)
  const [available, setAvailable] = useState(availableProp)
  const [status, setStatus] = useState<SaveStatus>("idle")
  const requestId = useRef(0)
  const baseId = useId()

  const update = async (key: keyof EmailPreferences, value: boolean) => {
    const previous = prefs
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    setStatus("saving")
    const id = ++requestId.current
    try {
      const result = await updateEmailPreferences(
        key === "teamActivity" ? { emailTeamActivity: value } : { emailMatchingAnnouncements: value },
      )
      if (id !== requestId.current) return
      if (result.success) {
        setPrefs({
          teamActivity: result.prefs.emailTeamActivity,
          matchingAnnouncements: result.prefs.emailMatchingAnnouncements,
        })
        setStatus("saved")
        return
      }
      setPrefs(previous)
      if (result.error === EMAIL_PREFERENCES_UNAVAILABLE) {
        setAvailable(false)
        setStatus("idle")
        return
      }
      setStatus("error")
      toast.error("Could not update email preferences.", { description: result.error })
    } catch (err) {
      if (id !== requestId.current) return
      setPrefs(previous)
      setStatus("error")
      toast.error("Could not update email preferences.", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    }
  }

  return (
    <div className="space-y-2" aria-busy={status === "saving"}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <AppIcon icon={ICON.email} size="sm" tone="teal" />
          Email
        </h3>
        <span
          role="status"
          aria-live="polite"
          className={cn(
            "text-xs font-medium",
            status === "error" ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {STATUS_TEXT[status]}
        </span>
      </div>

      <ul className="divide-y divide-border/40 overflow-hidden rounded-xl border border-border/50 bg-card/60">
        {ROWS.map((row) => {
          const switchId = `${baseId}-${row.key}`
          const descId = `${switchId}-desc`
          return (
            <li key={row.key} className="flex items-center justify-between gap-4 px-3 py-2.5">
              <div className="min-w-0">
                <label
                  htmlFor={switchId}
                  className={cn("text-sm font-medium text-foreground", !available && "text-muted-foreground")}
                >
                  {row.label}
                </label>
                <p id={descId} className="text-xs text-muted-foreground">
                  {row.description}
                </p>
              </div>
              <Switch
                id={switchId}
                checked={prefs[row.key]}
                disabled={!available}
                aria-describedby={descId}
                onCheckedChange={(value) => void update(row.key, value)}
              />
            </li>
          )
        })}
      </ul>

      {available ? (
        <p className="text-xs text-muted-foreground">
          Sign-in links and account deletion emails are always sent.
        </p>
      ) : (
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <AppIcon icon={ICON.info} size="xs" />
          Email preferences are not available yet. You stay subscribed for now.
        </p>
      )}
    </div>
  )
}