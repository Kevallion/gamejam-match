"use server"

import { createClient } from "@/lib/supabase/server"
import { awardXP } from "@/lib/gamification"
import type { GamificationRewardSummary } from "@/lib/gamification-reward-types"
import { defaultTeamExpiresAtIso, normalizeJamListingDates } from "@/lib/jam-listing-dates"
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
import { sendTeamCreationFollowUp } from "@/lib/mail"

const ENGINE_VALUES = new Set<string>(ENGINE_OPTIONS.map((o) => o.value))
const LANGUAGE_VALUES = new Set<string>(LANGUAGE_OPTIONS.map((o) => o.value))
const JAM_STYLE_VALUES = new Set<string>(JAM_STYLE_OPTIONS.map((o) => o.value))
const EXPERIENCE_VALUES = new Set<string>(EXPERIENCE_OPTIONS.map((o) => o.value))
const ROLE_VALUES = new Set<string>(ROLE_OPTIONS.map((o) => o.value))

function lookingForRequirementError(raw: { role?: string; level?: string }[]): string | null {
  const named = raw.filter((entry) => entry.role?.trim())
  const complete = raw.filter((entry) => entry.role?.trim() && entry.level?.trim())
  if (named.length > 0 && complete.length < named.length) {
    return "Please select an experience level for each role you are looking for."
  }
  if (complete.length < 1) {
    return "Select at least one role you are looking for."
  }
  return null
}

function resolvedJamDates(input: { jamStartDate?: string | null; jamEndDate?: string | null }) {
  const result = normalizeJamListingDates(input)
  if (!result.ok) {
    return { ok: false as const, error: result.error }
  }
  return {
    ok: true as const,
    jamStartIso: result.start,
    jamEndIso: result.end,
    expiresAt: defaultTeamExpiresAtIso(result.end),
  }
}

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

  const lookingForError = lookingForRequirementError(rawLookingFor)
  if (lookingForError) {
    return { success: false, error: lookingForError }
  }
  const lookingFor = rawLookingFor.filter((r) => r.role && r.level)
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

  const jamDates = resolvedJamDates({ jamStartDate, jamEndDate })
  if (!jamDates.ok) {
    return { success: false, error: jamDates.error }
  }

  const { sanitizeJamDisplayName } = await import("@/lib/teams-public")
  const safeJamName = sanitizeJamDisplayName(jamName) || jamName.trim()

  // Generate the id here and insert without .select().
  // S7 revoked table-level SELECT and SELECT(discord_link). PostgREST
  // insert().select() uses Prefer: return=representation (RETURNING *),
  // which fails with 42501 and rolls back the new row.
  const teamId = crypto.randomUUID()
  const teamData = {
    id: teamId,
    user_id: user.id,
    team_name: teamName,
    game_name: safeJamName,
    description: description.trim(),
    engine,
    language,
    looking_for: lookingFor,
    team_vibe: vibeTrim,
    experience_required: experienceRequired,
    jam_id: jamId,
    jam_start_date: jamDates.jamStartIso,
    jam_end_date: jamDates.jamEndIso,
    expires_at: jamDates.expiresAt,
  }

  const { error } = await supabase.from("teams").insert([teamData])

  if (error) {
    return { success: false, error: error.message ?? "Could not create the squad." }
  }

  if (discordLinkValue) {
    const { upsertTeamDiscordLink } = await import("@/lib/team-discord")
    const { error: discordError } = await upsertTeamDiscordLink(
      supabase,
      teamId,
      discordLinkValue,
    )
    if (discordError) {
      console.error("[createTeam] discord link upsert failed:", discordError)
    }
  }

  // Best-effort transactional follow-up (doesn't block team creation).
  if (user.email) {
    try {
      await sendTeamCreationFollowUp(user.email, teamName, teamId, user.id)
    } catch {
      // Silent: email issues shouldn't block the primary flow.
    }
  }

  enqueueSmartMatchEmailsForNewTeam(user.id, teamName, lookingFor)

  const gamification = await awardXP(user.id, "CREATE_TEAM")
  if (!gamification.ok) {
    console.error("[gamification] CREATE_TEAM:", gamification.error)
  }

  return {
    success: true,
    teamId: teamId,
    gamification: gamification.ok ? gamification.reward : undefined,
  }
}

export type UpdateTeamJamListingResult =
  | { success: true }
  | { success: false; error: string }

/**
 * Owner-only update for manage page. Jam dates stay optional (both or neither).
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
    return { success: false, error: "Only the squad owner can update this listing." }
  }

  const vibeTrim = rawVibe?.trim() || null
  if (vibeTrim && !JAM_STYLE_VALUES.has(vibeTrim)) {
    return { success: false, error: "Invalid team vibe." }
  }

  const expReq = rawExp?.trim() || null
  const experienceRequired =
    expReq && expReq !== "any" && EXPERIENCE_VALUES.has(expReq) ? expReq : null
  const lookingForError = lookingForRequirementError(rawLookingFor)
  if (lookingForError) {
    return { success: false, error: lookingForError }
  }
  const lookingFor = rawLookingFor.filter((r) => r.role && r.level)
  for (const entry of lookingFor) {
    if (!ROLE_VALUES.has(entry.role) || !EXPERIENCE_VALUES.has(entry.level)) {
      return { success: false, error: "Invalid role or experience level in team requirements." }
    }
  }

  const jamDates = resolvedJamDates({ jamStartDate, jamEndDate })
  if (!jamDates.ok) {
    return { success: false, error: jamDates.error }
  }

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
      jam_start_date: jamDates.jamStartIso,
      jam_end_date: jamDates.jamEndIso,
      expires_at: jamDates.expiresAt,
    })
    .eq("id", teamId)
    .eq("user_id", user.id)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  return { success: true }
}
