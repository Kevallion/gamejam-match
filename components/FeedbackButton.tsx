"use client"

import { MessageSquare } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const FEEDBACK_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfPFN9Y_zYZSld-6EEO3ybmPpflPWvTVaF5Le7ooxlIe9a09g/viewform?usp=dialog"

export function FeedbackButton() {
  return (
    <div
      className="fixed z-50"
      style={{
        bottom: "max(1.5rem, env(safe-area-inset-bottom, 1.5rem))",
        right: "max(1.5rem, env(safe-area-inset-right, 1.5rem))",
      }}
    >
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <a
            href={FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary/80 backdrop-blur-sm text-secondary-foreground shadow-lg ring-1 ring-border/40 transition-all hover:bg-secondary hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background touch-manipulation"
            aria-label="Report a bug / Suggestion"
          >
            <MessageSquare className="size-5" />
          </a>
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={10}>
          Report a bug / Suggestion
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
