"use server"

import { applyUnsubscribe } from "@/lib/email-unsubscribe"
import type { UnsubscribeScope } from "@/lib/email-unsubscribe-token"

export type UnsubscribeFormState =
  | { status: "idle" }
  | { status: "done"; scope: UnsubscribeScope }
  | { status: "error"; reason: "unavailable" | "invalid" | "not_migrated" | "error" }

/** Confirm button of /unsubscribe. No session needed: the signed token is the proof. */
export async function confirmUnsubscribe(
  _prev: UnsubscribeFormState,
  formData: FormData,
): Promise<UnsubscribeFormState> {
  const result = await applyUnsubscribe(formData.get("u"), formData.get("c"), formData.get("t"))
  if (result.ok) return { status: "done", scope: result.scope }
  return { status: "error", reason: result.reason }
}
