"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { AuthModal } from "@/components/auth-modal"

export function SignInButton({ className }: { className?: string }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        className={`gap-2 rounded-xl bg-[#5865F2] text-white hover:bg-[#4752C4] ${className ?? ""}`}
      >
        <LogIn className="size-4" />
        Sign In
      </Button>
      <AuthModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}
