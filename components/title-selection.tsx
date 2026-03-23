"use client"

import { useEffect, useState, useTransition } from "react"
import { Check, Lock, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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

  const selectValue = isTitleUnlocked(unlockedTitles, equipped) ? equipped : unlockedTitles[0] ?? "Rookie Jammer"

  return (
    <Card
      className={cn(
        "border border-border/50 bg-white/[0.05] shadow-sm backdrop-blur-xl dark:border-border/60 dark:bg-slate-900/45 light:bg-white/75",
        className,
      )}
    >
      <CardHeader className="border-b border-border/40 pb-4 dark:border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/25">
            <Sparkles className="size-4 text-amber-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">Title selection</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Equip a title you&apos;ve unlocked. Locked titles show how to earn them.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">
            Quick equip
          </Label>
          <Select
            value={selectValue}
            onValueChange={(v) => void handleEquip(v)}
            disabled={disabled || pending}
          >
            <SelectTrigger className="h-11 rounded-xl border-border/50 bg-background/80 backdrop-blur-sm dark:bg-background/60">
              <SelectValue placeholder="Choose a title" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {unlockedTitles.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">
            All titles
          </Label>
          <div
            className={cn(
              "rounded-2xl border border-border/50 bg-slate-950/[0.35] p-3 shadow-inner backdrop-blur-md",
              "dark:border-white/10 dark:bg-white/[0.04]",
              "light:border-border/60 light:bg-muted/25",
            )}
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {TITLE_CATALOG.map((entry) => {
              const unlocked = isTitleUnlocked(unlockedTitles, entry.title)
              const active = equipped === entry.title

              const tile = (
                <button
                  type="button"
                  disabled={disabled || pending || !unlocked}
                  onClick={() => unlocked && void handleEquip(entry.title)}
                  className={cn(
                    "flex w-full flex-col gap-1 rounded-xl border px-3 py-3 text-left transition-all",
                    unlocked
                      ? cn(
                          "border-border/45 bg-white/[0.04] backdrop-blur-sm hover:border-amber-500/35 hover:bg-amber-500/[0.07] dark:bg-white/[0.03]",
                          active && "border-amber-500/45 bg-amber-500/12 ring-1 ring-amber-500/30 shadow-sm",
                        )
                      : "cursor-not-allowed border-dashed border-border/40 bg-muted/15 opacity-60 dark:bg-muted/10",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "truncate text-sm font-semibold tracking-tight",
                        unlocked ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {entry.title}
                    </span>
                    {unlocked ? (
                      active ? (
                        <Check className="size-4 shrink-0 text-amber-500" aria-hidden />
                      ) : null
                    ) : (
                      <Lock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    )}
                  </div>
                  <p className="text-[11px] leading-snug text-muted-foreground">
                    {unlocked ? "Click to equip" : entry.unlockHint}
                  </p>
                </button>
              )

              if (unlocked) {
                return <div key={entry.title}>{tile}</div>
              }

              return (
                <Tooltip key={entry.title}>
                  <TooltipTrigger asChild>
                    <div>{tile}</div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px] text-balance">
                    <p className="font-semibold">{entry.title}</p>
                    <p className="mt-1 text-background/90">{entry.unlockHint}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
