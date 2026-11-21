"use client"

import { useId, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ConsentCategories } from "@/lib/consent"

type CookiePreferencesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial: ConsentCategories
  /** false on a first visit (no stored choice yet). */
  decided: boolean
  onSave: (categories: ConsentCategories) => void
}

const CHOICE_CLASS = "h-9 rounded-xl px-3 text-sm font-semibold sm:min-w-28"

function CategoryRow({
  title,
  description,
  control,
}: {
  title: React.ReactNode
  description: React.ReactNode
  control: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border/50 bg-muted/30 p-3">
      <div className="min-w-0 space-y-1">
        {title}
        <div className="text-xs leading-relaxed text-muted-foreground">{description}</div>
      </div>
      <div className="flex shrink-0 items-center pt-0.5">{control}</div>
    </div>
  )
}

export function CookiePreferencesDialog({ open, onOpenChange, initial, decided, onSave }: CookiePreferencesDialogProps) {
  const [analytics, setAnalytics] = useState(initial.analytics)
  const lastFocused = useRef<HTMLElement | null>(null)
  const analyticsId = useId()
  const necessaryId = useId()

  // Reset the draft each time the dialog opens (render-time sync, no effect).
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setAnalytics(initial.analytics)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100svh-2rem)] gap-4 overflow-y-auto rounded-2xl border-border/60 sm:max-w-lg"
        onOpenAutoFocus={() => {
          lastFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
        }}
        onCloseAutoFocus={(event) => {
          // The opener may be the banner, which disappears after a choice.
          event.preventDefault()
          const target = lastFocused.current
          if (target?.isConnected) {
            target.focus()
            return
          }
          const main = document.querySelector("main")
          if (main instanceof HTMLElement) {
            if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1")
            main.focus({ preventScroll: true })
          }
        }}
      >
        <DialogHeader className="text-left">
          <DialogTitle>Cookie settings</DialogTitle>
          <DialogDescription>
            Choose which optional tools can run in this browser. Your choice is saved on this device for 6 months.{" "}
            <Link href="/privacy#cookies" className="font-medium text-primary underline-offset-4 hover:underline">
              Privacy policy
            </Link>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <CategoryRow
            title={
              <label htmlFor={necessaryId} className="text-sm font-semibold text-foreground">
                Strictly necessary
              </label>
            }
            description="Keep you signed in (Supabase session cookies) and remember your theme and this choice (stored in your browser). Always on."
            control={<Switch id={necessaryId} checked disabled aria-describedby={`${necessaryId}-state`} />}
          />
          <span id={`${necessaryId}-state`} className="sr-only">
            Always on
          </span>
          <CategoryRow
            title={
              <label htmlFor={analyticsId} className="text-sm font-semibold text-foreground">
                Analytics
              </label>
            }
            description="Google Analytics 4 (loaded through Google Tag Manager) and Vercel Web Analytics measure visits and page views so we can improve the site. Google Analytics sets _ga cookies kept up to 13 months."
            control={<Switch id={analyticsId} checked={analytics} onCheckedChange={setAnalytics} />}
          />
        </div>

        <DialogFooter className="grid grid-cols-3 gap-2 sm:flex sm:justify-end">
          <Button type="button" variant="outline" className={CHOICE_CLASS} onClick={() => onSave({ analytics: false })}>
            Reject all
          </Button>
          <Button type="button" variant="outline" className={CHOICE_CLASS} onClick={() => onSave({ analytics })}>
            Save choices
          </Button>
          <Button type="button" variant="outline" className={CHOICE_CLASS} onClick={() => onSave({ analytics: true })}>
            Accept all
          </Button>
        </DialogFooter>
        {decided ? null : (
          <p className="text-xs text-muted-foreground">Nothing optional runs until you choose.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}