"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { AppIcon } from "@/components/ui/app-icon"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { MORE_SHEET_ITEMS, moreSheetActiveId } from "@/components/app-shell/nav-config"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"

type MoreSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function closeSheet(onOpenChange: (open: boolean) => void) {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
  onOpenChange(false)
}

export function MoreSheet({ open, onOpenChange }: MoreSheetProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeId = moreSheetActiveId(pathname, searchParams.toString())

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
        onOpenChange(next)
      }}
    >
      <DrawerContent
        id="app-more-sheet"
        className={cn(
          "flex max-h-[min(85dvh,calc(100dvh-env(safe-area-inset-top,0px)-1rem))] flex-col",
          "rounded-t-3xl border-border/50 bg-card",
        )}
      >
        <DrawerHeader className="shrink-0 text-left">
          <DrawerTitle className="font-display text-2xl font-extrabold tracking-tight">More</DrawerTitle>
          <DrawerDescription className="sr-only">
            Open Home, Rewards, Me, or Settings.
          </DrawerDescription>
        </DrawerHeader>
        <nav
          aria-label="More"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
        >
          <div className="flex flex-col gap-3">
          {MORE_SHEET_ITEMS.map((item) => {
            const active = activeId === item.id
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => closeSheet(onOpenChange)}
                className={cn(
                  "card-interactive flex min-h-[52px] items-center gap-3 rounded-2xl border px-4 py-3",
                  active
                    ? "border-border bg-primary/10"
                    : "border-border bg-background",
                )}
              >
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl",
                    active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
                  )}
                >
                  <AppIcon
                    icon={item.icon}
                    size="lg"
                    className={active ? "text-primary-foreground" : undefined}
                  />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-base font-bold text-foreground">{item.label}</span>
                  <span className="block text-sm text-muted-foreground">{item.hint}</span>
                </span>
                <AppIcon icon={ICON.navRight} size="sm" tone="muted" />
              </Link>
            )
          })}
          </div>
        </nav>
      </DrawerContent>
    </Drawer>
  )
}
