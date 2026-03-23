import { supabase } from "@/lib/supabase"
import { ENGINE_OPTIONS, ROLE_STYLES } from "@/lib/constants"

const SMART_MATCH_FETCH_LIMIT = 80
const SMART_MATCH_RESULT_CAP = 3

/**
 * Profil minimal pour le smart matchmaking côté client.
 * `main_role` est prévu pour une évolution du schéma ; aujourd’hui on utilise surtout `default_role`.
 */
export type SmartMatchUserProfile = {
  id: string
  main_role?: string | null
  default_role?: string | null
  /** Préférence moteur : aligner sur le profil (`default_engine` ou colonne `engine` si défaut vide). */
  default_engine?: string | null
  profile_engine?: string | null
  /** Équipes déjà possédées ou rejointes — à exclure des suggestions. */
  excludeTeamIds?: string[]
}

export type SmartRecommendedTeam = {
  id: string
  team_name: string
  matched_role: string
  role_label: string
  /** Moteur indiqué sur l’annonce d’équipe (`teams.engine`). */
  team_engine_label: string
  /** Vrai seulement si le moteur du profil et celui de l’annonce sont identiques (hors « any » / vide). */
  matches_your_engine: boolean
}

type TeamMatchRow = {
  id: string
  user_id: string
  team_name: string | null
  engine: string | null
  looking_for: unknown
  created_at: string | null
  expires_at: string | null
}

function norm(s: string | null | undefined): string {
  return (s ?? "").trim()
}

function parseRequiredRolesFromLookingFor(lookingFor: unknown): string[] {
  type Entry = { role?: string | null }
  let parsed: Entry[] = []
  try {
    parsed = Array.isArray(lookingFor)
      ? (lookingFor as Entry[])
      : (JSON.parse(typeof lookingFor === "string" ? lookingFor : "[]") as Entry[])
  } catch {
    return []
  }
  return parsed.map((e) => norm(e.role).toLowerCase()).filter(Boolean)
}

/** Rôles recherchés : équivalent produit de `required_roles` (à brancher en SQL si la colonne est ajoutée). */
function requiredRolesForTeam(row: TeamMatchRow): string[] {
  return parseRequiredRolesFromLookingFor(row.looking_for)
}

/** En recrutement : annonce active (`expires_at` > maintenant). Avec une colonne `status`, filtrer `recruiting` ici. */
function isRecruitingTeam(row: TeamMatchRow): boolean {
  const exp = row.expires_at
  if (!exp) return false
  return new Date(exp).getTime() > Date.now()
}

function resolvedUserEngine(p: SmartMatchUserProfile): string {
  const d = norm(p.default_engine).toLowerCase()
  if (d && d !== "any") return d
  const e = norm(p.profile_engine).toLowerCase()
  return e
}

/** Priorité : même moteur que la préférence profil (hors « any » / vide). */
function engineBoost(userEngineKey: string, teamEngine: string | null | undefined): number {
  const ue = userEngineKey
  const te = norm(teamEngine).toLowerCase()
  if (!ue || ue === "any" || !te || te === "any") return 0
  return ue === te ? 1 : 0
}

/** Affichage « même moteur que moi » : uniquement si les deux valeurs sont précises et égales. */
function enginesMatchProfileDisplay(
  userEngineKey: string,
  teamEngine: string | null | undefined,
): boolean {
  const ue = userEngineKey
  const te = norm(teamEngine).toLowerCase()
  if (!ue || ue === "any" || !te || te === "any") return false
  return ue === te
}

function roleLabel(roleKey: string): string {
  return ROLE_STYLES[roleKey]?.label ?? roleKey
}

function engineLabel(engineValue: string): string {
  const v = norm(engineValue).toLowerCase()
  const opt = ENGINE_OPTIONS.find((o) => o.value === v)
  return opt?.label ?? (norm(engineValue) || "their stack")
}

/**
 * Équipes en recrutement : annonce active (`expires_at`), optionnellement `status = 'recruiting'` si la colonne est peuplée,
 * et rôle du joueur présent dans `required_roles` ou dans les `role` de `looking_for`.
 * Classement : boost si `default_engine` aligné avec `teams.engine`, puis plus récent d’abord.
 */
export async function getRecommendedTeams(
  userProfile: SmartMatchUserProfile,
): Promise<{ teams: SmartRecommendedTeam[]; error: string | null }> {
  const roleKey = norm(userProfile.main_role ?? userProfile.default_role).toLowerCase()
  if (!roleKey) {
    return { teams: [], error: null }
  }

  const exclude = new Set((userProfile.excludeTeamIds ?? []).filter(Boolean))
  const userEngineKey = resolvedUserEngine(userProfile)

  const { data, error } = await supabase
    .from("teams")
    .select("id, user_id, team_name, engine, looking_for, created_at, expires_at")
    .gt("expires_at", new Date().toISOString())
    .neq("user_id", userProfile.id)
    .order("created_at", { ascending: false })
    .limit(SMART_MATCH_FETCH_LIMIT)

  if (error) {
    console.error("[getRecommendedTeams]", error.message)
    return { teams: [], error: error.message }
  }

  const candidates: TeamMatchRow[] = []
  for (const row of (data ?? []) as TeamMatchRow[]) {
    if (exclude.has(row.id)) continue
    if (!isRecruitingTeam(row)) continue
    const needed = requiredRolesForTeam(row)
    if (!needed.includes(roleKey)) continue
    candidates.push(row)
  }

  candidates.sort((a, b) => {
    const boostDiff = engineBoost(userEngineKey, b.engine) - engineBoost(userEngineKey, a.engine)
    if (boostDiff !== 0) return boostDiff
    const tb = new Date(b.created_at ?? 0).getTime()
    const ta = new Date(a.created_at ?? 0).getTime()
    return tb - ta
  })

  const teams: SmartRecommendedTeam[] = candidates.slice(0, SMART_MATCH_RESULT_CAP).map((row) => ({
    id: row.id,
    team_name: norm(row.team_name) || "Unnamed squad",
    matched_role: roleKey,
    role_label: roleLabel(roleKey),
    team_engine_label: engineLabel(row.engine ?? ""),
    matches_your_engine: enginesMatchProfileDisplay(userEngineKey, row.engine),
  }))

  return { teams, error: null }
}
