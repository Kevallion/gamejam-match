type LevelUpListener = (level: number) => void

const listeners = new Set<LevelUpListener>()
let lastAnnouncement: { level: number; at: number } | null = null

/** One celebration per level-up event. Ignores a duplicate burst of the same level. */
export function announceLevelUp(level: number): void {
  if (!Number.isFinite(level) || level < 1) return
  const rounded = Math.floor(level)
  const now = Date.now()
  if (lastAnnouncement && lastAnnouncement.level === rounded && now - lastAnnouncement.at < 1500) {
    return
  }
  lastAnnouncement = { level: rounded, at: now }
  for (const listener of listeners) listener(rounded)
}

export function subscribeLevelUp(listener: LevelUpListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
