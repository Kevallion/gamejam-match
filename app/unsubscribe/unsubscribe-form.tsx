"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { confirmUnsubscribe, type UnsubscribeFormState } from "@/app/actions/unsubscribe-actions"

const ERROR_TEXT: Record<Extract<UnsubscribeFormState, { status: "error" }>["reason"], string> = {
  unavailable: "Unsubscribe link unavailable. Change your preferences in Settings instead.",
  invalid: "This unsubscribe link is invalid. Change your preferences in Settings instead.",
  not_migrated: "Email preferences are not available yet. Please try again later or contact us.",
  error: "Something went wrong. Please try again in a moment.",
}

export function UnsubscribeForm({
  u,
  c,
  t,
  scopeLabel,
}: {
  u: string
  c: string
  t: string
  scopeLabel: string
}) {
  const [state, formAction, pending] = useActionState<UnsubscribeFormState, FormData>(
    confirmUnsubscribe,
    { status: "idle" },
  )

  if (state.status === "done") {
    return (
      <div role="status" className="flex flex-col gap-2">
        <p className="text-base font-semibold text-foreground">You&apos;re unsubscribed</p>
        <p>You will no longer receive {scopeLabel}.</p>
        <Button asChild variant="outline" className="self-start">
          <Link href="/">Back to GameJamCrew</Link>
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="u" value={u} />
      <input type="hidden" name="c" value={c} />
      <input type="hidden" name="t" value={t} />
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Unsubscribing…" : "Confirm unsubscribe"}
      </Button>
      {state.status === "error" ? (
        <p role="alert" className="text-destructive">
          {ERROR_TEXT[state.reason]}
        </p>
      ) : null}
    </form>
  )
}
