import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) next = '/'

  if (!code) {
    const reason = encodeURIComponent('no_code')
    return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=${reason}`)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    const reason = encodeURIComponent('missing_env')
    return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=${reason}`)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('Auth callback error:', error)
    const reason = encodeURIComponent(error.message)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=${reason}`)
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
