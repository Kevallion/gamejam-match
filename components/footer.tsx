import { Gamepad2, Heart, MessageSquareText } from "lucide-react"
import Link from "next/link"
import { InstagramIcon, LinkedInIcon, XIcon } from "@/components/brand-icons"
import { cn } from "@/lib/utils"

const SOCIAL_CLASS =
  "text-muted-foreground transition-colors hover:text-primary"

type FooterProps = {
  tagline?: string
  className?: string
}

export function Footer({ tagline, className }: FooterProps) {
  return (
    <footer
      className={cn(
        "shrink-0 border-t border-border/50 bg-card/50",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:py-8 lg:px-6",
          "md:flex-row md:items-center md:justify-between",
        )}
      >
        <div className="flex min-w-0 flex-col items-center gap-4 md:flex-1 md:items-start">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:justify-start">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="size-4 text-pink" aria-hidden />
              <span>by</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                <Gamepad2 className="size-4 text-primary" aria-hidden />
                GameJamCrew
              </span>
            </div>
            <span className="hidden text-muted-foreground/50 sm:inline">
              •
            </span>
            <nav
              aria-label="Legal and discovery"
              className="flex flex-wrap items-center justify-center gap-4 text-sm md:justify-start"
            >
              <Link
                href="/showcase"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                How it works
              </Link>
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
              <Link
                href="https://docs.google.com/forms/d/e/1FAIpQLSfPFN9Y_zYZSld-6EEO3ybmPpflPWvTVaF5Le7ooxlIe9a09g/viewform?usp=dialog"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <MessageSquareText className="size-3.5" aria-hidden />
                Feedback
              </Link>
            </nav>
          </div>
          {tagline ? (
            <p className="text-center text-xs text-muted-foreground/70 md:text-left">
              {tagline}
            </p>
          ) : null}
        </div>

        <div className="flex w-full shrink-0 items-center justify-center gap-5 md:w-auto md:justify-end">
          <Link
            href="https://www.instagram.com/gamejamcrew/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GameJamCrew on Instagram"
            className={SOCIAL_CLASS}
          >
            <InstagramIcon className="size-5" aria-hidden />
          </Link>
          <Link
            href="https://x.com/GameJamCrew"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GameJamCrew on X"
            className={SOCIAL_CLASS}
          >
            <XIcon className="size-5" aria-hidden />
          </Link>
          <Link
            href="https://www.linkedin.com/company/gamejamcrew"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GameJamCrew on LinkedIn"
            className={SOCIAL_CLASS}
          >
            <LinkedInIcon className="size-5" aria-hidden />
          </Link>
        </div>
      </div>
    </footer>
  )
}
