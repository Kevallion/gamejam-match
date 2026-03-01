import { Gamepad2, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center lg:px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Made with</span>
          <Heart className="size-4 text-pink" />
          <span>by</span>
          <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
            <Gamepad2 className="size-4 text-primary" />
            JamSquad
          </span>
        </div>
        <p className="text-xs text-muted-foreground/70">
          Connect, create, and ship games together.
        </p>
      </div>
    </footer>
  )
}
