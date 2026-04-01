"use server"

import { createClient } from "@/lib/supabase/server"

export type CancelJoinRequestResult =
  | { success: true }
  | { success: false; error: string }

/**
 * Deletes a pending `join_request` the current user may retract:
 * - `application`: `sender_id` must be the applicant (`auth.uid()`).
 * - `invitation`: `sender_id` in DB is the invitee; only the team owner may cancel.
 */
export async function cancelJoinRequest(joinRequestId: string): Promise<CancelJoinRequestResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "You must be signed in." }
  }

  const { data: row, error: fetchError } = await supabase
    .from("join_requests")
    .select("id, sender_id, team_id, type, status")
    .eq("id", joinRequestId)
    .single()

  if (fetchError || !row) {
    return { success: false, error: fetchError?.message ?? "Request not found." }
  }

  if (row.status !== "pending") {
    return { success: false, error: "Only pending requests can be cancelled." }
  }

  let allowed = false
  if (row.type === "application") {
    allowed = row.sender_id === user.id
  } else if (row.type === "invitation") {
    const { data: team } = await supabase
      .from("teams")
      .select("user_id")
      .eq("id", row.team_id)
      .maybeSingle()
    allowed = team?.user_id === user.id
  }

  if (!allowed) {
    return { success: false, error: "You are not allowed to cancel this request." }
  }

  const { error: delError } = await supabase.from("join_requests").delete().eq("id", joinRequestId)

  if (delError) {
    return { success: false, error: delError.message }
  }

  return { success: true }
}
