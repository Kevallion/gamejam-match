"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { AuthModal } from "@/components/auth-modal"

export function SignInButton({ className, next }: { className?: string; next?: string }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        className={`gap-2 rounded-xl ${className ?? ""}`}
      >
        <LogIn className="size-4" />
        Sign In
      </Button>
      <AuthModal open={modalOpen} onOpenChange={setModalOpen} next={next} />
    </>
  )
}
