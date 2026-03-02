import { Gamepad2, Heart } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface FooterProps {
  tagline?: string
  className?: string
}

export function Footer({ tagline, className }: FooterProps) {
  return (
    <footer className={cn("border-t border-border/50 bg-card/50", className)}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-center lg:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="size-4 text-pink" />
            <span>by</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
              <Gamepad2 className="size-4 text-primary" />
              GameJamCrew
            </span>
          </div>
          <span className="hidden text-muted-foreground/50 sm:inline">•</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/privacy"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="/legal"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Legal
            </Link>
          </nav>
        </div>
        {tagline && (
          <p className="text-xs text-muted-foreground/70">{tagline}</p>
        )}
      </div>
    </footer>
  )
}
