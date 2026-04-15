"use server"

import {
  getAvailablePlayers,
  type AvailablePlayersFilters,
  type GamejamSupabaseClient,
} from "@/lib/queries"
import { createClient } from "@/lib/supabase/server"

export async function loadMoreAvailablePlayers(
  filters: AvailablePlayersFilters,
) {
  const supabase = (await createClient()) as unknown as GamejamSupabaseClient
  return getAvailablePlayers(filters, supabase)
}
