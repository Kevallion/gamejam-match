import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AuthCodeErrorClient } from "./auth-code-error-client"

export const metadata: Metadata = {
  title: "Sign-in error — GameJamCrew",
  description:
    "Something went wrong while signing in with Discord. Troubleshooting tips for GameJamCrew authentication.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Sign-in error — GameJamCrew",
    description: "Something went wrong while signing in. See how to fix common Discord / Supabase issues.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sign-in error — GameJamCrew",
    description: "Something went wrong while signing in. See how to fix common Discord / Supabase issues.",
  },
}

const REASON_MESSAGES: Record<string, string> = {
  no_code:
    "Discord did not return an authorization code. Make sure the redirect URL is correctly configured in Supabase (Redirect URLs) and in your Discord developer portal.",
  auth_failed:
    "The session could not be created (cookies blocked or server error). Try opening the link in an external browser instead of an in-app browser.",
  missing_env:
    "Missing environment variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY). Check your .env.local file.",
  "PKCE flow failed":
    "Incorrect redirect URL. Add exactly http://localhost:3000/auth/callback (or your domain) in Supabase → Authentication → URL Configuration → Redirect URLs.",
  "Invalid grant": "Code expired or already used. Try signing in again.",
}

export default async function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; error?: string }>
}) {
  const params = await searchParams
  const reason = params?.reason ?? params?.error ?? null
  let decoded: string | null = null
  if (reason) {
    try {
      decoded = decodeURIComponent(reason)
    } catch {
      decoded = reason
    }
  }
  const helpMessage =
    decoded && REASON_MESSAGES[decoded]
      ? REASON_MESSAGES[decoded]
      : decoded
        ? `Supabase error: ${decoded}`
        : "An error occurred while signing you in. Please try again."

  return (
    <AuthCodeErrorClient hasErrorInUrl={!!reason}>
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4">
        <h1 className="text-2xl font-bold">Authentication Error</h1>
        <p className="max-w-md text-center text-muted-foreground">
          {helpMessage}
        </p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </AuthCodeErrorClient>
  )
}
