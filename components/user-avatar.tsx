"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface UserAvatarProps {
  /** URL de l'avatar choisi dans la galerie (profiles.avatar_url) - priorité 1 */
  profileAvatarUrl?: string | null
  /** URL de l'avatar Discord (user_metadata.avatar_url) - priorité 2 */
  discordAvatarUrl?: string | null
  /** URL de secours (ex: DiceBear) quand pas de galerie ni Discord - priorité 3 */
  fallbackImageUrl?: string | null
  /** Nom d'affichage pour les initiales */
  username: string
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "size-8",
  md: "size-12",
  lg: "size-14",
}

/**
 * Logique de priorité :
 * 1. profiles.avatar_url (galerie interne)
 * 2. user.user_metadata.avatar_url (Discord)
 * 3. fallbackImageUrl (ex: DiceBear) ou AvatarFallback avec initiales
 */
export function UserAvatar({
  profileAvatarUrl,
  discordAvatarUrl,
  fallbackImageUrl,
  username,
  className,
  size = "md",
}: UserAvatarProps) {
  const avatarUrl =
    profileAvatarUrl?.trim() ||
    discordAvatarUrl?.trim() ||
    fallbackImageUrl?.trim() ||
    null

  const initials = username
    .split(/[\s_]+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?"

  return (
    <Avatar className={cn(sizeClasses[size], "ring-2 ring-border/60", className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={username} />}
      <AvatarFallback className="bg-secondary text-sm font-bold text-secondary-foreground">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
