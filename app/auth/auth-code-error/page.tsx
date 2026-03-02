import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-bold">Authentication Error</h1>
      <p className="max-w-md text-center text-muted-foreground">
        Something went wrong during sign in. Please try again.
      </p>
      <Button asChild>
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  )
}
