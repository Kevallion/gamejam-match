import type { ReactNode } from "react"
import { Footer } from "@/components/footer"

/** Public marketing / legal / sign-in chrome. No session read, so the landing page can stay cached. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  )
}
