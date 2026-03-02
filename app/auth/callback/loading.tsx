import { Loader2 } from "lucide-react"

export default function AuthCallbackLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4">
      <Loader2 className="size-10 animate-spin text-primary" />
      <p className="text-muted-foreground">Connexion en cours...</p>
    </div>
  )
}
