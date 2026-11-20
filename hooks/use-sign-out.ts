"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { signOutAndLeave, type SignOutScope } from "@/lib/auth/sign-out"
import { GLOBAL_SIGN_OUT_FAILED_TOAST } from "@/components/auth/signing-out-cover"

/** Log out (this device) or Log out of all devices, with redirect and cleanup. */
export function useSignOut() {
  const router = useRouter()
  const [pending, setPending] = useState<SignOutScope | null>(null)

  const signOut = useCallback(
    async (scope: SignOutScope = "local") => {
      setPending(scope)
      const result = await signOutAndLeave({ scope, router })
      setPending(null)
      // Reached only when the page was not reloaded (local fallback worked).
      if (!result.ok && scope === "global") {
        toast.error(GLOBAL_SIGN_OUT_FAILED_TOAST.title, { description: GLOBAL_SIGN_OUT_FAILED_TOAST.description })
      }
      return result
    },
    [router],
  )

  return { signOut, pending }
}