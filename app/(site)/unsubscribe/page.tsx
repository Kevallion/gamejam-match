import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyUnsubscribeToken } from "@/lib/email-unsubscribe-token"
import { UnsubscribeForm } from "./unsubscribe-form"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Unsubscribe — GameJamCrew",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}

const SCOPE_LABEL = {
  team: "squad activity emails (applications, invitations, squad chat and squad updates)",
  matching: "matching and announcement emails (squad matches, tips and jam announcements)",
  all: "all GameJamCrew notification emails",
} as const

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "")
}

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-dvh items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">{children}</CardContent>
      </Card>
    </main>
  )
}

const settingsLink = (
  <Link href="/dashboard?tab=settings" className="font-medium text-foreground underline underline-offset-4">
    Settings
  </Link>
)

/**
 * Public page reached from the email footer. A GET only displays the request;
 * nothing changes until the Confirm button posts the signed token.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const u = first(params.u)
  const c = first(params.c)
  const t = first(params.t)
  const check = verifyUnsubscribeToken(u, c, t)

  if (!check.ok && check.reason === "unavailable") {
    return (
      <Shell title="Unsubscribe link unavailable">
        <p>
          One-click unsubscribe is not available right now. You can change your email preferences at any
          time in {settingsLink} after signing in.
        </p>
      </Shell>
    )
  }

  if (!check.ok) {
    return (
      <Shell title="Invalid unsubscribe link">
        <p>
          This link is incomplete or has been modified. Use the link from a recent email, or change your
          email preferences in {settingsLink}.
        </p>
      </Shell>
    )
  }

  return (
    <Shell title="Unsubscribe from emails">
      <CardDescription>
        You will stop receiving {SCOPE_LABEL[check.scope]}. Account and security emails are always sent.
      </CardDescription>
      <UnsubscribeForm u={u} c={check.scope} t={t} scopeLabel={SCOPE_LABEL[check.scope]} />
      <p>You can turn emails back on at any time in {settingsLink}.</p>
    </Shell>
  )
}
