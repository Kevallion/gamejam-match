"use client"

import { MessageSquareText } from "lucide-react"
import { usePathname } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const FEEDBACK_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfPFN9Y_zYZSld-6EEO3ybmPpflPWvTVaF5Le7ooxlIe9a09g/viewform?usp=dialog"

export function FeedbackButton() {
  const pathname = usePathname()
  // Floating feedback lives in Me hub / app sidebar on the dashboard shell.
  // Keep it on create flows — those pages use Navbar only (no Me hub).
  if (pathname?.startsWith("/dashboard")) {
    return null
  }

  return (
    <div className="feedback-fab fixed z-50">
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <a
            href={FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-lg ring-1 ring-border/40 transition-[transform,background-color] motion-reduce:transition-none motion-reduce:transform-none hover:bg-secondary hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Report a bug / Suggestion"
          >
            <MessageSquareText className="size-5" aria-hidden="true" />
          </a>
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={10}>
          Report a bug / Suggestion
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
