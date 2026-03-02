import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) next = '/'

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const baseUrl = isLocalEnv
    ? origin
    : forwardedHost
      ? `https://${forwardedHost}`
      : origin

  return NextResponse.redirect(`${baseUrl}${next}`)
}
