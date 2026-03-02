"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface UserAvatarProps {
  /** Avatar URL from gallery (profiles.avatar_url) - priority 1 */
  profileAvatarUrl?: string | null
  /** Discord avatar URL (user_metadata.avatar_url) - priority 2 */
  discordAvatarUrl?: string | null
  /** Fallback URL (e.g. DiceBear) when no gallery or Discord - priority 3 */
  fallbackImageUrl?: string | null
  /** Display name for initials */
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
 * Priority order:
 * 1. profiles.avatar_url (internal gallery)
 * 2. user.user_metadata.avatar_url (Discord)
 * 3. fallbackImageUrl (e.g. DiceBear) or AvatarFallback with initials
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
