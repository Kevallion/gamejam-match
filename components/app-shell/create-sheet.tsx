"use client"

import Link from "next/link"
import { AppIcon } from "@/components/ui/app-icon"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"

type CreateSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  availabilityCount?: number
  availabilityQuota?: number
}

export function CreateSheet({
  open,
  onOpenChange,
  availabilityCount = 0,
  availabilityQuota = 3,
}: CreateSheetProps) {
  const postsUsed = Math.min(availabilityCount, availabilityQuota)
  const atQuota = postsUsed >= availabilityQuota

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
      <DrawerContent className="rounded-t-3xl border-border/50 bg-card pb-[env(safe-area-inset-bottom,0px)]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-lg font-bold tracking-tight">Create</DrawerTitle>
          <DrawerDescription className="sr-only">
            Choose whether to create a squad, post availability, or find members.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-3 px-4 pb-4">
          <Link
            href="/create-team"
            onClick={() => {
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur()
              }
              onOpenChange(false)
            }}
            className={cn(
              "card-interactive flex min-h-[76px] items-center gap-3 rounded-2xl border border-pink/30 bg-pink/5 px-4 py-3",
            )}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-pink/15 text-pink">
              <AppIcon icon={ICON.edit} size="lg" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-sm font-bold text-foreground">Create a squad</span>
              <span className="block text-xs text-muted-foreground">Recruit jammers for your jam</span>
            </span>
            <AppIcon icon={ICON.navRight} size="sm" tone="muted" />
          </Link>

          <Link
            href={atQuota ? "/dashboard?tab=availability" : "/create-profile"}
            onClick={() => {
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur()
              }
              onOpenChange(false)
            }}
            className={cn(
              "card-interactive flex min-h-[76px] items-center gap-3 rounded-2xl border border-lavender/30 bg-lavender/5 px-4 py-3",
              atQuota && "opacity-80",
            )}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-lavender/15 text-lavender">
              <AppIcon icon={ICON.available} size="lg" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-sm font-bold text-foreground">Post availability</span>
              <span className="block text-xs text-muted-foreground">
                {postsUsed}/{availabilityQuota} posts used
                {atQuota ? " · quota reached" : ""}
              </span>
            </span>
            <AppIcon icon={ICON.navRight} size="sm" tone="muted" />
          </Link>

          <Link
            href="/find-members"
            onClick={() => {
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur()
              }
              onOpenChange(false)
            }}
            className="card-interactive flex min-h-12 items-center gap-3 rounded-2xl border border-teal/30 bg-teal/5 px-4 py-3"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal/15 text-teal">
              <AppIcon icon={ICON.findJammers} size="lg" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-sm font-bold text-foreground">Find members</span>
              <span className="block text-xs text-muted-foreground">Browse available jammers</span>
            </span>
            <AppIcon icon={ICON.navRight} size="sm" tone="muted" />
          </Link>

          <DrawerClose asChild>
            <Button type="button" variant="ghost" className="mt-1 h-12 rounded-xl">
              Cancel
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
