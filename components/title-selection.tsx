"use client"

import { useEffect, useState, useTransition } from "react"
import { Check, Lock, Sparkles, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  const [modalOpen, setModalOpen] = useState(false)

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

  const handleEquipFromModal = (title: string) => {
    handleEquip(title)
    setModalOpen(false)
  }

  const selectValue = isTitleUnlocked(unlockedTitles, equipped)
    ? equipped
    : unlockedTitles[0] ?? "Rookie Jammer"

  const unlockedCount = TITLE_CATALOG.filter((e) =>
    isTitleUnlocked(unlockedTitles, e.title),
  ).length
  const totalCount = TITLE_CATALOG.length

  return (
    <Card
      className={cn(
        "border border-border/50 bg-white/[0.05] shadow-sm backdrop-blur-xl dark:border-border/60 dark:bg-slate-900/45 light:bg-white/75",
        className,
      )}
    >
      <CardContent className="space-y-3 p-4">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15 ring-1 ring-amber-500/25">
              <Sparkles className="size-3.5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                Title selection
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {unlockedCount} / {totalCount} titles unlocked
              </p>
            </div>
          </div>

          {/* "Browse all" modal trigger */}
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 rounded-lg px-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Browse all
                <ChevronRight className="size-3" />
              </Button>
            </DialogTrigger>

            <DialogContent className="flex max-h-[80vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
              <DialogHeader className="shrink-0 border-b border-border/50 px-5 pb-4 pt-5 pr-14">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/25">
                    <Sparkles className="size-4 text-amber-500" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-semibold">
                      All Titles
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground">
                      {unlockedCount} unlocked · click to equip
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {TITLE_CATALOG.map((entry) => {
                    const unlocked = isTitleUnlocked(unlockedTitles, entry.title)
                    const active = equipped === entry.title

                    const tile = (
                      <button
                        type="button"
                        disabled={disabled || pending || !unlocked}
                        onClick={() => unlocked && handleEquipFromModal(entry.title)}
                        className={cn(
                          "flex w-full flex-col gap-1 rounded-xl border px-3 py-2.5 text-left transition-all",
                          unlocked
                            ? cn(
                                "border-border/40 bg-background/60 backdrop-blur-sm hover:border-amber-500/40 hover:bg-amber-500/[0.06] dark:bg-background/30",
                                active &&
                                  "border-amber-500/50 bg-amber-500/10 ring-1 ring-amber-500/30 shadow-sm",
                              )
                            : "cursor-not-allowed border-dashed border-border/35 bg-muted/10 opacity-55",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "truncate text-sm font-semibold",
                              unlocked ? "text-foreground" : "text-muted-foreground",
                            )}
                          >
                            {entry.title}
                          </span>
                          {unlocked ? (
                            active ? (
                              <Check
                                className="size-3.5 shrink-0 text-amber-500"
                                aria-label="Equipped"
                              />
                            ) : null
                          ) : (
                            <Lock
                              className="size-3.5 shrink-0 text-muted-foreground/60"
                              aria-hidden
                            />
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
                        <TooltipContent side="top" className="max-w-[220px] text-balance">
                          <p className="font-semibold">{entry.title}</p>
                          <p className="mt-0.5 text-background/85">{entry.unlockHint}</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick equip select */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-semibold uppercase tracking-tight text-muted-foreground">
            Quick equip
          </Label>
          <Select
            value={selectValue}
            onValueChange={(v) => void handleEquip(v)}
            disabled={disabled || pending}
          >
            <SelectTrigger className="h-9 rounded-xl border-border/50 bg-background/80 text-sm backdrop-blur-sm dark:bg-background/60">
              <SelectValue placeholder="Choose a title" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {unlockedTitles.map((t) => (
                <SelectItem key={t} value={t} className="text-sm">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
