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
  Clock,
  Calendar,
  CircleDot,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { JoinTeamModal } from "@/components/join-team-modal"
import { getJamListingStatus, type JamListingStatus } from "@/lib/jam-calendar-status"

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
  jamStartDate?: string | null
  jamEndDate?: string | null
  /** Listing creation time — used to detect backfilled jam_start_date (= created_at). */
  createdAt?: string | null
}

/** Calculate jam duration in human-readable format */
function getJamDuration(startIso: string | null | undefined, endIso: string | null | undefined): string | null {
  if (!startIso || !endIso) return null
  const start = new Date(startIso).getTime()
  const end = new Date(endIso).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null
  
  const diffMs = end - start
  if (diffMs <= 0) return null
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (days >= 7) {
    const weeks = Math.floor(days / 7)
    return weeks === 1 ? "1 week" : `${weeks} weeks`
  }
  if (days >= 1) {
    return days === 1 ? "24 hours" : `${days} days`
  }
  return hours === 1 ? "1 hour" : `${hours} hours`
}

/** Get status icon based on jam phase */
function StatusIcon({ status }: { status: JamListingStatus }) {
  switch (status.phase) {
    case "live":
      return <CircleDot className="size-3 animate-pulse" />
    case "upcoming":
      return <Calendar className="size-3" />
    case "ended":
      return <Clock className="size-3" />
    case "dates_pending":
      return <Calendar className="size-3" />
    default:
      return null
  }
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
  const jamStatus = getJamListingStatus(team.jamStartDate, team.jamEndDate, {
    createdAtIso: team.createdAt,
  })
  const jamDuration = getJamDuration(team.jamStartDate, team.jamEndDate)

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

  const openRolesCount = availableRoles.filter((r) => !r.filled).length

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const title = team.name
    const openRoles = availableRoles.filter((r) => !r.filled).map((r) => r.label).join(", ") || "members"
    const text = `Check out ${team.name} on GameJamCrew! They are looking for: ${openRoles}.`
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
      isRecommended={isRecommended}
    >
      <Button className="w-full gap-2 rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/85 hover:gap-3">
        Apply Now
        <ArrowRight className="size-4" />
      </Button>
    </JoinTeamModal>
  )

  const dialogBody = (
    <>
      <DialogHeader className="space-y-3 border-b border-border/60 px-6 pt-6 pb-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-xl font-bold text-foreground">
              {team.name}
            </DialogTitle>
            <p className="mt-1 text-sm font-medium text-primary">{team.jam}</p>
          </div>
          {isRecommended && (
            <Badge
              variant="outline"
              className="shrink-0 gap-1 border-teal/30 bg-teal/10 text-xs font-semibold text-teal"
            >
              <Sparkles className="size-3" />
              Match
            </Badge>
          )}
        </div>
        
        {/* Status + Duration row */}
        <div className="flex flex-wrap items-center gap-2">
          {jamStatus && (
            <Badge
              variant="outline"
              title={
                jamStatus.phase === "dates_pending"
                  ? "Jam dates match listing creation — update them in Manage team for an accurate status."
                  : undefined
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                jamStatus.badgeClassName,
              )}
            >
              <StatusIcon status={jamStatus} />
              {jamStatus.label}
            </Badge>
          )}
          {jamDuration && (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 rounded-full border-border/60 bg-secondary/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              <Clock className="size-3" />
              {jamDuration}
            </Badge>
          )}
        </div>
      </DialogHeader>

      <ScrollArea className="max-h-[60vh] px-6 py-4">
        <div className="flex flex-col gap-5 pr-4">
          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 rounded-full border-border/60 bg-lavender/15 px-3 py-1 text-xs font-semibold text-lavender"
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

          {/* Description */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              About this team
            </h4>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {team.description}
            </p>
          </div>

          {/* Roles */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              Roles needed
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableRoles.map((role, index) => (
                <span
                  key={`${role.key}-${index}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                    role.filled
                      ? "border-border/40 bg-muted/50 text-muted-foreground line-through opacity-60"
                      : `border-transparent ${role.color}`,
                  )}
                >
                  {role.emoji} {role.label}
                  {role.filled && (
                    <span className="ml-1 text-[10px] font-medium no-underline">
                      (Filled)
                    </span>
                  )}
                </span>
              ))}
            </div>
            {availableRoles.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No specific roles listed
              </p>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="border-t border-border/60 bg-muted/20 px-6 py-4">
        {isSquadFull ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/50 px-4 py-3 text-sm font-bold text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            Squad Complete
          </div>
        ) : (
          applyButton
        )}
      </div>
    </>
  )

  const dialogContentClass =
    "max-w-lg overflow-hidden rounded-2xl border-border/60 bg-card p-0 shadow-2xl shadow-teal/10"

  // Card content - redesigned for clarity
  const cardBody = (
    <>
      <CardHeader className="space-y-3 pb-3">
        {/* Top row: Team name + Share/Members */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold leading-tight text-foreground">
              {team.name}
            </h3>
            <p className="mt-0.5 truncate text-sm font-medium text-primary/90">
              {team.jam}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-full text-muted-foreground hover:text-foreground"
              onClick={handleShare}
              aria-label="Share team"
            >
              <Share2 className="size-3.5" />
            </Button>
            <Badge
              variant="outline"
              className="h-6 rounded-full border-border/60 px-2 text-[10px] font-semibold text-muted-foreground"
            >
              <Users className="mr-1 size-3" />
              {team.members}/{team.maxMembers}
            </Badge>
          </div>
        </div>

        {/* Status row: Jam status badge + Duration + Perfect Match */}
        <div className="flex flex-wrap items-center gap-1.5">
          {isRecommended && (
            <Badge
              variant="outline"
              aria-label="Perfect match for your profile"
              className="gap-1 border-teal/30 bg-teal/15 px-2 py-0.5 text-[10px] font-bold text-teal"
            >
              <Sparkles className="size-2.5" aria-hidden />
              Perfect Match
            </Badge>
          )}
          {jamStatus && (
            <Badge
              variant="outline"
              title={
                jamStatus.phase === "dates_pending"
                  ? "Jam dates match listing creation — update them in Manage team for an accurate status."
                  : undefined
              }
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                jamStatus.badgeClassName,
              )}
            >
              <StatusIcon status={jamStatus} />
              {jamStatus.label}
            </Badge>
          )}
          {jamDuration && (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 rounded-full border-border/60 bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              <Clock className="size-2.5" />
              {jamDuration}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 pt-0">
        {/* Engine + Language */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Cpu className="size-3 text-lavender" />
            {team.engine}
          </span>
          <span className="text-border">•</span>
          <span className="inline-flex items-center gap-1">
            <Globe className="size-3 text-teal" />
            {team.language}
          </span>
        </div>

        {/* Description */}
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {team.description}
        </p>

        {/* Roles needed - compact tags */}
        <div className="mt-auto">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Roles needed
            </span>
            {openRolesCount > 0 && (
              <span className="text-[10px] font-medium text-primary">
                {openRolesCount} open
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {availableRoles.slice(0, 4).map((role, index) => (
              <span
                key={`${role.key}-${index}`}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold transition-opacity",
                  role.filled
                    ? "bg-muted text-muted-foreground line-through opacity-50"
                    : role.color,
                )}
                title={role.filled ? `${role.label} — Filled` : `${role.label} — Open`}
              >
                {role.emoji} {role.label}
              </span>
            ))}
            {availableRoles.length > 4 && (
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                +{availableRoles.length - 4} more
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        {isSquadFull ? (
          <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/50 px-4 py-2 text-xs font-bold text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            Squad Complete
          </div>
        ) : (
          <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 text-xs font-semibold text-primary transition-colors group-hover:bg-primary/10">
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            View & Apply
          </div>
        )}
      </CardFooter>
    </>
  )

  if (!isRecommended) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Card className="card-interactive group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border-border/60 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5">
            {cardBody}
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
          "group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border-teal/40 bg-gradient-to-br from-card via-card to-teal/5 shadow-lg shadow-teal/10 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal/60 hover:shadow-xl hover:shadow-teal/15",
        )}
        role="button"
        tabIndex={0}
        onClick={() => setDetailsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setDetailsOpen(true)
          }
        }}
      >
        {/* Subtle gradient accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal/50 to-transparent" />
        {cardBody}
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className={dialogContentClass}>{dialogBody}</DialogContent>
      </Dialog>
    </>
  )
}
