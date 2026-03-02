import { createClient } from "./supabase/client"

/** Client Supabase pour les composants client (utilise cookies via @supabase/ssr) */
export const supabase = createClient()