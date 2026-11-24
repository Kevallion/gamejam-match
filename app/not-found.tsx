import Link from "next/link"
import { Navbar } from "@/components/navbar"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-16 text-left"
      >
        <p className="text-base font-semibold tabular-nums text-muted-foreground">404</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
          This page does not exist or is no longer available.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-xl border border-border bg-card px-4 text-base font-semibold text-foreground shadow-[3px_3px_0_0_var(--neo-shadow)] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back to GameJamCrew
          </Link>
        </div>
      </main>
    </div>
  )
}
