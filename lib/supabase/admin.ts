import { createClient } from "@supabase/supabase-js"

/**
 * Client Supabase Admin (Service Role) pour les opérations serveur nécessitant
 * un accès à auth.users (ex: récupérer l'e-mail d'un utilisateur).
 * À utiliser uniquement côté serveur (Server Actions, API routes).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY et NEXT_PUBLIC_SUPABASE_URL doivent être définis."
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
 * Récupère l'e-mail d'un utilisateur depuis auth.users.
 * Retourne null si l'utilisateur n'existe pas ou n'a pas d'e-mail (ex: login Discord sans scope email).
 * Ne lève jamais d'exception (retourne null en cas d'erreur).
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
