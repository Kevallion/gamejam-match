"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { UserAvatar } from "@/components/user-avatar"
import { acceptTeamInvitation } from "@/app/actions/team-membership-actions"
import {
  markNotificationsReadForJoinRequest,
  notifyOwnerInvitationDeclined,
} from "@/app/actions/team-actions"
import { ENGINE_OPTIONS, EXPERIENCE_STYLES, ROLE_STYLES } from "@/lib/constants"
import { supabase } from "@/lib/supabase"
import { Check, Gamepad2, Loader2, Target, X } from "lucide-react"
import { toast } from "sonner"
import { showGamificationRewards } from "@/components/gamification-reward-toasts"
import { gamificationRewardHasToast } from "@/lib/gamification-reward-types"

export type InvitationPageTeam = {
  team_name: string | null
  game_name: string | null
  engine: string | null
  description: string | null
  team_vibe: string | null
  experience_required: string | null
  discord_link: string | null
  jam_title: string | null
}

export function InvitationRespondClient(props: {
  requestId: string
  status: string
  targetRole: string | null
  inviteMessage: string | null
  teamId: string
  team: InvitationPageTeam
  captainUserId: string | null
  captainUsername: string | null
  captainAvatarUrl: string | null
}) {
  const router = useRouter()
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null)

  const engineLabel = props.team.engine?.trim()
    ? ENGINE_OPTIONS.find((o) => o.value === props.team.engine)?.label ?? props.team.engine
    : null
  const roleKey = props.targetRole?.trim().toLowerCase() ?? ""
  const roleStyle = ROLE_STYLES[roleKey] ?? {
    label: props.targetRole || "Role",
    emoji: "🎭",
    color: "bg-muted text-muted-foreground",
  }
  const expKey = props.team.experience_required?.trim().toLowerCase() ?? ""
  const expLabel = expKey
    ? EXPERIENCE_STYLES[expKey]?.label ?? props.team.experience_required
    : null

  const handleAccept = async () => {
    setBusy("accept")
    try {
      const result = await acceptTeamInvitation(props.requestId)
      if (!result.success) {
        toast.error("Could not join the team.", { description: result.error })
        return
      }
      void markNotificationsReadForJoinRequest(props.requestId)
      if (result.gamification && gamificationRewardHasToast(result.gamification)) {
        showGamificationRewards("JOIN_TEAM", result.gamification)
      }
      toast.success(`You joined ${props.team.team_name ?? "the squad"}!`)
      router.push(`/teams/${props.teamId}`)
      router.refresh()
    } catch (err) {
      toast.error("Something went wrong.", {
        description: err instanceof Error ? err.message : "Try again.",
      })
    } finally {
      setBusy(null)
    }
  }

  const handleDecline = async () => {
    setBusy("decline")
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const uid = session?.user?.id ?? null
      const meta = session?.user?.user_metadata as Record<string, string> | undefined
      const displayName =
        meta?.username?.trim() ||
        meta?.user_name?.trim() ||
        meta?.full_name?.trim() ||
        meta?.name?.trim() ||
        (session?.user?.email ? session.user.email.split("@")[0] : null) ||
        "A jammer"

      const { error } = await supabase
        .from("join_requests")
        .update({ status: "rejected" })
        .eq("id", props.requestId)

      if (error) {
        toast.error("Could not decline the invitation.", { description: error.message })
        return
      }

      void markNotificationsReadForJoinRequest(props.requestId)
      void notifyOwnerInvitationDeclined(props.teamId, displayName, uid)

      toast.success("Invitation declined.")
      router.push("/dashboard?tab=inbox")
      router.refresh()
    } catch (err) {
      toast.error("Something went wrong.", {
        description: err instanceof Error ? err.message : "Try again.",
      })
    } finally {
      setBusy(null)
    }
  }

  if (props.status !== "pending") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 md:pt-24">
          <Card className="rounded-2xl border-border/50 bg-card">
            <CardContent className="space-y-4 p-8 text-center">
              <p className="text-lg font-bold text-foreground">This invitation is no longer pending.</p>
              <p className="text-sm text-muted-foreground">
                It may have been accepted, declined, or cancelled. Check your inbox or team list.
              </p>
              <Button asChild className="rounded-xl bg-teal text-teal-foreground hover:bg-teal/90">
                <Link href="/dashboard?tab=inbox">Open inbox</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 md:py-16 md:pt-24">
        <div className="mb-6 space-y-2">
          <Badge variant="outline" className="rounded-full border-lavender/30 bg-lavender/10 text-lavender">
            Squad invitation
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            You&apos;re invited to{" "}
            <span className="text-teal">{props.team.team_name ?? "a squad"}</span>
          </h1>
          <p className="text-muted-foreground">
            Review the project below, then accept or decline — your call, no pressure.
          </p>
        </div>

        {props.captainUserId ? (
          <Card className="mb-6 rounded-2xl border-border/50 bg-card">
            <CardContent className="flex flex-wrap items-center gap-4 p-5">
              <UserAvatar
                src={props.captainAvatarUrl}
                fallbackName={props.captainUsername ?? "Captain"}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Invited by
                </p>
                <Link
                  href={`/jammer/${props.captainUserId}`}
                  className="text-lg font-bold text-foreground hover:text-teal"
                >
                  {props.captainUsername ?? "Team captain"}
                </Link>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl border-border/60" asChild>
                <Link href={`/jammer/${props.captainUserId}`}>View profile</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {props.inviteMessage?.trim() ? (
          <Card className="mb-6 rounded-2xl border-lavender/25 bg-secondary/30">
            <CardContent className="p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-lavender">
                Message from the captain
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {props.inviteMessage.trim()}
              </p>
            </CardContent>
          </Card>
        ) : null}

        <Card className="rounded-2xl border-border/50 bg-card">
          <CardContent className="space-y-5 p-6">
            <div className="flex flex-wrap gap-2">
              <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ${roleStyle.color}`}>
                <Target className="mr-1 size-3" aria-hidden />
                {roleStyle.emoji} {roleStyle.label}
              </Badge>
              {props.team.game_name?.trim() ? (
                <Badge className="rounded-full bg-peach/15 px-3 py-1 text-xs font-semibold text-peach">
                  <Gamepad2 className="mr-1 size-3" aria-hidden />
                  {props.team.game_name}
                </Badge>
              ) : null}
              {engineLabel ? (
                <Badge className="rounded-full bg-teal/15 px-3 py-1 text-xs font-semibold text-teal">
                  {engineLabel}
                </Badge>
              ) : null}
              {props.team.jam_title?.trim() ? (
                <Badge className="rounded-full bg-mint/15 px-3 py-1 text-xs font-semibold text-mint">
                  {props.team.jam_title}
                </Badge>
              ) : null}
            </div>

            {props.team.description?.trim() ? (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Project</p>
                <p className="text-sm leading-relaxed text-foreground">{props.team.description.trim()}</p>
              </div>
            ) : null}
            {props.team.team_vibe?.trim() ? (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Team vibe</p>
                <p className="text-sm text-foreground">{props.team.team_vibe.trim()}</p>
              </div>
            ) : null}
            {expLabel ? (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Experience level</p>
                <p className="text-sm text-foreground">{expLabel}</p>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-border/40 pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="gap-2 rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10"
                disabled={busy !== null}
                onClick={() => void handleDecline()}
              >
                {busy === "decline" ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
                Decline
              </Button>
              <Button
                type="button"
                className="gap-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
                disabled={busy !== null}
                onClick={() => void handleAccept()}
              >
                {busy === "accept" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                Accept & join
              </Button>
            </div>

            {props.team.discord_link?.trim() ? (
              <p className="text-center text-xs text-muted-foreground">
                After joining, grab the Discord link on the{" "}
                <Link href={`/teams/${props.teamId}`} className="font-semibold text-primary hover:underline">
                  team page
                </Link>
                .
              </p>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
