import { createAdminClient } from "@/lib/supabase/admin"
import { isMissingColumnError } from "@/lib/optional-column"
import { EMAIL_PREFERENCE_COLUMN, type EmailCategory } from "@/lib/email-unsubscribe-token"

/**
 * Server only. Whether `userId` still accepts emails of `category`.
 * - column missing (migration not applied yet): true, same as before S3
 * - no profile row: true (defaults are true)
 * - other lookup error: team activity is sent, matching/announcements is skipped
 */
export async function isEmailCategoryEnabled(
  userId: string,
  category: EmailCategory,
): Promise<boolean> {
  const column = EMAIL_PREFERENCE_COLUMN[category]
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("profiles")
      .select(column)
      .eq("id", userId)
      .maybeSingle()
    if (error) {
      if (isMissingColumnError(error, column)) return true
      console.error("[mail] email preference lookup failed:", error.code ?? "", error.message ?? "")
      return category === "team_activity"
    }
    const value = (data as Record<string, unknown> | null)?.[column]
    return value !== false
  } catch (err) {
    console.error("[mail] email preference lookup threw:", err instanceof Error ? err.message : err)
    return category === "team_activity"
  }
}
