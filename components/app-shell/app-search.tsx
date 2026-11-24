"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AppIcon } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable
}

export function AppSearch({
  variant,
  className,
}: {
  variant: "desktop" | "mobile"
  className?: string
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const urlQuery =
    pathname.startsWith("/find-members") || pathname.startsWith("/directory")
      ? (searchParams.get("q") ?? "")
      : ""

  return (
    <AppSearchField
      key={`${variant}:${pathname}:${urlQuery}`}
      variant={variant}
      className={className}
      initialValue={urlQuery}
    />
  )
}

function AppSearchField({
  variant,
  className,
  initialValue,
}: {
  variant: "desktop" | "mobile"
  className?: string
  initialValue: string
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(initialValue)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return
      if (isTypingTarget(event.target)) return
      const isDesktop = window.matchMedia("(min-width: 1280px)").matches
      if (variant === "desktop" && !isDesktop) return
      if (variant === "mobile" && isDesktop) return
      event.preventDefault()
      setOpen(true)
      inputRef.current?.focus()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [variant])

  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    const q = value.trim()
    router.push(q ? `/find-members?q=${encodeURIComponent(q)}` : "/find-members")
    setOpen(false)
  }

  if (variant === "mobile") {
    return (
      <div className={cn("app-desktop:hidden", className)}>
        {open ? (
          <form onSubmit={submit} className="flex items-center gap-2">
            <label className="sr-only" htmlFor="app-shell-search-mobile">
              Search jams, squads, members
            </label>
            <input
              id="app-shell-search-mobile"
              ref={inputRef}
              type="search"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={() => {
                if (!value.trim()) setOpen(false)
              }}
              placeholder="Search jams, squads, members"
              className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-card px-3 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </form>
        ) : (
          <button
            type="button"
            className="grid size-11 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Search jams, squads, members"
            onClick={() => {
              setOpen(true)
              requestAnimationFrame(() => inputRef.current?.focus())
            }}
          >
            <AppIcon icon={ICON.search} size="md" />
          </button>
        )}
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "flex h-11 min-w-0 max-w-[380px] flex-1 items-center gap-2.5 rounded-xl border border-border bg-card px-3.5",
        "text-[13px] font-bold shadow-[3px_3px_0_0_var(--neo-shadow)]",
        className,
      )}
      role="search"
    >
      <AppIcon icon={ICON.search} size="sm" tone="muted" />
      <label className="sr-only" htmlFor="app-shell-search">
        Search jams, squads, members
      </label>
      <input
        id="app-shell-search"
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search jams, squads, members"
        className="min-w-0 flex-1 bg-transparent text-[13px] font-bold text-foreground outline-none placeholder:text-muted-foreground"
      />
      <kbd className="ml-auto rounded-md border border-border px-1.5 text-[11px] font-black text-muted-foreground">
        /
      </kbd>
    </form>
  )
}