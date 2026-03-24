import { ROLE_STYLES } from "@/lib/constants"
import { notifySmartMatch } from "@/lib/mail"
import { createAdminClient, getUserEmail } from "@/lib/supabase/admin"

/** One slot from `teams.looking_for` (équivalent produit des rôles recherchés). */
export type TeamLookingForRoleEntry = { role: string; level?: string }

type SmartMatchProfileRow = {
  id: string
  username: string | null
  main_role: string | null
  default_role: string | null
  role: string | null
}

function requiredRoleKeysFromLookingFor(
  lookingFor: TeamLookingForRoleEntry[],
): Set<string> {
  return new Set(
    lookingFor.map((e) => e.role.trim().toLowerCase()).filter(Boolean),
  )
}

/** Rôle effectif du profil : `main_role` puis `default_role` puis `role`. */
function effectiveProfileRoleKey(p: {
  main_role?: string | null
  default_role?: string | null
  role?: string | null
}): string {
  const main = (p.main_role ?? "").toString().trim().toLowerCase()
  if (main) return main
  const d = (p.default_role ?? "").toString().trim().toLowerCase()
  if (d) return d
  return (p.role ?? "").toString().trim().toLowerCase()
}

function safeRoleStyleLabel(roleKey: string): string {
  try {
    const k = (roleKey ?? "").toString().trim().toLowerCase()
    if (!k) return ""
    const entry = ROLE_STYLES[k]
    const label =
      entry && typeof entry.label === "string" ? entry.label.trim() : ""
    return label || k
  } catch {
    return (roleKey ?? "").toString().trim() || ""
  }
}

function matchingRoleLabelForEmail(
  row: SmartMatchProfileRow,
  requiredSet: Set<string>,
  lookingFor: TeamLookingForRoleEntry[],
): string {
  try {
    const eff = effectiveProfileRoleKey(row)
    const fromProfile = safeRoleStyleLabel(eff)
    if (fromProfile) return fromProfile

    for (const key of requiredSet) {
      const lab = safeRoleStyleLabel(key)
      if (lab) return lab
    }

    const first = lookingFor[0]
    const lf = first?.role?.trim().toLowerCase() ?? ""
    if (lf && first) {
      const fromLf = safeRoleStyleLabel(lf)
      return (fromLf || first.role.trim()).trim() || "new member"
    }

    return "new member"
  } catch {
    return "new member"
  }
}

const PROFILE_SELECT =
  "id, username, main_role, default_role, role" as const

async function sendSmartMatchEmailsForNewTeam(
  ownerUserId: string,
  teamName: string,
  lookingFor: TeamLookingForRoleEntry[],
): Promise<void> {
  const requiredSet = requiredRoleKeysFromLookingFor(lookingFor)
  if (requiredSet.size === 0) return

  const keys = Array.from(requiredSet)
  const admin = createAdminClient()
  const merged = new Map<string, SmartMatchProfileRow>()

  try {
    const { data: byMain, error: errMain } = await admin
      .from("profiles")
      .select(PROFILE_SELECT)
      .in("main_role", keys)

    if (errMain) {
      console.error(
        "[smart-match-email] Supabase profiles query (.in main_role) failed:",
        errMain,
      )
      return
    }

    const { data: byDefault, error: errDefault } = await admin
      .from("profiles")
      .select(PROFILE_SELECT)
      .in("default_role", keys)

    if (errDefault) {
      console.error(
        "[smart-match-email] Supabase profiles query (.in default_role) failed:",
        errDefault,
      )
      return
    }

    const { data: byRole, error: errRole } = await admin
      .from("profiles")
      .select(PROFILE_SELECT)
      .in("role", keys)

    if (errRole) {
      console.error(
        "[smart-match-email] Supabase profiles query (.in role) failed:",
        errRole,
      )
      return
    }

    for (const row of [
      ...(byMain ?? []),
      ...(byDefault ?? []),
      ...(byRole ?? []),
    ]) {
      const id = row.id as string | undefined
      if (!id) continue
      merged.set(id, row as SmartMatchProfileRow)
    }
  } catch (err) {
    console.error("[smart-match-email] Supabase profiles fetch threw:", err)
    return
  }

  const emailedUserIds = new Set<string>()

  for (const row of merged.values()) {
    if (row.id === ownerUserId) continue
    if (emailedUserIds.has(row.id)) continue

    const eff = effectiveProfileRoleKey(row)
    if (!requiredSet.has(eff)) continue

    const matchingRoleLabel = matchingRoleLabelForEmail(
      row,
      requiredSet,
      lookingFor,
    )

    let email: string | null = null
    try {
      email = await getUserEmail(row.id)
    } catch {
      continue
    }
    if (!email) continue

    const displayName = (row.username ?? "").trim() || "there"

    try {
      await notifySmartMatch(email, displayName, teamName, matchingRoleLabel)
      emailedUserIds.add(row.id)
    } catch (err) {
      console.error(
        "[smart-match-email] notifySmartMatch failed for user",
        row.id,
        err,
      )
    }
  }
}

/**
 * Après création d’équipe : envoie les e-mails smart match sans bloquer la réponse (fire-and-forget).
 */
export function enqueueSmartMatchEmailsForNewTeam(
  ownerUserId: string,
  teamName: string,
  lookingFor: TeamLookingForRoleEntry[],
): void {
  void (async () => {
    try {
      await sendSmartMatchEmailsForNewTeam(ownerUserId, teamName, lookingFor)
    } catch {
      /* best-effort */
    }
  })()
}
