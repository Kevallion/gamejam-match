"use client"

import { cn } from "@/lib/utils"

interface BrowserFrameProps {
  url?: string
  children: React.ReactNode
  className?: string
  cursorPosition?: { x: string; y: string }
  cursorLabel?: string
  highlighted?: boolean
}

export function BrowserFrame({
  url = "gamejamcrew.com",
  children,
  className,
  cursorPosition,
  cursorLabel,
  highlighted = false,
}: BrowserFrameProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl transition-all duration-500",
        highlighted && "shadow-primary/20 border-primary/30",
        className
      )}
    >
      {/* Browser chrome */}
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

      {/* Content area */}
      <div className="relative overflow-hidden bg-background">
        {children}

        {/* Simulated cursor */}
        {cursorPosition && (
          <div
            className="pointer-events-none absolute z-50 animate-pulse"
            style={{ left: cursorPosition.x, top: cursorPosition.y }}
          >
            <svg
              width="20"
              height="24"
              viewBox="0 0 20 24"
              fill="none"
              className="drop-shadow-lg"
            >
              <path
                d="M2 2L2 19.5L6.5 15.5L10.5 22L13.5 20.5L9.5 14L15.5 13.5L2 2Z"
                fill="white"
                stroke="black"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            {cursorLabel && (
              <span className="ml-5 mt-1 inline-block whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-[10px] font-bold text-background shadow-lg">
                {cursorLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
