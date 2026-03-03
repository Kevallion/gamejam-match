import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get("next") ?? "/"

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      }
    })

    if (error || !data?.url) {
      return NextResponse.json({ error: error?.message || "No URL" }, { status: 400 })
    }

    try {
      const res = await fetch(data.url, { redirect: "manual" })

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location")
        if (location) {
          return NextResponse.json({ url: location })
        }
      }
    } catch (fetchErr) {
      console.error("fetch redirect error:", fetchErr)
    }

    return NextResponse.json({ url: data.url })
  } catch (err) {
    console.error("Erreur api/auth-url:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
