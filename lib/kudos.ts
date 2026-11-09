import { KUDOS_ICON } from "@/lib/icons"
import type { LucideIcon } from "lucide-react"

/** DB values for `kudos.category` — keep in sync with migration CHECK constraint. */
export const KUDOS_CATEGORIES = ["Technical", "Artistic", "Leadership", "Friendly"] as const

export type KudosCategoryDb = (typeof KUDOS_CATEGORIES)[number]

export type KudosCounts = Partial<Record<KudosCategoryDb, number>>

export const KUDOS_CATEGORY_ORDER: KudosCategoryDb[] = [...KUDOS_CATEGORIES]

/** UI labels (DB category → display). Icons live in `KUDOS_ICON`. */
export const KUDOS_CATEGORY_UI: Record<KudosCategoryDb, { label: string; icon: LucideIcon }> = {
  Technical: { label: "Technical", icon: KUDOS_ICON.Technical },
  Artistic: { label: "Creative", icon: KUDOS_ICON.Artistic },
  Leadership: { label: "Leadership", icon: KUDOS_ICON.Leadership },
  Friendly: { label: "Great Vibe", icon: KUDOS_ICON.Friendly },
}

export function isKudosCategoryDb(v: string): v is KudosCategoryDb {
  return (KUDOS_CATEGORIES as readonly string[]).includes(v)
}

export type KudosCountRow = {
  receiver_id: string
  category: string
  cnt: number | string
}

/** Merge RPC rows into per-user count maps. */
export function kudosCountsMapFromRpcRows(rows: KudosCountRow[] | null | undefined): Map<string, KudosCounts> {
  const map = new Map<string, KudosCounts>()
  if (!rows?.length) return map
  for (const r of rows) {
    if (!r.receiver_id || !isKudosCategoryDb(r.category)) continue
    const n = typeof r.cnt === "string" ? Number(r.cnt) : r.cnt
    if (!Number.isFinite(n) || n < 0) continue
    const prev = map.get(r.receiver_id) ?? {}
    prev[r.category] = Math.floor(n)
    map.set(r.receiver_id, prev)
  }
  return map
}
