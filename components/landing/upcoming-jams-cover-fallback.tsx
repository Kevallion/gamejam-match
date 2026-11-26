import { AppIcon } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"

const COVER_PALETTES = [
  { from: "var(--teal)", to: "var(--lavender)" },
  { from: "var(--lavender)", to: "var(--pink)" },
  { from: "var(--pink)", to: "var(--peach)" },
  { from: "var(--peach)", to: "var(--mint)" },
  { from: "var(--mint)", to: "var(--teal)" },
] as const

const DOT_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%23F3ECDD' fill-opacity='0.28'/%3E%3C/svg%3E\")"

const SKIP = new Set([
  "the",
  "a",
  "an",
  "of",
  "and",
  "or",
  "for",
  "to",
  "game",
  "jam",
  "games",
  "jams",
])

function hashId(id: string): number {
  let hash = 0
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0
  }
  return hash
}

/** Two-letter initials from the jam title, skipping generic words like “game” and “jam”. */
export function jamCoverInitials(title: string): string {
  const words = title.split(/[^\p{L}\p{N}]+/u).filter(Boolean)
  const meaningful = words.filter((word) => !SKIP.has(word.toLowerCase()))
  const source = meaningful.length > 0 ? meaningful : words
  if (source.length === 0) return "?"
  if (source.length === 1) return source[0].slice(0, 2).toUpperCase()
  return (source[0][0] + source[1][0]).toUpperCase()
}

/** Local 16:9 cover used when the API has no imageUrl. No network request. */
export function JamCoverFallback({
  id,
  title,
  className,
}: {
  id: string
  title: string
  className?: string
}) {
  const palette = COVER_PALETTES[hashId(id) % COVER_PALETTES.length]
  const initials = jamCoverInitials(title)

  return (
    <div
      aria-hidden
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        className,
      )}
      style={{
        backgroundColor: palette.from,
        backgroundImage: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%), ${DOT_PATTERN}`,
      }}
    >
      <AppIcon
        icon={ICON.jam}
        size="lg"
        className="absolute left-3 top-3 text-[#F3ECDD] opacity-80"
      />
      <span className="font-display text-5xl font-extrabold tracking-tight text-[#F3ECDD] drop-shadow-[2px_2px_0_rgba(0,0,0,0.35)]">
        {initials}
      </span>
    </div>
  )
}
