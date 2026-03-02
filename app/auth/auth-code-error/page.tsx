import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AuthCodeErrorClient } from './auth-code-error-client'

const REASON_MESSAGES: Record<string, string> = {
  no_code: 'Discord n\'a pas renvoyé de code d\'autorisation. Vérifiez que l\'URL de redirection est bien configurée dans Supabase (Redirect URLs) et dans le portail développeur Discord.',
  missing_env: 'Variables d\'environnement manquantes (NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY). Vérifiez votre fichier .env.local.',
  'PKCE flow failed': 'URL de redirection incorrecte. Ajoutez exactement http://localhost:3000/auth/callback (ou votre domaine) dans Supabase → Authentication → URL Configuration → Redirect URLs.',
  'Invalid grant': 'Code expiré ou déjà utilisé. Réessayez la connexion.',
}

export default async function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const params = await searchParams
  const reason = params?.reason ?? null
  let decoded: string | null = null
  if (reason) {
    try {
      decoded = decodeURIComponent(reason)
    } catch {
      decoded = reason
    }
  }
  const helpMessage = decoded && REASON_MESSAGES[decoded]
    ? REASON_MESSAGES[decoded]
    : decoded
      ? `Erreur Supabase : ${decoded}`
      : 'Une erreur est survenue lors de la connexion. Réessayez.'

  return (
    <AuthCodeErrorClient>
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
