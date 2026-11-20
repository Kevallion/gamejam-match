"use client"

import { EmailPreferencesRows } from "@/components/settings/email-preferences"

/** Mock values only: the enabled state shows the rows once Pixel's migration is applied. */
export function DevEmailPreferencesPreview() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 px-4 py-10">
      <section id="enabled" className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Enabled (columns present)</p>
        <div className="rounded-xl border border-border/50 bg-muted/30 p-6">
          <EmailPreferencesRows initial={{ teamActivity: true, matchingAnnouncements: false }} available />
        </div>
      </section>
      <section id="unavailable" className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Disabled (migration not applied)</p>
        <div className="rounded-xl border border-border/50 bg-muted/30 p-6">
          <EmailPreferencesRows initial={{ teamActivity: true, matchingAnnouncements: true }} available={false} />
        </div>
      </section>
    </main>
  )
}