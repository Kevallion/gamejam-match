import { z } from "zod"
import { normalizeJamListingDates } from "@/lib/jam-listing-dates"

const isoTimestamp = z
  .string()
  .trim()
  .min(1)
  .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date.")

/** Empty, null, or omitted dates become undefined so a squad can be published without a jam window. */
const optionalIsoTimestamp = z.preprocess(
  (v) => (v == null || (typeof v === "string" && v.trim() === "") ? undefined : v),
  isoTimestamp.optional(),
)

const createTeamLookingForSchema = z.object({
  role: z.string(),
  level: z.string(),
})

function refineJamListingDates(
  data: { jamStartDate?: string; jamEndDate?: string },
  ctx: z.RefinementCtx,
) {
  const result = normalizeJamListingDates(data)
  if (!result.ok) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: result.error,
      path: [result.path],
    })
  }
}

/** Zod schema for team creation (jam dates optional). Not in a "use server" file — Next.js forbids exporting objects from those. */
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
    jamStartDate: optionalIsoTimestamp,
    jamEndDate: optionalIsoTimestamp,
  })
  .superRefine(refineJamListingDates)

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
    lookingFor: z.array(createTeamLookingForSchema).min(1, "Select at least one role."),
    jamId: z
      .preprocess(
        (v) => (v === "" || v === undefined ? null : v),
        z.string().uuid().nullable(),
      )
      .optional(),
    jamStartDate: optionalIsoTimestamp,
    jamEndDate: optionalIsoTimestamp,
  })
  .superRefine(refineJamListingDates)

export type UpdateTeamJamListingInput = z.infer<typeof updateTeamJamListingSchema>
