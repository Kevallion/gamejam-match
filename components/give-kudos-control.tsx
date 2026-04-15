"use client"

import { useState, useTransition } from "react"
import { giveKudos } from "@/app/actions/kudos-actions"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SignInButton } from "@/components/sign-in-button"
import { KUDOS_CATEGORY_ORDER, KUDOS_CATEGORY_UI, type KudosCategoryDb } from "@/lib/kudos"
import { ChevronDown, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

type GiveKudosControlProps = {
  receiverId: string
  viewerUserId: string | null
  /** When viewer is signed in (and not self), whether they share at least one team with the profile owner. */
  viewerSharesTeamWithReceiver: boolean
  profileDisplayName: string
}

export function GiveKudosControl({
  receiverId,
  viewerUserId,
  viewerSharesTeamWithReceiver,
  profileDisplayName,
}: GiveKudosControlProps) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  if (!viewerUserId) {
    return (
      <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:items-start">
        <p className="text-center text-sm text-muted-foreground sm:text-left">
          Sign in to endorse this jammer with kudos.
        </p>
        <SignInButton className="w-full sm:w-auto" />
      </div>
    )
  }

  if (viewerUserId === receiverId) {
    return null
  }

  if (!viewerSharesTeamWithReceiver) {
    return (
      <p className="w-full max-w-md text-center text-sm text-muted-foreground/90 sm:w-auto sm:text-left">
        Collaborate with{" "}
        <span className="font-medium text-foreground/80">{profileDisplayName}</span> in a team to leave
        a Kudos.
      </p>
    )
  }

  function send(cat: KudosCategoryDb) {
    startTransition(async () => {
      const res = await giveKudos(receiverId, cat)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      const ui = KUDOS_CATEGORY_UI[cat]
      toast.success(`Kudos sent: ${ui.emoji} ${ui.label}`)
      setOpen(false)
    })
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full gap-2 rounded-xl border-lavender/35 bg-lavender/5 hover:bg-lavender/10 sm:w-auto"
          disabled={pending}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4 text-lavender" />}
          Give Kudos
          <ChevronDown className="size-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="font-normal text-muted-foreground">
          Pick a category (one endorsement per category)
        </DropdownMenuLabel>
        {KUDOS_CATEGORY_ORDER.map((cat) => {
          const ui = KUDOS_CATEGORY_UI[cat]
          return (
            <DropdownMenuItem
              key={cat}
              disabled={pending}
              className="gap-2 cursor-pointer"
              onSelect={(e) => {
                e.preventDefault()
                send(cat)
              }}
            >
              <span className="text-base" aria-hidden>
                {ui.emoji}
              </span>
              <span>{ui.label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
