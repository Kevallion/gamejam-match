"use server"

import {
  getDirectoryJammers,
  type DirectoryJammersFilters,
  type GamejamSupabaseClient,
} from "@/lib/queries"
import { createClient } from "@/lib/supabase/server"

export async function loadDirectoryJammers(filters: DirectoryJammersFilters) {
  const supabase = (await createClient()) as unknown as GamejamSupabaseClient
  return getDirectoryJammers(filters, supabase)
}
