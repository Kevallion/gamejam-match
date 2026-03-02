const BG = "d1d4f9"
const STYLES = ["adventurer", "lorelei", "avataaars"] as const
const API = "https://api.dicebear.com/9.x"

/** Generates random avatars (for the Shuffle button) */
export function getRandomAvatarGallery(count = 20): { id: string; url: string }[] {
  const result: { id: string; url: string }[] = []
  for (let i = 0; i < count; i++) {
    const style = STYLES[i % STYLES.length]
    const seed = crypto.randomUUID?.() ?? `rand-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`
    const id = `rand-${i}-${seed.slice(0, 8)}`
    result.push({ id, url: `${API}/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${BG}` })
  }
  return result
}

/**
 * Predefined avatar gallery (DiceBear, CC0 license)
 * Styles used: adventurer, lorelei, avataaars
 */
export const AVATAR_GALLERY = [
  { id: "adv-1", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=1&backgroundColor=d1d4f9" },
  { id: "adv-2", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=2&backgroundColor=d1d4f9" },
  { id: "adv-3", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=3&backgroundColor=d1d4f9" },
  { id: "adv-4", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=4&backgroundColor=d1d4f9" },
  { id: "adv-5", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=5&backgroundColor=d1d4f9" },
  { id: "adv-6", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=6&backgroundColor=d1d4f9" },
  { id: "adv-7", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=7&backgroundColor=d1d4f9" },
  { id: "adv-8", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=8&backgroundColor=d1d4f9" },
  { id: "adv-9", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=9&backgroundColor=d1d4f9" },
  { id: "adv-cat", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=cat&backgroundColor=d1d4f9" },
  { id: "adv-dog", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=dog&backgroundColor=d1d4f9" },
  { id: "adv-gamer", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=gamer&backgroundColor=d1d4f9" },
  { id: "adv-jam", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=jam&backgroundColor=d1d4f9" },
  { id: "lorelei-1", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=1&backgroundColor=d1d4f9" },
  { id: "lorelei-2", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=2&backgroundColor=d1d4f9" },
  { id: "lorelei-3", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=3&backgroundColor=d1d4f9" },
  { id: "avataaars-1", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=1&backgroundColor=d1d4f9" },
  { id: "avataaars-2", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=2&backgroundColor=d1d4f9" },
  { id: "avataaars-3", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=3&backgroundColor=d1d4f9" },
] as const
