"use server"

import { createClient } from "@/lib/supabase/server"
import { awardXP } from "@/lib/gamification"
import type { GamificationRewardSummary } from "@/lib/gamification-reward-types"
import {
  ENGINE_OPTIONS,
  EXPERIENCE_OPTIONS,
  JAM_STYLE_OPTIONS,
  LANGUAGE_OPTIONS,
  ROLE_OPTIONS,
} from "@/lib/constants"

const ENGINE_VALUES = new Set<string>(ENGINE_OPTIONS.map((o) => o.value))
const LANGUAGE_VALUES = new Set<string>(LANGUAGE_OPTIONS.map((o) => o.value))
const JAM_STYLE_VALUES = new Set<string>(JAM_STYLE_OPTIONS.map((o) => o.value))
const EXPERIENCE_VALUES = new Set<string>(EXPERIENCE_OPTIONS.map((o) => o.value))
const ROLE_VALUES = new Set<string>(ROLE_OPTIONS.map((o) => o.value))

export type CreateTeamLookingForEntry = { role: string; level: string }

export type CreateTeamInput = {
  teamName: string
  jamName: string
  description: string
  engine: string
  language: string
  lookingFor: CreateTeamLookingForEntry[]
  discordLink?: string
  teamVibe?: string | null
  experienceRequired?: string | null
  jamId?: string | null
}

export type CreateTeamResult =
  | { success: true; teamId: string; gamification?: GamificationRewardSummary }
  | { success: false; error: string }

export async function createTeam(input: CreateTeamInput): Promise<CreateTeamResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "You must be signed in to create a team." }
  }

  const teamName = input.teamName?.trim() ?? ""
  const jamName = input.jamName?.trim() ?? ""
  if (!teamName || !jamName) {
    return { success: false, error: "Team name and game jam name are required." }
  }

  const engine = input.engine?.trim() ?? ""
  const language = input.language?.trim() ?? ""
  if (!engine || !language) {
    return { success: false, error: "Engine and language are required." }
  }
  if (!ENGINE_VALUES.has(engine)) {
    return { success: false, error: "Invalid engine." }
  }
  if (!LANGUAGE_VALUES.has(language)) {
    return { success: false, error: "Invalid language." }
  }

  const lookingFor = (input.lookingFor ?? []).filter((r) => r.role && r.level)
  if (lookingFor.length < 1) {
    return { success: false, error: "Select at least one role you are looking for." }
  }
  for (const entry of lookingFor) {
    if (!ROLE_VALUES.has(entry.role) || !EXPERIENCE_VALUES.has(entry.level)) {
      return { success: false, error: "Invalid role or experience level in team requirements." }
    }
  }

  const discordLinkValue = (input.discordLink ?? "").trim()
  if (
    discordLinkValue !== "" &&
    !/^https:\/\/discord\.(gg|com\/invite)\//.test(discordLinkValue)
  ) {
    return { success: false, error: "Please enter a valid Discord invite link." }
  }

  const teamVibe = input.teamVibe?.trim() || null
  if (teamVibe && !JAM_STYLE_VALUES.has(teamVibe)) {
    return { success: false, error: "Invalid team vibe." }
  }

  const expReq = input.experienceRequired?.trim() || null
  const experienceRequired =
    expReq && expReq !== "any" && EXPERIENCE_VALUES.has(expReq) ? expReq : null

  const jamId = input.jamId?.trim() || null

  const teamData = {
    user_id: user.id,
    team_name: teamName,
    game_name: jamName,
    description: (input.description ?? "").trim(),
    engine,
    language,
    looking_for: lookingFor,
    discord_link: discordLinkValue || null,
    team_vibe: teamVibe,
    experience_required: experienceRequired,
    jam_id: jamId,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }

  const { data, error } = await supabase.from("teams").insert([teamData]).select("id").single()

  if (error || !data?.id) {
    return { success: false, error: error?.message ?? "Could not create the team." }
  }

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
