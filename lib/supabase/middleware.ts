import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Authenticated pages that must never be stored by the browser (or bfcache),
 * so their content is not visible via Back after a logout.
 */
const PRIVATE_NO_STORE_PATHS = [
  /^\/dashboard(?:\/|$)/,
  /^\/teams\/[^/]+\/manage(?:\/|$)/,
  /^\/invitation(?:\/|$)/,
  /^\/sync-jams(?:\/|$)/,
]

function isPrivateNoStorePath(pathname: string): boolean {
  return PRIVATE_NO_STORE_PATHS.some((pattern) => pattern.test(pathname))
}

function applyPrivateNoStore(request: NextRequest, response: NextResponse): NextResponse {
  if (isPrivateNoStorePath(request.nextUrl.pathname)) {
    response.headers.set("Cache-Control", "private, no-store")
  }
  return response
}

/**
 * Met à jour la session Supabase (refresh des tokens).
 * Ne redirige JAMAIS vers /login sur les routes d'auth pour éviter les boucles.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Ne pas exécuter de code entre createServerClient et getSession/getUser
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // refresh_token_not_found : session invalide, on signe out pour nettoyer les cookies.
    // Scope local : ne révoque que la session de ce navigateur, pas celles des autres appareils.
    await supabase.auth.signOut({ scope: "local" })
  }

  // Keep `/` statically cacheable: authenticated jammers are sent to the dashboard here.
  if (request.nextUrl.pathname === "/" && user) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  return applyPrivateNoStore(request, supabaseResponse)
}
