"use client"

import { useMemo, useState, useTransition } from "react"
import { sendProfileInvitation } from "@/app/actions/invite-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { neoButton, neoPanelInteractive } from "@/lib/neo-style"
import { cn } from "@/lib/utils"
import { Loader2, MailPlus, Users } from "lucide-react"
import { toast } from "sonner"

export type OwnedSquadOption = {
  id: string
  teamName: string
}

type InviteToSquadControlProps = {
  inviteeId: string
  inviteeDisplayName: string
  viewerUserId: string | null
  squads: OwnedSquadOption[]
  alreadyInvitedTeamIds: string[]
  memberTeamIds?: string[]
}

export function InviteToSquadControl({
  inviteeId,
  inviteeDisplayName,
  viewerUserId,
  squads,
  alreadyInvitedTeamIds,
  memberTeamIds = [],
}: InviteToSquadControlProps) {
  const [open, setOpen] = useState(false)
  const [pendingTeamId, setPendingTeamId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const canInvite = Boolean(viewerUserId) && viewerUserId !== inviteeId

  const busyForTeam = useMemo(() => pendingTeamId, [pendingTeamId])

  if (!canInvite) {
    return null
  }

  function handleInvite(teamId: string) {
    if (isPending) return
    setPendingTeamId(teamId)
    startTransition(async () => {
      const result = await sendProfileInvitation({
        teamId,
        inviteeUserId: inviteeId,
        inviteeUsername: inviteeDisplayName,
      })

      if (!result.success) {
        toast.error("Could not send invitation.", { description: result.error })
        setPendingTeamId(null)
        return
      }

      toast.success(`Invitation sent to ${inviteeDisplayName}.`)
      setPendingTeamId(null)
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(neoButton, "w-full gap-2 bg-teal text-teal-foreground hover:bg-teal/90 sm:w-auto")}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <MailPlus className="size-4 text-teal" />}
          Invite to Squad
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-2 border-foreground shadow-[4px_4px_0_0_var(--neo-shadow)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to Squad</DialogTitle>
          <DialogDescription>
            Select one of your squads to invite {inviteeDisplayName}.
          </DialogDescription>
        </DialogHeader>

        {squads.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
            You do not own any squads yet.
          </div>
        ) : (
          <div className="space-y-2">
            {squads.map((squad) => {
              const busy = busyForTeam === squad.id
              const isMember = memberTeamIds.includes(squad.id)
              const isAlreadyInvited = !isMember && alreadyInvitedTeamIds.includes(squad.id)
              return (
                <div
                  key={squad.id}
                  className={cn(neoPanelInteractive, "flex flex-col items-stretch gap-2 px-4 py-3 sm:flex-row sm:items-center")}
                >
                  <span className="min-w-0 flex-1 truncate font-medium">{squad.teamName}</span>
                  {isMember || isAlreadyInvited ? (
                    <Button
                      type="button"
                      variant="secondary"
                      disabled
                      className="h-11 w-full shrink-0 justify-center rounded-lg sm:w-36"
                    >
                      {isMember ? "Already a member" : "Pending / Joined"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => handleInvite(squad.id)}
                      className="h-11 w-full shrink-0 justify-center rounded-lg sm:w-36"
                    >
                      {busy ? (
                        <>
                          <Loader2 className="size-4 shrink-0 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Users className="size-4 shrink-0 text-muted-foreground" />
                          Invite
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
