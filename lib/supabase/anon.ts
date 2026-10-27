import { createClient } from "@supabase/supabase-js"

/**
 * Cookie-free anon client for statically cacheable Server Components.
 * Do not use for authenticated reads/writes.
 */
export function createAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  )
}
