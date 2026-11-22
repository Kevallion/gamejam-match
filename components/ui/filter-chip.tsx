"use client"

import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

type FilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pressed?: boolean
  children: ReactNode
}

/** Charter DS-1 chip: rounded-full, sized to its label, token colors only. */
export function FilterChip({
  pressed = false,
  className,
  children,
  type = "button",
  ...props
}: FilterChipProps) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        pressed
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-muted",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
