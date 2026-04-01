"use client"

import * as React from "react"
import Image from "next/image"
import { Check, Link2, Loader2, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { externalImageNeedsUnoptimized } from "@/lib/external-image"
import { Badge } from "@/components/ui/badge"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { ExternalJam } from "@/app/actions/jam-actions"
import { getExternalJams, importJamByUrl, syncItchJams } from "@/app/actions/jam-actions"

const ITCH_JAM_HTTPS_PREFIX = "https://itch.io/jam/"

type JamSearchSelectorProps = {
  value: string | null
  onValueChange: (jamId: string | null) => void
  /** Appelé quand la jam liée change (sélection, import, clear, ou chargement depuis la base). */
  onJamMetaChange?: (jam: ExternalJam | null) => void
  placeholder?: string
  className?: string
  /** Si true, appelle syncItchJams à l’ouverture du popover pour rafraîchir la liste */
  syncOnOpen?: boolean
  /** Afficher uniquement les jams dont ends_at est dans le futur ou null */
  activeOnly?: boolean
}

function isValidItchJamHttpsUrl(raw: string): boolean {
  return raw.trim().toLowerCase().startsWith(ITCH_JAM_HTTPS_PREFIX)
}

export function JamSearchSelector({
  value,
  onValueChange,
  onJamMetaChange,
  placeholder = "Choose a Jam…",
  className,
  syncOnOpen = true,
  activeOnly = true,
}: JamSearchSelectorProps) {
  const [browseOpen, setBrowseOpen] = React.useState(false)
  const [importDialogOpen, setImportDialogOpen] = React.useState(false)
  const [jams, setJams] = React.useState<ExternalJam[]>([])
  const [loading, setLoading] = React.useState(false)
  const [syncing, setSyncing] = React.useState(false)
  const [importUrl, setImportUrl] = React.useState("")
  const [importError, setImportError] = React.useState<string | null>(null)
  const [importFetching, setImportFetching] = React.useState(false)
  const [resolvedJam, setResolvedJam] = React.useState<ExternalJam | null>(null)

  const loadJams = React.useCallback(async () => {
    setLoading(true)
    const { data, error } = await getExternalJams({ activeOnly })
    if (!error) setJams(data)
    setLoading(false)
  }, [activeOnly])

  React.useEffect(() => {
    if (browseOpen) {
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
  }, [browseOpen, syncOnOpen, loadJams])

  React.useEffect(() => {
    if (!value) {
      setResolvedJam(null)
      return
    }
    if (jams.some((j) => j.id === value)) {
      setResolvedJam(null)
      return
    }
    let cancelled = false
    void (async () => {
      const { data, error } = await supabase
        .from("external_jams")
        .select("id, itch_id, title, url, thumbnail_url, starts_at, ends_at")
        .eq("id", value)
        .maybeSingle()
      if (cancelled || error || !data) return
      setResolvedJam(data as ExternalJam)
    })()
    return () => {
      cancelled = true
    }
  }, [value, jams])

  const selectedJam = value ? jams.find((j) => j.id === value) ?? resolvedJam : null

  React.useEffect(() => {
    if (!onJamMetaChange) return
    if (!value) {
      onJamMetaChange(null)
      return
    }
    if (!selectedJam) return
    onJamMetaChange(selectedJam)
  }, [
    onJamMetaChange,
    value,
    selectedJam?.id,
    selectedJam?.starts_at,
    selectedJam?.ends_at,
  ])

  const trimmedImport = importUrl.trim()
  const urlLooksValid = trimmedImport.length > 0 && isValidItchJamHttpsUrl(trimmedImport)
  const urlLooksInvalid = trimmedImport.length > 0 && !isValidItchJamHttpsUrl(trimmedImport)

  const handleFetchJamInfo = React.useCallback(async () => {
    if (!isValidItchJamHttpsUrl(importUrl)) {
      setImportError(`URL must start with ${ITCH_JAM_HTTPS_PREFIX}`)
      return
    }
    setImportError(null)
    setImportFetching(true)
    try {
      const result = await importJamByUrl(trimmedImport)
      if (!result.success) {
        setImportError(result.error)
        return
      }
      const jam = result.jam
      setJams((prev) => {
        const exists = prev.some((j) => j.id === jam.id)
        if (exists) return prev.map((j) => (j.id === jam.id ? jam : j))
        return [jam, ...prev]
      })
      setResolvedJam(null)
      onValueChange(jam.id)
      setImportUrl("")
      setImportDialogOpen(false)
      setBrowseOpen(false)
      toast.success("Jam imported", { description: jam.title ?? "Linked to your selection." })
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Import failed")
    } finally {
      setImportFetching(false)
    }
  }, [importUrl, trimmedImport, onValueChange])

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {selectedJam ? (
        <div className="flex h-12 items-center justify-between gap-2 rounded-xl border border-border/60 bg-secondary/50 px-3">
          <span className="flex min-w-0 flex-1 items-center gap-2 truncate text-sm font-medium text-foreground">
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
            <span className="truncate">{selectedJam.title || "Untitled"}</span>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={() => onValueChange(null)}
            aria-label="Clear jam selection"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {placeholder} — use one of the options below.
        </p>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Popover open={browseOpen} onOpenChange={setBrowseOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full justify-center gap-2 rounded-xl border-border/60 bg-secondary/50 font-normal"
            >
              <Search className="size-4 shrink-0" />
              Browse jam list
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[min(calc(100vw-2rem),24rem)] p-0 rounded-xl"
            align="start"
          >
            <Command shouldFilter={true}>
              <CommandInput placeholder="Search jams by name…" />
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
                        setBrowseOpen(false)
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
                          setBrowseOpen(false)
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

        <Button
          type="button"
          variant="outline"
          className="h-12 w-full justify-center gap-2 rounded-xl border-border/60 bg-secondary/50 font-normal"
          onClick={() => {
            setImportError(null)
            setImportDialogOpen(true)
          }}
        >
          <Link2 className="size-4 shrink-0" />
          Import by URL
        </Button>
      </div>

      <Dialog
        open={importDialogOpen}
        onOpenChange={(o) => {
          setImportDialogOpen(o)
          if (!o) {
            setImportUrl("")
            setImportError(null)
          }
        }}
      >
        <DialogContent className="max-w-md rounded-2xl border-border/60 bg-card">
          <DialogHeader>
            <DialogTitle>Import a jam from Itch.io</DialogTitle>
            <DialogDescription>
              Paste the full URL. It must start with{" "}
              <span className="font-mono text-foreground">{ITCH_JAM_HTTPS_PREFIX}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <Label htmlFor="jam-import-url-dialog" className="text-sm font-semibold">
              Jam URL
            </Label>
            <Input
              id="jam-import-url-dialog"
              placeholder={`${ITCH_JAM_HTTPS_PREFIX}your-jam`}
              value={importUrl}
              onChange={(e) => {
                setImportUrl(e.target.value)
                setImportError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && urlLooksValid && !importFetching) {
                  e.preventDefault()
                  void handleFetchJamInfo()
                }
              }}
              className="h-12 rounded-xl border-border/60 bg-secondary/50"
            />
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {urlLooksValid && (
                <Badge
                  variant="outline"
                  className="rounded-full border-teal/30 bg-teal/10 text-[11px] font-medium text-teal"
                >
                  Valid URL
                </Badge>
              )}
              {urlLooksInvalid && (
                <Badge
                  variant="outline"
                  className="rounded-full border-destructive/40 bg-destructive/10 text-[11px] font-medium text-destructive"
                >
                  Must start with {ITCH_JAM_HTTPS_PREFIX}
                </Badge>
              )}
            </div>
            {importError && <p className="text-xs text-destructive">{importError}</p>}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setImportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl gap-2"
              disabled={!urlLooksValid || importFetching}
              onClick={() => void handleFetchJamInfo()}
            >
              {importFetching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Link2 className="size-4" />
              )}
              Fetch jam info
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
