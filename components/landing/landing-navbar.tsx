import { Gamepad2 } from "lucide-react"

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 font-extrabold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-900 bg-teal-500 shadow-[2px_2px_0_#0f172a]">
            <Gamepad2 className="h-4 w-4 text-white" />
          </span>
          <span className="text-lg tracking-tight">
            GameJam<span className="text-teal-500">Crew</span>
          </span>
        </a>

        {/* Nav links */}
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 sm:flex">
          <a href="#features" className="transition-colors hover:text-teal-600">
            Features
          </a>
          <a href="#maker" className="transition-colors hover:text-teal-600">
            About
          </a>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="hidden text-sm font-semibold text-slate-600 hover:text-slate-900 sm:block"
          >
            Log in
          </a>
          <a
            href="/signup"
            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-slate-900 bg-teal-500 px-4 py-2 text-sm font-extrabold text-white shadow-[3px_3px_0_#0f172a] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#0f172a]"
          >
            Join Free
          </a>
        </div>
      </div>
    </header>
  )
}
