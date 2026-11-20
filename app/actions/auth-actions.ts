"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient, getUserEmail } from "@/lib/supabase/admin"
import { sendEmailWithLayout } from "@/lib/mail"
import { escapeHtml } from "@/lib/mail-template"
import { isEmailDerivedLabel } from "@/lib/public-display-name"
import { anonymizeDeletedUserMessage } from "@/lib/account-deletion"

type AdminClient = ReturnType<typeof createAdminClient>

/**
 * Rewrites the notifications this user sent to other members so their username
 * no longer appears ("A deleted user …") and clears sender_id.
 * Mirrors the DB trigger `anonymize_deleted_user_notifications`, so it also works
 * before that migration is applied. Throws on any database error.
 */
async function anonymizeSentNotifications(admin: AdminClient, userId: string, username: string | null) {
  const { data: rows, error } = await admin
    .from("notifications")
    .select("id, message")
    .eq("sender_id", userId)
    .neq("user_id", userId)
  if (error) throw new Error("Could not anonymize notifications.")

  for (const row of rows ?? []) {
    const message = typeof row.message === "string" ? row.message : ""
    const { error: updateError } = await admin
      .from("notifications")
      .update({ message: anonymizeDeletedUserMessage(message, username), sender_id: null })
      .eq("id", row.id as string)
    if (updateError) throw new Error("Could not anonymize notifications.")
  }
}

async function sendAccountDeletedEmail(email: string, username: string | null) {
  const name = username?.trim()
  const greeting = name && !isEmailDerivedLabel(name) ? `Hi ${escapeHtml(name)},` : "Hi,"
  const contentHtml = `
      <p style="margin:0 0 16px;color:#1f2937;font-size:16px;font-weight:600;">${greeting}</p>
      <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.65;">Your GameJamCrew account and the data linked to it (profile, posts, squads you led, applications and messages) have been permanently deleted.</p>
      <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">If you did not request this, reply to this email or contact us at ${escapeHtml("contact@gamejamcrew.com")}.</p>
      <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.5;">Thanks for jamming with us.<br/><span style="color:#9ca3af;">The GameJamCrew team</span></p>
    `
  await sendEmailWithLayout(email, "Your GameJamCrew account has been deleted", "Account deleted", contentHtml, {
    hideUnsubscribe: true,
  })
}

/**
 * Deletes the currently authenticated user's account (RGPD compliance).
 * 1. Anonymizes the notifications this user sent to others (aborts on failure).
 * 2. Deletes from auth.users with the admin client; profiles, posts, team_members,
 *    join_requests, kudos, team_messages, notifications… cascade via DB constraints.
 * 3. Sends a short confirmation email (best effort, never blocks the deletion).
 * 4. Signs out and redirects to "/?account_deleted=1".
 */
export async function deleteUserAccount(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "User not authenticated" }
  }

  const userId = user.id

  try {
    const admin = createAdminClient()

    const { data: profile } = await admin.from("profiles").select("username").eq("id", userId).maybeSingle()
    const username = (profile?.username as string | null | undefined) ?? null
    const email = user.email ?? (await getUserEmail(userId))

    try {
      await anonymizeSentNotifications(admin, userId, username)
    } catch {
      return { success: false, error: "Could not prepare your account for deletion. Nothing was deleted, please try again." }
    }

    const { error } = await admin.auth.admin.deleteUser(userId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Sent only once the account is really gone, so the email never confirms a failed deletion.
    if (email) {
      try {
        await sendAccountDeletedEmail(email, username)
      } catch {
        // Best effort: the account is already deleted.
      }
    }

    // Sign out to clear any remaining session/cookies
    await supabase.auth.signOut()

    redirect("/?account_deleted=1")
  } catch (err) {
    // Next.js redirect() throws - rethrow to allow navigation
    const digest = err && typeof err === "object" && "digest" in err ? String((err as { digest?: string }).digest) : ""
    if (digest.startsWith("NEXT_REDIRECT")) throw err
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete account",
    }
  }
}
