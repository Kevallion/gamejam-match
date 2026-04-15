"use server"

import { createClient } from "@/lib/supabase/server"
import {
  saveProfileSettingsSchema,
  type SaveProfileSettingsInput,
} from "@/lib/profile-settings-schema"

export type SaveProfileSettingsResult =
  | { success: true }
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

  const { error: deleteRolesError } = await supabase
    .from("profile_roles")
    .delete()
    .eq("user_id", user.id)

  if (deleteRolesError) {
    return { success: false, error: deleteRolesError.message, code: "UNKNOWN" }
  }

  if (profileRoles.length > 0) {
    const { error: insertRolesError } = await supabase.from("profile_roles").insert(
      profileRoles.map((role) => ({
        user_id: user.id,
        role: role.role,
        experience_level: role.experience_level,
        is_primary: role.is_primary,
      })),
    )
    if (insertRolesError) {
      return { success: false, error: insertRolesError.message, code: "UNKNOWN" }
    }
  }

  const normalizedPortfolioUrl = normalizePortfolioUrl(payload.portfolioUrl)

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
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
    })
    .eq("id", user.id)

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

  return { success: true }
}
