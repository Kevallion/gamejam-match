"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { AppIcon } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"
import {
  TITLE_CATALOG,
  isTitleUnlocked,
} from "@/lib/gamification-titles-catalog"
import { updateCurrentTitle } from "@/app/actions/gamification-actions"
import { toast } from "sonner"

export type TitleSelectionProps = {
  unlockedTitles: string[]
  currentTitle: string
  onUpdated?: () => void
  disabled?: boolean
  className?: string
}

export function TitleSelection({
  unlockedTitles,
  currentTitle,
  onUpdated,
  disabled = false,
  className,
}: TitleSelectionProps) {
  const [equipped, setEquipped] = useState(currentTitle)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setEquipped(currentTitle)
  }, [currentTitle])

  const handleEquip = (title: string) => {
    if (disabled || pending || title === equipped) return
    if (!isTitleUnlocked(unlockedTitles, title)) return

    startTransition(async () => {
      const res = await updateCurrentTitle(title)
      if (!res.ok) {
        toast.error("Could not update title", { description: res.error })
        return
      }
      setEquipped(title)
      toast.success("Title equipped", { description: title })
      onUpdated?.()
    })
  }

  const owned = TITLE_CATALOG.filter((entry) => isTitleUnlocked(unlockedTitles, entry.title))
  const locked = TITLE_CATALOG.filter((entry) => !isTitleUnlocked(unlockedTitles, entry.title))

  return (
    <div className={cn("flex min-w-0 flex-col gap-6", className)}>
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">
          Owned titles · {owned.length}
        </h3>
        <ul className="space-y-2">
          {owned.map((entry) => {
            const active = equipped === entry.title
            return (
              <li
                key={entry.title}
                className={cn(
                  "flex min-w-0 items-center gap-3 rounded-2xl border px-3 py-3",
                  active
                    ? "border-teal/40 bg-teal/10"
                    : "border-border/50 bg-card/60",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    active ? "bg-teal/20 text-teal" : "bg-muted/60 text-muted-foreground",
                  )}
                >
                  <AppIcon icon={ICON.title} size="sm" tone={active ? "teal" : "muted"} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-balance text-foreground">{entry.title}</p>
                  {active ? (
                    <p className="text-xs font-medium text-teal">Equipped</p>
                  ) : (
                    <p className="text-xs text-muted-foreground text-balance">{entry.unlockHint}</p>
                  )}
                </div>
                {active ? (
                  <span className="shrink-0 rounded-lg bg-teal px-2.5 py-1.5 text-xs font-bold text-teal-foreground">
                    Equipped
                  </span>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 shrink-0 rounded-lg bg-teal px-3 text-sm font-semibold text-teal-foreground hover:bg-teal/90"
                    disabled={disabled || pending}
                    onClick={() => handleEquip(entry.title)}
                  >
                    Equip
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      {locked.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">
            Titles to unlock · {locked.length}
          </h3>
          <ul className="space-y-2">
            {locked.map((entry) => (
              <li
                key={entry.title}
                className="flex min-w-0 items-center gap-3 rounded-2xl border border-dashed border-border/40 bg-muted/10 px-3 py-3 opacity-80"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
                  <AppIcon icon={ICON.locked} size="sm" tone="muted" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-balance text-muted-foreground">
                    {entry.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{entry.unlockHint}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
