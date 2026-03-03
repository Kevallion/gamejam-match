import { createClient } from "@supabase/supabase-js"

/**
 * Supabase Admin client (Service Role) for server-side operations requiring
 * access to auth.users (e.g. fetching a user's email).
 * Use only on the server (Server Actions, API routes).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL must be set."
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

/**
 * Fetches a user's email from auth.users.
 * Returns null if the user doesn't exist or has no email (e.g. Discord login without email scope).
 * Never throws (returns null on error).
 */
export async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.getUserById(userId)

    if (error || !data?.user?.email) {
      return null
    }

    return data.user.email
  } catch {
    return null
  }
}
