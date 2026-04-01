"use client"

import { cn } from "@/lib/utils"

interface BrowserFrameProps {
  url?: string
  children: React.ReactNode
  className?: string
  cursorPosition?: { x: string; y: string }
  cursorLabel?: string
  cursorAction?: "click" | "hover" | "drag" | "typing"
  highlighted?: boolean
  /** Neo-brutalist frame aligned with landing (offset shadow + thick borders). */
  variant?: "default" | "neo"
  /** Tailwind border color class for the neo offset layer, e.g. `border-teal`. */
  accentClassName?: string
}

export function BrowserFrame({
  url = "gamejamcrew.com",
  children,
  className,
  cursorPosition,
  cursorLabel,
  cursorAction = "click",
  highlighted = false,
  variant = "default",
  accentClassName = "border-teal",
}: BrowserFrameProps) {
  const cursorOverlay =
    cursorPosition != null ? (
      <div
        className="pointer-events-none absolute z-50"
        style={{ left: cursorPosition.x, top: cursorPosition.y }}
      >
        {/* Animated cursor with interaction states */}
        <div className="relative">
          {/* Click ripple effect */}
          {cursorAction === "click" && (
            <div className="absolute -left-3 -top-3 size-8 animate-ping rounded-full bg-primary/30" />
          )}
          
          {/* Hover glow effect */}
          {cursorAction === "hover" && (
            <div className="absolute -left-2 -top-2 size-6 animate-pulse rounded-full bg-teal/40 blur-sm" />
          )}

          {/* Custom cursor SVG */}
          <svg
            width="24"
            height="28"
            viewBox="0 0 24 28"
            fill="none"
            className={cn(
              "drop-shadow-xl transition-transform duration-300",
              cursorAction === "click" && "scale-90",
              cursorAction === "hover" && "scale-105"
            )}
          >
            <path
              d="M3 3L3 22L8 17.5L12.5 25L16 23L11.5 15.5L18.5 15L3 3Z"
              fill="white"
              stroke="#1a1a1a"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Inner fill for depth */}
            <path
              d="M5 6L5 18L8.5 14.8L12 21L13.8 20L10.3 13.8L15 13.5L5 6Z"
              fill="#f8fafc"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* Enhanced tooltip label */}
        {cursorLabel && (
          <div className="ml-6 mt-0.5 flex items-center gap-1.5">
            {cursorAction === "typing" && (
              <span className="flex items-center gap-0.5">
                <span className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
                <span className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
                <span className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
              </span>
            )}
            <span className="inline-block whitespace-nowrap rounded-lg bg-foreground/95 px-3 py-1.5 text-[10px] font-bold text-background shadow-xl backdrop-blur-sm">
              {cursorLabel}
            </span>
          </div>
        )}
      </div>
    ) : null

  if (variant === "neo") {
    return (
      <div className={cn("relative", className)}>
        <div
          className={cn(
            "absolute inset-0 translate-x-3 translate-y-3 rounded-xl border-2 opacity-40",
            accentClassName,
            highlighted && "opacity-50"
          )}
          aria-hidden
        />
        <div className="relative overflow-hidden rounded-xl border-2 border-foreground bg-card">
          <div className="flex items-center gap-2 border-b-2 border-foreground bg-muted px-4 py-3">
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded-full border-2 border-foreground bg-pink/30" />
              <div className="size-3 rounded-full border-2 border-foreground bg-peach/30" />
              <div className="size-3 rounded-full border-2 border-foreground bg-teal/30" />
            </div>
            <div className="mx-4 flex-1">
              <div className="mx-auto max-w-sm rounded-lg border border-slate-300 bg-background px-4 py-1.5 text-center text-xs font-mono text-muted-foreground">
                {url}
              </div>
            </div>
            <div className="w-[52px]" />
          </div>
          <div className="relative overflow-hidden bg-background">
            {children}
            {cursorOverlay}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl transition-all duration-500",
        highlighted && "border-primary/30 shadow-primary/20",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/50 bg-muted/50 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-full bg-destructive/60" />
          <div className="size-3 rounded-full bg-warning/60" />
          <div className="size-3 rounded-full bg-success/60" />
        </div>
        <div className="mx-4 flex-1">
          <div className="mx-auto max-w-sm rounded-lg bg-background/80 px-4 py-1.5 text-center text-xs font-medium text-muted-foreground">
            {url}
          </div>
        </div>
        <div className="w-[52px]" />
      </div>

      <div className="relative overflow-hidden bg-background">
        {children}
        {cursorOverlay}
      </div>
    </div>
  )
}
