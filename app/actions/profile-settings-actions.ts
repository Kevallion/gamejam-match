"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { parseProgrammingLanguages } from "@/lib/constants"
import { isMissingColumnError } from "@/lib/optional-column"
import { upsertOwnDiscordUsername } from "@/lib/profile-discord"
import {
  saveProfileSettingsSchema,
  type SaveProfileSettingsInput,
} from "@/lib/profile-settings-schema"

export type SaveProfileSettingsResult =
  | { success: true; programmingLanguagesSaved?: boolean }
  | {
      success: false
      error: string
      code?: "UNAUTHORIZED" | "INVALID_INPUT" | "USERNAME_TAKEN" | "UNKNOWN"
      fieldErrors?: Record<string, string>
    }

function toFieldErrorMap(
  issues: Array<{ path: readonly PropertyKey[]; message: string }>,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of issues) {
    const key = issue.path
      .map((part) => (typeof part === "number" ? String(part) : String(part)))
      .join(".")
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message
    }
  }
  return fieldErrors
}

function normalizeText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? ""
  return trimmed ? trimmed : null
}

function normalizePortfolioUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? ""
  if (!trimmed) return null
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }
  return `https://${trimmed}`
}

function normalizeRolePayload(input: SaveProfileSettingsInput["roles"]) {
  if (input.length === 0) return []
  const primary = input.find((role) => role.isPrimary)
  if (!primary) return []
  const secondary = input.find((role) => role.role !== primary.role)
  const normalized = [
    { role: primary.role, experience_level: primary.experienceLevel, is_primary: true },
  ]
  if (secondary) {
    normalized.push({
      role: secondary.role,
      experience_level: secondary.experienceLevel,
      is_primary: false,
    })
  }
  return normalized
}

type ProfileRoleRow = ReturnType<typeof normalizeRolePayload>[number]

/** PostgREST error when the called function is not in the schema cache yet. */
function isMissingRpcError(
  error: { code?: string | null; message?: string | null } | null | undefined,
  functionName: string,
): boolean {
  if (!error) return false
  const code = (error.code ?? "").toUpperCase()
  const message = (error.message ?? "").toLowerCase()
  return (
    code === "PGRST202" ||
    (code === "42883" && message.includes(functionName.toLowerCase()))
  )
}

async function replaceRolesLegacy(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  profileRoles: ProfileRoleRow[],
): Promise<string | null> {
  const { error: deleteRolesError } = await supabase
    .from("profile_roles")
    .delete()
    .eq("user_id", userId)
  if (deleteRolesError) return deleteRolesError.message

  if (profileRoles.length > 0) {
    const { error: insertRolesError } = await supabase.from("profile_roles").insert(
      profileRoles.map((role) => ({
        user_id: userId,
        role: role.role,
        experience_level: role.experience_level,
        is_primary: role.is_primary,
      })),
    )
    if (insertRolesError) return insertRolesError.message
  }
  return null
}

export async function saveProfileSettings(
  input: SaveProfileSettingsInput,
): Promise<SaveProfileSettingsResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "You must be signed in.", code: "UNAUTHORIZED" }
  }

  const parsed = saveProfileSettingsSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: "Please check your profile settings.",
      code: "INVALID_INPUT",
      fieldErrors: toFieldErrorMap(parsed.error.issues),
    }
  }

  const payload = parsed.data
  const profileRoles = normalizeRolePayload(payload.roles)
  const primaryRole = profileRoles.find((role) => role.is_primary)?.role ?? null
  const primaryExperienceLevel =
    profileRoles.find((role) => role.is_primary)?.experience_level ?? null

  // One RPC = one transaction: concurrent saves (two tabs) are serialized server-side and can
  // never leave the jammer with no roles. See supabase/migrations/*_profile_roles_atomic_replace.sql.
  const { error: replaceRolesError } = await supabase.rpc("replace_own_profile_roles", {
    p_roles: profileRoles,
  })

  if (replaceRolesError) {
    if (!isMissingRpcError(replaceRolesError, "replace_own_profile_roles")) {
      return { success: false, error: replaceRolesError.message, code: "UNKNOWN" }
    }
    // Deploy-before-migration fallback: keep saving with the legacy (non-atomic) path until
    // the migration is applied. Remove once the RPC exists in every environment.
    const legacyError = await replaceRolesLegacy(supabase, user.id, profileRoles)
    if (legacyError) {
      return { success: false, error: legacyError, code: "UNKNOWN" }
    }
  }

  const normalizedPortfolioUrl = normalizePortfolioUrl(payload.portfolioUrl)
  const programmingLanguages = parseProgrammingLanguages(payload.programmingLanguages ?? [])

  const profilePatch = {
    username: payload.username.trim(),
    discord_username: normalizeText(payload.discordUsername),
    default_role: primaryRole,
    main_role: primaryRole,
    role: primaryRole,
    experience_level: primaryExperienceLevel,
    experience: primaryExperienceLevel,
    default_engine: normalizeText(payload.defaultEngine),
    default_language: normalizeText(payload.defaultLanguage),
    portfolio_url: normalizedPortfolioUrl,
    portfolio_link: normalizedPortfolioUrl,
    jam_style: normalizeText(payload.jamStyle),
  }

  let programmingLanguagesSaved = true
  let { error: profileError } = await supabase
    .from("profiles")
    .update({
      ...profilePatch,
      programming_languages: programmingLanguages,
    })
    .eq("id", user.id)

  if (profileError && isMissingColumnError(profileError, "programming_languages")) {
    programmingLanguagesSaved = false
    const retry = await supabase.from("profiles").update(profilePatch).eq("id", user.id)
    profileError = retry.error
  }

  if (profileError) {
    if (profileError.code === "23505") {
      return {
        success: false,
        error: "This username is already taken. Please choose another one.",
        code: "USERNAME_TAKEN",
      }
    }
    return { success: false, error: profileError.message, code: "UNKNOWN" }
  }

  await upsertOwnDiscordUsername(supabase, user.id, normalizeText(payload.discordUsername))

  return { success: true, programmingLanguagesSaved }
}

export type SetDirectoryVisibilityResult =
  | { success: true; visible: boolean }
  | { success: false; error: string; code: "UNAUTHORIZED" | "INVALID_INPUT" | "UNKNOWN" }

/**
 * DIR-1: lets the signed-in user show or hide their own profile in the members
 * directory (profiles.directory_visible). Only the caller's row is updated
 * (.eq("id", user.id), and RLS "profiles_update_own" checks auth.uid() = id).
 */
export async function setDirectoryVisibility(
  visible: boolean,
): Promise<SetDirectoryVisibilityResult> {
  if (typeof visible !== "boolean") {
    return { success: false, error: "Invalid visibility value.", code: "INVALID_INPUT" }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "You must be signed in.", code: "UNAUTHORIZED" }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ directory_visible: visible })
    .eq("id", user.id)

  if (error) {
    return { success: false, error: error.message, code: "UNKNOWN" }
  }

  revalidatePath("/find-members")
  return { success: true, visible }
}
