"use client"

import { OptimizedAvatar } from "@/components/optimized-avatar"
import { cn } from "@/lib/utils"

const DICEBEAR_BASE = "https://api.dicebear.com/9.x/adventurer/svg"
const FALLBACK_BG = "d1d4f9"

export interface UserAvatarProps {
  /** URL de l'avatar (profiles.avatar_url, Discord, etc.) — null si absent */
  src: string | null
  /** Nom pour fallback DiceBear ou initiales */
  fallbackName: string
  className?: string
  size?: "xs" | "sm" | "md" | "lg"
}

/**
 * Composant unique pour l'affichage des avatars.
 * SEULE source de vérité pour la logique de fallback.
 *
 * Priorité :
 * 1. src valide → affichage de l'image
 * 2. fallbackName → génération DiceBear (style uniforme)
 * 3. initiales ou icône anonyme
 */
export function UserAvatar({
  src,
  fallbackName,
  className,
  size = "md",
}: UserAvatarProps) {
  const name = fallbackName?.trim() || "?"
  const validSrc = src?.trim() || null

  const initials =
    name
      .split(/[\s_]+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"

  // 1. src valide → image
  if (validSrc) {
    return (
      <OptimizedAvatar
        src={validSrc}
        alt={name}
        size={size}
        className={className}
        fallback={initials}
      />
    )
  }

  // 2. fallbackName → DiceBear (généré ici uniquement)
  if (name && name !== "?") {
    const diceBearUrl = `${DICEBEAR_BASE}?seed=${encodeURIComponent(name)}&backgroundColor=${FALLBACK_BG}`
    return (
      <OptimizedAvatar
        src={diceBearUrl}
        alt={name}
        size={size}
        className={className}
        fallback={initials}
      />
    )
  }

  // 3. initiales / icône anonyme
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground ring-2 ring-border/60",
        size === "xs" && "size-10",
        size === "sm" && "size-8",
        size === "md" && "size-12",
        size === "lg" && "size-14",
        className
      )}
    >
      {initials}
    </div>
  )
}
