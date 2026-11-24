"use client"

import Link from "next/link"
import { AppIcon } from "@/components/ui/app-icon"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { COMPOSE_AVAILABILITY_HREF, dashboardHref } from "@/components/app-shell/nav-config"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"
import type { RefObject } from "react"

type CreateSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  availabilityCount?: number
  availabilityQuota?: number
  triggerRef?: RefObject<HTMLButtonElement | null>
}

export function CreateSheet({
  open,
  onOpenChange,
  availabilityCount = 0,
  availabilityQuota = 3,
  triggerRef,
}: CreateSheetProps) {
  const postsUsed = Math.min(availabilityCount, availabilityQuota)
  const atQuota = postsUsed >= availabilityQuota

  const close = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-dialog-title"
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          triggerRef?.current?.focus()
        }}
        className={cn(
          "top-[50%] left-[50%] z-50 w-[min(24rem,calc(100%-2rem))] max-w-[min(24rem,calc(100%-2rem))] translate-x-[-50%] translate-y-[-50%] gap-0 rounded-2xl border border-border bg-card p-6 shadow-[3px_3px_0_0_var(--neo-shadow)] sm:max-w-[min(24rem,calc(100%-2rem))]",
          "motion-reduce:animate-none motion-reduce:transition-none motion-reduce:data-[state=open]:animate-none motion-reduce:data-[state=closed]:animate-none",
        )}
      >
        <DialogHeader className="pr-12 text-left">
          <DialogTitle id="create-dialog-title" className="font-display text-2xl font-extrabold tracking-tight">
            Create
          </DialogTitle>
          <DialogDescription className="sr-only">
            Choose whether to create a squad, post availability, or find members.
          </DialogDescription>
        </DialogHeader>
        <DialogClose
          className="absolute top-3 right-3 grid size-11 place-items-center rounded-xl text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close"
        >
          <AppIcon icon={ICON.close} size="md" />
        </DialogClose>
        <div className="mt-4 flex flex-col gap-3">
          <Link
            href="/create-team"
            onClick={close}
            className="flex min-h-12 items-center gap-3 rounded-xl border border-pink/30 bg-pink/10 px-4 py-3 shadow-[3px_3px_0_0_var(--neo-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-pink/15 text-pink">
              <AppIcon icon={ICON.edit} size="lg" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-base font-bold text-foreground">Create a squad</span>
              <span className="block text-sm text-muted-foreground">Recruit jammers for your jam</span>
            </span>
            <AppIcon icon={ICON.navRight} size="sm" tone="muted" />
          </Link>

          <Link
            href={atQuota ? dashboardHref("availability") : COMPOSE_AVAILABILITY_HREF}
            onClick={close}
            className={cn(
              "flex min-h-12 items-center gap-3 rounded-xl border border-lavender/30 bg-lavender/10 px-4 py-3 shadow-[3px_3px_0_0_var(--neo-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              atQuota && "opacity-80",
            )}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-lavender/15 text-lavender">
              <AppIcon icon={ICON.available} size="lg" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-base font-bold text-foreground">Post availability</span>
              <span className="block text-sm text-muted-foreground">
                {postsUsed}/{availabilityQuota} posts used
                {atQuota ? " · quota reached" : ""}
              </span>
            </span>
            <AppIcon icon={ICON.navRight} size="sm" tone="muted" />
          </Link>

          <Link
            href="/find-members"
            onClick={close}
            className="flex min-h-12 items-center gap-3 rounded-xl border border-teal/30 bg-teal/10 px-4 py-3 shadow-[3px_3px_0_0_var(--neo-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal/15 text-teal">
              <AppIcon icon={ICON.findJammers} size="lg" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-base font-bold text-foreground">Find members</span>
              <span className="block text-sm text-muted-foreground">Browse available jammers</span>
            </span>
            <AppIcon icon={ICON.navRight} size="sm" tone="muted" />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}