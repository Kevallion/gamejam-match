"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const sizeMap = { xs: 40, sm: 32, md: 48, lg: 56 } as const

/** Convert DiceBear SVG URL to PNG for next/image optimization */
function toOptimizedAvatarUrl(url: string): string {
  if (url.includes("api.dicebear.com") && url.includes("/svg")) {
    return url.replace("/svg", "/png")
  }
  return url
}

export interface OptimizedAvatarProps {
  src: string
  alt: string
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
  fallback?: React.ReactNode
}

/**
 * Avatar using next/image for optimization (WebP/AVIF, caching, no CLS).
 * Supports Discord CDN and DiceBear (converted to PNG).
 */
export function OptimizedAvatar({
  src,
  alt,
  size = "md",
  className,
  fallback,
}: OptimizedAvatarProps) {
  const [error, setError] = useState(false)
  const px = sizeMap[size]
  const optimizedSrc = toOptimizedAvatarUrl(src)
  const needsUnoptimized =
    src.startsWith("data:") || (!src.includes("cdn.discordapp.com") && !src.includes("api.dicebear.com"))

  if (error || !src) {
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
        {fallback ?? "?"}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full ring-2 ring-border/60",
        size === "xs" && "size-10",
        size === "sm" && "size-8",
        size === "md" && "size-12",
        size === "lg" && "size-14",
        className
      )}
    >
      <Image
        src={optimizedSrc}
        alt={alt}
        width={px}
        height={px}
        sizes={`${px}px`}
        className="object-cover"
        unoptimized={needsUnoptimized}
        onError={() => setError(true)}
      />
    </div>
  )
}
