"use server"

import { createClient } from "@/lib/supabase/server"
import { awardXP } from "@/lib/gamification"
import type { GamificationRewardSummary } from "@/lib/gamification-reward-types"
import {
  createTeamFormSchema,
  updateTeamJamListingSchema,
  type CreateTeamInput,
  type UpdateTeamJamListingInput,
} from "@/lib/team-listing-schema"
import {
  ENGINE_OPTIONS,
  EXPERIENCE_OPTIONS,
  JAM_STYLE_OPTIONS,
  LANGUAGE_OPTIONS,
  ROLE_OPTIONS,
} from "@/lib/constants"
import { enqueueSmartMatchEmailsForNewTeam } from "@/lib/smart-match-new-team-email"

const ENGINE_VALUES = new Set<string>(ENGINE_OPTIONS.map((o) => o.value))
const LANGUAGE_VALUES = new Set<string>(LANGUAGE_OPTIONS.map((o) => o.value))
const JAM_STYLE_VALUES = new Set<string>(JAM_STYLE_OPTIONS.map((o) => o.value))
const EXPERIENCE_VALUES = new Set<string>(EXPERIENCE_OPTIONS.map((o) => o.value))
const ROLE_VALUES = new Set<string>(ROLE_OPTIONS.map((o) => o.value))

export type CreateTeamResult =
  | { success: true; teamId: string; gamification?: GamificationRewardSummary }
  | { success: false; error: string }

export type { CreateTeamInput, CreateTeamLookingForEntry } from "@/lib/team-listing-schema"

export async function createTeam(input: CreateTeamInput): Promise<CreateTeamResult> {
  const parsed = createTeamFormSchema.safeParse(input)
  if (!parsed.success) {
    const flat = parsed.error.flatten()
    const fieldMsg = Object.values(flat.fieldErrors).flat().find(Boolean)
    const msg = fieldMsg ?? flat.formErrors[0] ?? "Invalid team data."
    return { success: false, error: msg }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "You must be signed in to create a team." }
  }

  const {
    teamName,
    jamName,
    description,
    engine,
    language,
    lookingFor: rawLookingFor,
    discordLink,
    teamVibe: rawVibe,
    experienceRequired: rawExp,
    jamId: rawJamId,
    jamStartDate,
    jamEndDate,
  } = parsed.data

  if (!ENGINE_VALUES.has(engine)) {
    return { success: false, error: "Invalid engine." }
  }
  if (!LANGUAGE_VALUES.has(language)) {
    return { success: false, error: "Invalid language." }
  }

  const lookingFor = rawLookingFor.filter((r) => r.role && r.level)
  if (lookingFor.length < 1) {
    return { success: false, error: "Select at least one role you are looking for." }
  }
  for (const entry of lookingFor) {
    if (!ROLE_VALUES.has(entry.role) || !EXPERIENCE_VALUES.has(entry.level)) {
      return { success: false, error: "Invalid role or experience level in team requirements." }
    }
  }

  const discordLinkValue = (discordLink ?? "").trim()
  if (
    discordLinkValue !== "" &&
    !/^https:\/\/discord\.(gg|com\/invite)\//.test(discordLinkValue)
  ) {
    return { success: false, error: "Please enter a valid Discord invite link." }
  }

  const vibeTrim = rawVibe?.trim() || null
  if (vibeTrim && !JAM_STYLE_VALUES.has(vibeTrim)) {
    return { success: false, error: "Invalid team vibe." }
  }

  const expReq = rawExp?.trim() || null
  const experienceRequired =
    expReq && expReq !== "any" && EXPERIENCE_VALUES.has(expReq) ? expReq : null

  const jamId = (rawJamId == null ? "" : String(rawJamId)).trim() || null

  const jamEndIso = new Date(jamEndDate).toISOString()
  const jamStartIso = new Date(jamStartDate).toISOString()

  const teamData = {
    user_id: user.id,
    team_name: teamName,
    game_name: jamName,
    description: description.trim(),
    engine,
    language,
    looking_for: lookingFor,
    discord_link: discordLinkValue || null,
    team_vibe: vibeTrim,
    experience_required: experienceRequired,
    jam_id: jamId,
    jam_start_date: jamStartIso,
    jam_end_date: jamEndIso,
    expires_at: jamEndIso,
  }

  const { data, error } = await supabase.from("teams").insert([teamData]).select("id").single()

  if (error || !data?.id) {
    return { success: false, error: error?.message ?? "Could not create the team." }
  }

  enqueueSmartMatchEmailsForNewTeam(user.id, teamName, lookingFor)

  const gamification = await awardXP(user.id, "CREATE_TEAM")
  if (!gamification.ok) {
    console.error("[gamification] CREATE_TEAM:", gamification.error)
  }

  return {
    success: true,
    teamId: data.id as string,
    gamification: gamification.ok ? gamification.reward : undefined,
  }
}

export type UpdateTeamJamListingResult =
  | { success: true }
  | { success: false; error: string }

const MISSING_JAM_DATES_MSG =
  "Please specify the Jam dates to keep your team visible."

/**
 * Owner-only update for manage page; requires jam window (legacy rows without dates must set them).
 */
export async function updateTeamJamListing(
  input: UpdateTeamJamListingInput,
): Promise<UpdateTeamJamListingResult> {
  const parsed = updateTeamJamListingSchema.safeParse(input)
  if (!parsed.success) {
    const flat = parsed.error.flatten()
    const fieldMsg = Object.values(flat.fieldErrors).flat().find(Boolean)
    const msg = fieldMsg ?? flat.formErrors[0] ?? "Invalid data."
    return { success: false, error: msg }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "You must be signed in." }
  }

  const {
    teamId,
    teamName,
    gameName,
    description,
    teamVibe: rawVibe,
    experienceRequired: rawExp,
    lookingFor: rawLookingFor,
    jamId: rawJamId,
    jamStartDate,
    jamEndDate,
  } = parsed.data

  const { data: existing, error: fetchError } = await supabase
    .from("teams")
    .select("id, user_id, jam_start_date, jam_end_date")
    .eq("id", teamId)
    .single()

  if (fetchError || !existing) {
    return { success: false, error: "Team not found." }
  }

  if (existing.user_id !== user.id) {
    return { success: false, error: "Only the team owner can update this listing." }
  }

  const row = existing as {
    jam_start_date?: string | null
    jam_end_date?: string | null
  }

  if (row.jam_start_date == null || row.jam_end_date == null) {
    return { success: false, error: MISSING_JAM_DATES_MSG }
  }

  const vibeTrim = rawVibe?.trim() || null
  if (vibeTrim && !JAM_STYLE_VALUES.has(vibeTrim)) {
    return { success: false, error: "Invalid team vibe." }
  }

  const expReq = rawExp?.trim() || null
  const experienceRequired =
    expReq && expReq !== "any" && EXPERIENCE_VALUES.has(expReq) ? expReq : null
  const lookingFor = rawLookingFor.filter((r) => r.role && r.level)
  if (lookingFor.length < 1) {
    return { success: false, error: "Select at least one role you are looking for." }
  }
  for (const entry of lookingFor) {
    if (!ROLE_VALUES.has(entry.role) || !EXPERIENCE_VALUES.has(entry.level)) {
      return { success: false, error: "Invalid role or experience level in team requirements." }
    }
  }

  const jamEndIso = new Date(jamEndDate).toISOString()
  const jamStartIso = new Date(jamStartDate).toISOString()

  const { error: updateError } = await supabase
    .from("teams")
    .update({
      team_name: teamName,
      game_name: gameName,
      description: description.trim(),
      team_vibe: vibeTrim,
      experience_required: experienceRequired,
      looking_for: lookingFor,
      jam_id: rawJamId?.trim() || null,
      jam_start_date: jamStartIso,
      jam_end_date: jamEndIso,
      expires_at: jamEndIso,
    })
    .eq("id", teamId)
    .eq("user_id", user.id)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  return { success: true }
}
