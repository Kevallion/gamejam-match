"use client"

import { OptimizedAvatar } from "@/components/optimized-avatar"
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

/**
 * Priority order:
 * 1. profiles.avatar_url (internal gallery)
 * 2. user.user_metadata.avatar_url (Discord)
 * 3. fallbackImageUrl (e.g. DiceBear) or initials fallback
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
