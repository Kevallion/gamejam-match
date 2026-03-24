import { z } from "zod"

const isoTimestamp = z
  .string()
  .trim()
  .min(1)
  .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date.")

const createTeamLookingForSchema = z.object({
  role: z.string(),
  level: z.string(),
})

/** Zod schema for team creation (jam dates required). Not in a "use server" file — Next.js forbids exporting objects from those. */
export const createTeamFormSchema = z
  .object({
    teamName: z.string().trim().min(1, "Team name is required."),
    jamName: z.string().trim().min(1, "Game jam name is required."),
    description: z.string(),
    engine: z.string(),
    language: z.string(),
    lookingFor: z.array(createTeamLookingForSchema).min(1, "Select at least one role."),
    discordLink: z.string().optional(),
    teamVibe: z.string().nullable().optional(),
    experienceRequired: z.string().nullable().optional(),
    jamId: z
      .preprocess(
        (v) => (v === "" || v === undefined ? null : v),
        z.union([z.string().uuid(), z.null()]),
      )
      .optional(),
    jamStartDate: isoTimestamp,
    jamEndDate: isoTimestamp,
  })
  .refine(
    (data) => new Date(data.jamStartDate).getTime() < new Date(data.jamEndDate).getTime(),
    { message: "Jam start must be before jam end.", path: ["jamEndDate"] },
  )

export type CreateTeamLookingForEntry = { role: string; level: string }

export type CreateTeamInput = z.infer<typeof createTeamFormSchema>

export const updateTeamJamListingSchema = z
  .object({
    teamId: z.string().uuid(),
    teamName: z.string().trim().min(1),
    gameName: z.string().trim().min(1),
    description: z.string(),
    teamVibe: z.string().nullable().optional(),
    experienceRequired: z.string().nullable().optional(),
    jamId: z
      .preprocess(
        (v) => (v === "" || v === undefined ? null : v),
        z.string().uuid().nullable(),
      )
      .optional(),
    jamStartDate: isoTimestamp,
    jamEndDate: isoTimestamp,
  })
  .refine(
    (data) => new Date(data.jamStartDate).getTime() < new Date(data.jamEndDate).getTime(),
    { message: "Jam start must be before jam end.", path: ["jamEndDate"] },
  )

export type UpdateTeamJamListingInput = z.infer<typeof updateTeamJamListingSchema>
