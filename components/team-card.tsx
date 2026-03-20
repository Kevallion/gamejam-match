"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Globe,
  Cpu,
  Users,
  ArrowRight,
  ShieldCheck,
  Share2,
  Sparkles,
  Flame,
  Zap,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { JoinTeamModal } from "@/components/join-team-modal"

type RoleBadge = {
  label: string
  emoji: string
  color: string
  key?: string
  filled?: boolean
}

type LevelBadge = {
  label: string
  emoji: string
  color: string
}

export type TeamCardData = {
  id: string
  user_id?: string
  name: string
  jam: string
  engine: string
  language: string
  description: string
  members: number
  maxMembers: number
  roles: RoleBadge[]
  level: LevelBadge
  teamVibe?: { label: string; emoji: string; color: string; badgeColor?: string }
  filledRoleKeys?: string[]
}

export function TeamCard({
  team,
  isRecommended = false,
}: {
  team: TeamCardData
  /** Mise en avant « Perfect Match » (liste recommandée) : halo, badge, Apply direct. */
  isRecommended?: boolean
}) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const filledKeys = team.filledRoleKeys ?? []

  // Count acceptances per role (e.g. 2 artists, 1 acceptance -> only first slot filled)
  const filledCountByKey: Record<string, number> = {}
  for (const key of filledKeys) {
    filledCountByKey[key] = (filledCountByKey[key] ?? 0) + 1
  }

  const consumedByKey: Record<string, number> = {}
  const availableRoles = team.roles.map((role) => {
    const key = role.key ?? role.label.toLowerCase().replace(/\s+/g, "-")
    const filledForRole = filledCountByKey[key] ?? 0
    const consumed = consumedByKey[key] ?? 0
    const filled = consumed < filledForRole
    consumedByKey[key] = consumed + 1
    return {
      key,
      label: role.label,
      emoji: role.emoji,
      color: role.color,
      filled,
    }
  })

  const isSquadFull =
    availableRoles.length > 0 && availableRoles.every((r) => r.filled)

  const remainingSpots = team.maxMembers - team.members

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const title = team.name
    const openRoles = availableRoles.filter((r) => !r.filled).map((r) => r.label).join(", ") || "members"
    const text = `Check out ${team.name} on GameJam Crew! They are looking for: ${openRoles}.`
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/teams/${team.id}`
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, text, url })
        toast.success("Shared!")
      } else {
        throw new Error("Share not supported")
      }
    } catch {
      try {
        await navigator.clipboard.writeText(`${text} ${url}`)
        toast.success("Link copied to clipboard!")
      } catch {
        toast.error("Could not copy link")
      }
    }
  }

  const applyButton = (
    <JoinTeamModal
      teamId={team.id}
      teamName={team.name}
      availableRoles={availableRoles}
      ownerUserId={team.user_id}
    >
      <Button className="w-full gap-2 rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/85 hover:gap-3 sm:flex-1">
        Apply
        <ArrowRight className="size-4" />
      </Button>
    </JoinTeamModal>
  )

  const dialogBody = (
    <>
      <DialogHeader className="space-y-1 border-b border-border/60 px-6 pt-6 pb-4 text-left">
        <DialogTitle className="text-xl font-bold text-foreground">
          {team.name}
        </DialogTitle>
        <p className="text-sm font-medium text-primary">{team.jam}</p>
      </DialogHeader>

      <ScrollArea className="max-h-[60vh] px-6 py-4">
        <div className="flex flex-col gap-4 pr-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 rounded-full border-border/60 bg-lavender px-3 py-1 text-xs font-semibold text-lavender-foreground"
            >
              <Cpu className="size-3.5" />
              {team.engine}
            </Badge>
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 rounded-full border-border/60 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal"
            >
              <Globe className="size-3.5" />
              {team.language}
            </Badge>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${team.level.color}`}
            >
              {team.level.emoji} {team.level.label}
            </span>
            {team.teamVibe && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${team.teamVibe.color}`}
              >
                {team.teamVibe.emoji} {team.teamVibe.label}
              </span>
            )}
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              Description
            </h4>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {team.description}
            </p>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              Roles sought
            </h4>
            <ul className="space-y-2">
              {availableRoles.map((role, index) => (
                <li
                  key={`${role.key}-${index}`}
                  className={[
                    "flex items-center gap-2 rounded-lg border border-border/40 px-3 py-2 text-sm transition-colors",
                    role.filled
                      ? "bg-muted/50 opacity-60"
                      : "bg-secondary/30",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                      role.filled ? "opacity-40" : role.color,
                    ].join(" ")}
                  >
                    {role.emoji} {role.label}
                  </span>
                  {role.filled && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      Filled
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {availableRoles.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No role specified
              </p>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="border-t border-border/60 bg-muted/20 px-6 py-4">
        {isSquadFull ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/50 px-4 py-3 text-sm font-bold text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            Team full
          </div>
        ) : (
          applyButton
        )}
      </div>
    </>
  )

  const cardHeader = (
    <CardHeader className="min-w-0 shrink-0 gap-3 pb-0">
      <div className="flex w-full min-w-0 items-start justify-between gap-2">
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="min-w-0 max-w-full truncate text-lg font-bold text-foreground">
              {team.name}
            </h3>
            {team.teamVibe && (
              <span
                className={`max-w-full shrink-0 truncate inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${team.teamVibe.badgeColor ?? team.teamVibe.color}`}
                title={team.teamVibe.label}
              >
                {team.teamVibe.emoji} {team.teamVibe.label}
              </span>
            )}
          </div>
          <p className="mt-0.5 min-w-0 max-w-full truncate text-sm font-medium text-primary">
            {team.jam}
          </p>
        </div>
        <div className="flex min-w-0 max-w-full shrink-0 flex-wrap items-center justify-end gap-1.5">
          {isRecommended && (
            <Badge
              variant="outline"
              aria-label="Perfect match for your profile"
              className="gap-1 border-teal/20 bg-teal/10 text-xs font-semibold text-teal"
            >
              <Sparkles className="size-3" aria-hidden />
              Perfect Match
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full"
            onClick={handleShare}
            aria-label="Share team"
          >
            <Share2 className="size-4" />
          </Button>
          <Badge
            variant="outline"
            className="rounded-full border-border/60 text-xs text-muted-foreground"
          >
            <Users className="mr-1 size-3" />
            {team.members}/{team.maxMembers}
          </Badge>
        </div>
      </div>
    </CardHeader>
  )

  const cardContent = (
    <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 pt-3">
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 break-words">
          <Cpu className="size-3.5 shrink-0 text-lavender" />
          <span className="min-w-0">{team.engine}</span>
        </span>
        <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 break-words">
          <Globe className="size-3.5 shrink-0 text-teal" />
          <span className="min-w-0">{team.language}</span>
        </span>
      </div>

      <p className="line-clamp-3 min-h-0 overflow-hidden text-ellipsis break-words text-sm leading-relaxed text-muted-foreground">
        {team.description}
      </p>

      <div className="flex min-w-0 flex-wrap gap-1.5">
        <span
          className={`inline-flex max-w-full min-w-0 items-center gap-1 break-words rounded-full px-2.5 py-1 text-xs font-semibold ${team.level.color}`}
        >
          {team.level.emoji} {team.level.label}
        </span>
        {availableRoles.map((role, index) => (
          <span
            key={`${role.key}-${index}`}
            className={[
              "inline-flex max-w-full min-w-0 items-center gap-1 break-words rounded-full px-2.5 py-1 text-xs font-semibold transition-opacity",
              role.filled
                ? "bg-muted text-muted-foreground line-through opacity-40"
                : role.color,
            ].join(" ")}
            title={role.filled ? `${role.label} — Filled` : `${role.label} — Open`}
          >
            <span className="min-w-0">
              {role.emoji} {role.label}
            </span>
          </span>
        ))}
      </div>

      {!isSquadFull && remainingSpots === 1 ? (
        <div
          className="mt-auto flex min-w-0 max-w-full flex-wrap items-center gap-1.5 self-start rounded-md border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-500"
          role="status"
        >
          <Flame className="size-3.5 shrink-0" aria-hidden />
          <span className="min-w-0 break-words">Only 1 spot left!</span>
        </div>
      ) : !isSquadFull && team.members > 1 && remainingSpots > 1 ? (
        <div
          className="mt-auto flex min-w-0 max-w-full flex-wrap items-center gap-1.5 self-start rounded-md bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground"
          role="status"
        >
          <Zap className="size-3.5 shrink-0" aria-hidden />
          <span className="min-w-0 break-words">Teams are filling fast</span>
        </div>
      ) : null}
    </CardContent>
  )

  const defaultFooter = (
    <CardFooter className="mt-auto shrink-0">
      {isSquadFull ? (
        <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/50 px-4 py-2.5 text-sm font-bold text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" />
          SQUAD FULL
        </div>
      ) : (
        <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary">
          <ArrowRight className="size-4" />
          View details
        </div>
      )}
    </CardFooter>
  )

  const dialogContentClass =
    "max-w-lg overflow-hidden rounded-2xl border-border/60 bg-card p-0 shadow-2xl shadow-teal/10"

  if (!isRecommended) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Card className="card-interactive group relative flex h-full min-h-0 min-w-0 cursor-pointer flex-col transition-all hover:ring-2 hover:ring-primary/50">
            {cardHeader}
            {cardContent}
            {defaultFooter}
          </Card>
        </DialogTrigger>

        <DialogContent className={dialogContentClass}>{dialogBody}</DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Card
        className={cn(
          "group relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-teal/50 bg-gradient-to-br from-card to-teal/5 shadow-[0_0_20px_-5px_rgba(20,184,166,0.15)] transition-all",
        )}
      >
        <div
          role="button"
          tabIndex={0}
          className="flex min-h-0 min-w-0 flex-1 cursor-pointer flex-col rounded-t-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          onClick={() => setDetailsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setDetailsOpen(true)
            }
          }}
        >
          {cardHeader}
          {cardContent}
        </div>

        <CardFooter
          className="mt-auto shrink-0 flex flex-col gap-2 sm:flex-row sm:items-stretch"
          onClick={(e) => e.stopPropagation()}
        >
          {isSquadFull ? (
            <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/50 px-4 py-2.5 text-sm font-bold text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              SQUAD FULL
            </div>
          ) : (
            <>
              {applyButton}
              <Button
                type="button"
                variant="outline"
                className="w-full shrink-0 rounded-xl border-border/60 sm:w-auto sm:min-w-[8.5rem]"
                onClick={() => setDetailsOpen(true)}
              >
                View details
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className={dialogContentClass}>{dialogBody}</DialogContent>
      </Dialog>
    </>
  )
}
