import { z } from "zod"
import { EXPERIENCE_OPTIONS, JAM_STYLE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants"

const ROLE_VALUES = ROLE_OPTIONS.map((option) => option.value)
const EXPERIENCE_VALUES = EXPERIENCE_OPTIONS.map((option) => option.value)
const JAM_STYLE_VALUES = JAM_STYLE_OPTIONS.map((option) => option.value)

const profileRoleSchema = z.object({
  role: z.enum(ROLE_VALUES as [string, ...string[]]),
  experienceLevel: z.enum(EXPERIENCE_VALUES as [string, ...string[]]),
  isPrimary: z.boolean(),
})

export const saveProfileSettingsSchema = z
  .object({
    username: z.string().trim().min(3, "Username must be at least 3 characters long."),
    discordUsername: z.string().trim().max(100).nullable().optional(),
    defaultEngine: z.string().trim().max(100).nullable().optional(),
    defaultLanguage: z.string().trim().max(100).nullable().optional(),
    portfolioUrl: z.string().trim().max(500).nullable().optional(),
    jamStyle: z.enum(JAM_STYLE_VALUES as [string, ...string[]]).nullable().optional(),
    roles: z.array(profileRoleSchema).max(2, "You can only keep up to 2 roles."),
  })
  .superRefine((value, ctx) => {
    const dedup = new Set<string>()
    value.roles.forEach((role, index) => {
      if (dedup.has(role.role)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["roles", index, "role"],
          message: "Roles must be different.",
        })
      }
      dedup.add(role.role)
    })

    if (value.roles.length === 0) {
      return
    }

    const primaryCount = value.roles.filter((role) => role.isPrimary).length
    if (primaryCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["roles"],
        message: "Exactly one primary role is required when roles are set.",
      })
    }
  })

export type SaveProfileSettingsInput = z.infer<typeof saveProfileSettingsSchema>
