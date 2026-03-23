"use client"

import * as React from "react"
import Image from "next/image"
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { externalImageNeedsUnoptimized } from "@/lib/external-image"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { ExternalJam } from "@/app/actions/jam-actions"
import { getExternalJams, syncItchJams } from "@/app/actions/jam-actions"

type JamSearchSelectorProps = {
  value: string | null
  onValueChange: (jamId: string | null) => void
  placeholder?: string
  className?: string
  /** Si true, appelle syncItchJams à l’ouverture du popover pour rafraîchir la liste */
  syncOnOpen?: boolean
  /** Afficher uniquement les jams dont ends_at est dans le futur ou null */
  activeOnly?: boolean
}

export function JamSearchSelector({
  value,
  onValueChange,
  placeholder = "Choose a Jam…",
  className,
  syncOnOpen = true,
  activeOnly = true,
}: JamSearchSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [jams, setJams] = React.useState<ExternalJam[]>([])
  const [loading, setLoading] = React.useState(false)
  const [syncing, setSyncing] = React.useState(false)

  const selectedJam = value ? jams.find((j) => j.id === value) : null

  const loadJams = React.useCallback(async () => {
    setLoading(true)
    const { data, error } = await getExternalJams({ activeOnly })
    if (!error) setJams(data)
    setLoading(false)
  }, [activeOnly])

  React.useEffect(() => {
    if (open) {
      if (syncOnOpen) {
        setSyncing(true)
        syncItchJams()
          .then(() => loadJams())
          .catch(() => loadJams())
          .finally(() => setSyncing(false))
      } else {
        loadJams()
      }
    }
  }, [open, syncOnOpen, loadJams])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal h-12 rounded-xl border-border/60 bg-secondary/50",
            !selectedJam && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {selectedJam ? (
              <span className="flex items-center gap-2">
                {selectedJam.thumbnail_url && (
                  <Image
                    src={selectedJam.thumbnail_url}
                    alt=""
                    width={24}
                    height={24}
                    className="size-6 shrink-0 rounded object-cover"
                    unoptimized={externalImageNeedsUnoptimized(selectedJam.thumbnail_url)}
                    sizes="24px"
                  />
                )}
                {selectedJam.title || "Untitled"}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {value && (
              <span
                role="button"
                tabIndex={0}
                className="rounded p-0.5 hover:bg-muted inline-flex items-center justify-center"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onValueChange(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    e.stopPropagation()
                    onValueChange(null)
                  }
                }}
                aria-label="Clear selection"
              >
                <X className="size-4" />
              </span>
            )}
            <ChevronsUpDown className="size-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl" align="start">
        <Command shouldFilter={true}>
          <CommandInput placeholder="Search for a jam…" />
          <CommandList>
            {(loading || syncing) && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                {syncing ? "Syncing itch.io…" : "Loading…"}
              </div>
            )}
            <CommandEmpty>No jam found.</CommandEmpty>
            {!loading && !syncing && jams.length > 0 && (
              <CommandGroup>
                <CommandItem
                  value="__none__"
                  onSelect={() => {
                    onValueChange(null)
                    setOpen(false)
                  }}
                >
                  <span className="text-muted-foreground">No jam</span>
                </CommandItem>
                {jams.map((jam) => (
                  <CommandItem
                    key={jam.id}
                    value={[jam.title ?? "", jam.itch_id.toString()].join(" ")}
                    onSelect={() => {
                      onValueChange(jam.id)
                      setOpen(false)
                    }}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {jam.thumbnail_url && (
                        <Image
                          src={jam.thumbnail_url}
                          alt=""
                          width={32}
                          height={32}
                          className="size-8 shrink-0 rounded object-cover"
                          unoptimized={externalImageNeedsUnoptimized(jam.thumbnail_url)}
                          sizes="32px"
                        />
                      )}
                      <span className="truncate">{jam.title || "Untitled"}</span>
                    </span>
                    <Check
                      className={cn(
                        "ml-auto size-4 shrink-0",
                        value === jam.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
