import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // Skip admin/cron API so secret headers (e.g. Authorization) reach route handlers unchanged.
    "/((?!_next/static|_next/image|favicon.ico|api/admin|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
