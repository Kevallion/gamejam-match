/** DB values for `kudos.category` — keep in sync with migration CHECK constraint. */
export const KUDOS_CATEGORIES = ["Technical", "Artistic", "Leadership", "Friendly"] as const

export type KudosCategoryDb = (typeof KUDOS_CATEGORIES)[number]

export type KudosCounts = Partial<Record<KudosCategoryDb, number>>

export const KUDOS_CATEGORY_ORDER: KudosCategoryDb[] = [...KUDOS_CATEGORIES]

/** UI labels (DB category → display). */
export const KUDOS_CATEGORY_UI: Record<
  KudosCategoryDb,
  { label: string; emoji: string }
> = {
  Technical: { label: "Technical", emoji: "💻" },
  Artistic: { label: "Creative", emoji: "🎨" },
  Leadership: { label: "Leadership", emoji: "👑" },
  Friendly: { label: "Great Vibe", emoji: "🌟" },
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
