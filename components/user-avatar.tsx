"use client"

import { OptimizedAvatar } from "@/components/optimized-avatar"
import { cn } from "@/lib/utils"

/** Modèle utilisateur standard (aligné sur profiles Supabase) */
export interface UserDisplay {
  username: string
  avatar_url?: string | null
}

export interface UserAvatarProps {
  /** Utilisateur à afficher (username + avatar_url depuis profiles) */
  user: UserDisplay
  /** Avatar Discord (user_metadata) — pour le contexte "utilisateur connecté" uniquement */
  discordAvatarUrl?: string | null
  className?: string
  size?: "xs" | "sm" | "md" | "lg"
}

const DICEBEAR_BASE = "https://api.dicebear.com/9.x/adventurer/svg"
const FALLBACK_BG = "d1d4f9"

/**
 * Composant universel pour afficher l'avatar d'un utilisateur.
 * Source de vérité : profiles.avatar_url (ou Discord pour l'utilisateur connecté).
 *
 * Priorité d'affichage :
 * 1. user.avatar_url (profiles ou custom)
 * 2. discordAvatarUrl (Discord, contexte "moi")
 * 3. DiceBear généré à partir du username
 * 4. Initiales du username
 */
export function UserAvatar({
  user,
  discordAvatarUrl,
  className,
  size = "md",
}: UserAvatarProps) {
  const username = user.username || "?"
  const avatarUrl =
    user.avatar_url?.trim() ||
    discordAvatarUrl?.trim() ||
    `${DICEBEAR_BASE}?seed=${encodeURIComponent(username)}&backgroundColor=${FALLBACK_BG}` ||
    null

  const initials =
    username
      .split(/[\s_]+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"

  if (!avatarUrl) {
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

  return (
    <OptimizedAvatar
      src={avatarUrl}
      alt={username}
      size={size}
      className={className}
      fallback={initials}
    />
  )
}
