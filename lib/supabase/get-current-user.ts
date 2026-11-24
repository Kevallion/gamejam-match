import { cache } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

/**
 * Shared auth read for a single Server Component request.
 * React cache() dedupes layout + page getUser calls (DS-3a perf).
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})
