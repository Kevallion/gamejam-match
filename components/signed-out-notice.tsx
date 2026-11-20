import { Lock } from "lucide-react"
import { SignInButton } from "@/components/sign-in-button"

/**
 * Shown instead of jammer data to signed-out visitors: profiles and
 * availability posts are only readable with a session (S7).
 */
export function SignedOutNotice({
  title = "Sign in to see jammers",
  description = "Jammer profiles are only visible to signed-in members.",
}: {
  title?: string
  description?: string
}) {
  return (
    <section className="px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-border/50 bg-card/70 p-8 text-center shadow-lg">
        <Lock className="size-8 text-muted-foreground" aria-hidden />
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        <SignInButton />
      </div>
    </section>
  )
}
