"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { CreateSheet } from "@/components/app-shell/create-sheet"
import { MoreSheet } from "@/components/app-shell/more-sheet"
import {
  HOTBAR_SLOTS,
  MOBILE_TABS,
  hotbarActiveId,
  mobileHotbarActiveId,
  type HotbarSlotId,
} from "@/components/app-shell/nav-config"
import { AppIcon } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"

type BentoHotbarProps = {
  inboxCount?: number
  availabilityCount?: number
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true
  if (target.isContentEditable) return true
  return Boolean(target.closest("[contenteditable='true'], [role='textbox']"))
}

function SlotBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="absolute -right-2 -top-2 flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full border border-border bg-peach px-1 text-[11px] font-bold text-peach-foreground">
      {count > 9 ? "9+" : count}
    </span>
  )
}

/**
 * Nav 2 — floating game-style hotbar (desktop numbered dock + mobile FAB bar).
 * Keyboard 1–5 switches slots when not typing in a field.
 */
export function BentoHotbar({ inboxCount = 0, availabilityCount = 0 }: BentoHotbarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const activeId = hotbarActiveId(pathname, searchParams.toString())
  const mobileActiveId = mobileHotbarActiveId(pathname, searchParams.toString())

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingTarget(event.target)) return
      const key = event.key
      if (!/^[1-5]$/.test(key)) return
      const slot = HOTBAR_SLOTS.find((item) => item.key === key)
      if (!slot) return
      event.preventDefault()
      router.push(slot.href)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [router])

  const leftDesktop = HOTBAR_SLOTS.filter((s) => s.key === "1" || s.key === "2")
  const rightDesktop = HOTBAR_SLOTS.filter((s) => s.key === "3" || s.key === "4" || s.key === "5")
  const mobileSlots = MOBILE_TABS.filter((item) => !item.create && !item.more)
  const moreActive = mobileActiveId === "more"

  return (
    <>
      {/* Desktop dock (xl, 1280+) */}
      <nav
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden justify-center pb-[max(var(--app-hotbar-inset),env(safe-area-inset-bottom,0px))] app-desktop:flex"
        aria-label="Main"
      >
        <div
          className={cn(
            "pointer-events-auto flex items-end gap-2 rounded-3xl border border-border bg-card px-3 py-2.5",
            "shadow-[3px_3px_0_0_var(--neo-shadow)]",
          )}
        >
          {leftDesktop.map((item) => (
            <HotbarSlot
              key={item.id}
              item={item}
              active={activeId === item.id}
              inboxCount={inboxCount}
              showLabel
            />
          ))}

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            aria-label="Create"
            className={cn(
              "mx-1.5 mb-0.5 grid size-[74px] place-items-center rounded-[22px] border-2 border-[var(--neo-shadow)]",
              "bg-pink text-pink-foreground shadow-[4px_4px_0_0_var(--neo-shadow)]",
              "-translate-y-3.5 -rotate-[4deg] transition-transform hover:-translate-y-4 focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            <AppIcon icon={ICON.create} size="xl" className="text-pink-foreground" />
          </button>

          {rightDesktop.map((item) => (
            <div key={item.id} className="flex items-end gap-2">
              {item.id === "explore" ? (
                <span
                  className="mb-4 hidden h-11 w-0.5 self-center rounded-full bg-border lg:block"
                  aria-hidden
                />
              ) : null}
              <HotbarSlot
                item={item}
                active={activeId === item.id}
                inboxCount={inboxCount}
                showLabel
              />
            </div>
          ))}
        </div>
      </nav>

      {/* Mobile floating tab bar */}
      <nav
        className={cn(
          "fixed z-40 flex items-center justify-between app-desktop:hidden",
          "left-3 right-3 rounded-3xl border border-border bg-card",
          "shadow-[3px_3px_0_0_var(--neo-shadow)]",
          "h-[68px] px-2",
        )}
        style={{
          bottom: "max(var(--app-hotbar-inset), env(safe-area-inset-bottom, 0px))",
        }}
        aria-label="Main"
      >
        {mobileSlots.slice(0, 2).map((item) => (
          <MobileHotbarLink
            key={item.id}
            item={item}
            active={mobileActiveId === item.id}
            inboxCount={inboxCount}
          />
        ))}

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          aria-label="Create"
          className={cn(
            "mb-7 grid size-[60px] place-items-center rounded-[20px] border-2 border-[var(--neo-shadow)]",
            "bg-pink text-pink-foreground shadow-[3px_3px_0_0_var(--neo-shadow)]",
            "-rotate-[4deg] transition-transform active:scale-95 focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <AppIcon icon={ICON.create} size="xl" className="text-pink-foreground" />
        </button>

        {mobileSlots.slice(2).map((item) => (
          <MobileHotbarLink
            key={item.id}
            item={item}
            active={mobileActiveId === item.id}
            inboxCount={inboxCount}
          />
        ))}

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-label="More"
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          aria-controls="app-more-sheet"
          className={cn(
            "relative flex min-h-11 min-w-11 w-[52px] shrink-0 flex-col items-center gap-0.5 text-[10px] font-black transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            moreActive ? "text-primary" : "text-muted-foreground",
          )}
        >
          <span className="relative">
            <AppIcon icon={ICON.more} size="lg" tone={moreActive ? "primary" : "muted"} />
          </span>
          <span className="max-w-full truncate">More</span>
          {moreActive ? (
            <span className="mt-0.5 h-1 w-[18px] rounded-full bg-primary" aria-hidden />
          ) : (
            <span className="mt-0.5 h-1 w-[18px]" aria-hidden />
          )}
        </button>
      </nav>

      <CreateSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        availabilityCount={availabilityCount}
      />
      <MoreSheet open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  )
}

function HotbarSlot({
  item,
  active,
  inboxCount,
  showLabel,
}: {
  item: (typeof HOTBAR_SLOTS)[number]
  active: boolean
  inboxCount: number
  showLabel?: boolean
}) {
  return (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      title={`${item.label} (${item.key})`}
      className={cn(
        "relative flex size-[62px] flex-col items-center justify-center gap-0.5 rounded-xl border",
        "text-[10px] font-extrabold transition-transform focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "-translate-y-1.5 border-border bg-primary text-primary-foreground shadow-[3px_3px_0_0_var(--neo-shadow)]"
          : "border-border bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "absolute left-1.5 top-1 text-[9px] font-black opacity-80",
          active ? "text-primary-foreground" : "text-muted-foreground",
        )}
        aria-hidden
      >
        {item.key}
      </span>
      {active && showLabel ? (
        <span
          className={cn(
            "absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md",
            "border border-border bg-foreground px-2.5 py-1 text-xs font-black text-background",
            "after:absolute after:left-1/2 after:top-full after:-ml-1.5 after:border-[6px] after:border-transparent",
            "after:border-t-foreground after:content-['']",
          )}
        >
          {item.label}
        </span>
      ) : null}
      <span className="relative">
        <AppIcon
          icon={item.icon}
          size="lg"
          className={active ? "text-primary-foreground" : undefined}
        />
        {item.badge === "inbox" ? <SlotBadge count={inboxCount} /> : null}
      </span>
      {!active ? <span className="leading-none">{item.label}</span> : null}
    </Link>
  )
}

function MobileHotbarLink({
  item,
  active,
  inboxCount,
}: {
  item: (typeof MOBILE_TABS)[number]
  active: boolean
  inboxCount: number
}) {
  if (!item.href) return null
  return (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-11 min-w-11 w-[52px] shrink-0 flex-col items-center gap-0.5 text-[10px] font-black transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <span className="relative">
        <AppIcon icon={item.icon} size="lg" tone={active ? "primary" : "muted"} />
        {item.badge === "inbox" ? (
          <span className="absolute -right-2.5 -top-1.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border border-border bg-peach px-0.5 text-[10px] font-bold text-peach-foreground">
            {inboxCount > 9 ? "9+" : inboxCount}
          </span>
        ) : null}
      </span>
      <span className="max-w-full truncate">{item.label}</span>
      {active ? (
        <span className="mt-0.5 h-1 w-[18px] rounded-full bg-primary" aria-hidden />
      ) : (
        <span className="mt-0.5 h-1 w-[18px]" aria-hidden />
      )}
    </Link>
  )
}

/** Bottom padding so page content clears the floating hotbar (safe-area aware). */
export const BENTO_HOTBAR_OFFSET_CLASS = "app-shell-main"

export type { HotbarSlotId }
