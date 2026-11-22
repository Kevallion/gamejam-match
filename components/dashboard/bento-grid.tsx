import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type BentoGridProps = {
  children: ReactNode
  className?: string
}

/**
 * Desktop Bento grid — 12 columns from lg (1024px), gap aligned with T6 maquette at 1280px.
 */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "hidden min-w-0 grid-cols-12 gap-4 lg:grid lg:gap-[18px]",
        className,
      )}
    >
      {children}
    </div>
  )
}

export type BentoSpan = 3 | 4 | 5 | 6 | 7 | 8 | 12

const SPAN_CLASS: Record<BentoSpan, string> = {
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  12: "lg:col-span-12",
}

type BentoCellProps = {
  span?: BentoSpan
  className?: string
  children: ReactNode
}

export function BentoCell({ span = 4, className, children }: BentoCellProps) {
  return <div className={cn("min-w-0", SPAN_CLASS[span], className)}>{children}</div>
}
