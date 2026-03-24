"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Globe,
  Cpu,
  Users,
  ArrowRight,
  ShieldCheck,
  Share2,
  Sparkles,
  Flame,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { JoinTeamModal } from "@/components/join-team-modal"
import { getJamListingStatus } from "@/lib/jam-calendar-status"

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

export function TeamCard({
  team,
  isRecommended = false,
}: {
  team: TeamCardData
  isRecommended?: boolean
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const filledKeys = team.filledRoleKeys ?? []
  const jamStatus = getJamListingStatus(team.jamStartDate, team.jamEndDate, {
    createdAtIso: team.createdAt,
  })

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
    return { key, label: role.label, emoji: role.emoji, color: role.color, filled }
  })

  const isSquadFull =
    availableRoles.length > 0 && availableRoles.every((r) => r.filled)

  const remainingSpots = team.maxMembers - team.members

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
        Apply
        <ArrowRight className="size-4" />
      </Button>
    </JoinTeamModal>
  )

  /* ── Sheet body (slide-over detail panel) ────────────────────── */
  const sheetBody = (
    <div className="flex h-full flex-col">
      <SheetHeader className="shrink-0 border-b border-border/60 px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-3 pr-6">
          <div className="min-w-0 flex-1">
            <SheetTitle className="truncate text-xl font-extrabold text-foreground">
              {team.name}
            </SheetTitle>
            <p className="mt-0.5 truncate text-sm font-semibold text-primary">
              {team.jam}
            </p>
          </div>
          {isRecommended && (
            <Badge
              variant="outline"
              className="shrink-0 gap-1 border-teal/20 bg-teal/10 text-xs font-semibold text-teal"
            >
              <Sparkles className="size-3" aria-hidden />
              Perfect Match
            </Badge>
          )}
        </div>

        {jamStatus && (
          <Badge
            variant="outline"
            title={
              jamStatus.phase === "dates_pending"
                ? "Jam dates match listing creation — update them in Manage team for an accurate status."
                : undefined
            }
            className={cn(
              "mt-2 w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold",
              jamStatus.badgeClassName,
            )}
          >
            {jamStatus.label}
          </Badge>
        )}
      </SheetHeader>

      <ScrollArea className="flex-1 px-5 py-4">
        <div className="flex flex-col gap-5 pr-1">
          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 rounded-full border-border/60 bg-lavender/20 px-3 py-1 text-xs font-semibold text-lavender-foreground"
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
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 rounded-full border-border/60 text-xs text-muted-foreground"
            >
              <Users className="size-3" />
              {team.members}/{team.maxMembers} members
            </Badge>
          </div>

          {/* Description */}
          <div>
            <h4 className="mb-1.5 text-sm font-bold text-foreground">Description</h4>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {team.description}
            </p>
          </div>

          {/* Roles */}
          <div>
            <h4 className="mb-2 text-sm font-bold text-foreground">Roles sought</h4>
            <ul className="flex flex-col gap-2">
              {availableRoles.map((role, index) => (
                <li
                  key={`${role.key}-${index}`}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border border-border/40 px-3 py-2 text-sm transition-colors",
                    role.filled ? "bg-muted/50 opacity-60" : "bg-secondary/30",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                      role.filled ? "opacity-40" : role.color,
                    )}
                  >
                    {role.emoji} {role.label}
                  </span>
                  {role.filled && (
                    <span className="ml-auto text-xs text-muted-foreground">Filled</span>
                  )}
                </li>
              ))}
              {availableRoles.length === 0 && (
                <p className="text-sm italic text-muted-foreground">No role specified</p>
              )}
            </ul>
          </div>
        </div>
      </ScrollArea>

      {/* Footer action */}
      <div className="shrink-0 border-t border-border/60 bg-card/60 px-5 py-4">
        {isSquadFull ? (
          <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/50 px-4 py-3 text-sm font-bold text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            Squad full
          </div>
        ) : (
          applyButton
        )}
      </div>
    </div>
  )

  /* ── Compact Bento Card ──────────────────────────────────────── */
  const openRolesForCard = availableRoles.filter((r) => !r.filled).slice(0, 4)

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        aria-label={`View details for ${team.name}`}
        onClick={() => setSheetOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setSheetOpen(true)
          }
        }}
        className={cn(
          "card-interactive group relative flex h-full cursor-pointer flex-col rounded-xl border border-border/60 bg-card p-4 outline-none transition-all focus-visible:ring-2 focus-visible:ring-primary/50",
          isRecommended && "border-teal/40 bg-gradient-to-br from-card to-teal/5 shadow-[0_0_18px_-4px_rgba(20,184,166,0.12)]",
        )}
      >
        {/* Top row: name + actions */}
        <div className="mb-3 flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <h3 className="truncate text-sm font-bold text-foreground">
                {team.name}
              </h3>
              {isRecommended && (
                <Badge
                  variant="outline"
                  className="shrink-0 gap-0.5 border-teal/20 bg-teal/10 px-1.5 py-0 text-[10px] font-semibold text-teal"
                >
                  <Sparkles className="size-2.5" aria-hidden />
                  Match
                </Badge>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs font-medium text-primary">
              {team.jam}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-full text-muted-foreground hover:text-foreground"
              onClick={handleShare}
              aria-label="Share team"
            >
              <Share2 className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Jam status badge */}
        {jamStatus && (
          <Badge
            variant="outline"
            className={cn(
              "mb-3 w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold",
              jamStatus.badgeClassName,
            )}
          >
            {jamStatus.label}
          </Badge>
        )}

        {/* Role tags */}
        <div className="mb-3 flex min-h-[1.75rem] flex-wrap gap-1">
          {openRolesForCard.map((role, index) => (
            <span
              key={`${role.key}-${index}`}
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                role.color,
              )}
            >
              {role.emoji} {role.label}
            </span>
          ))}
          {availableRoles.filter((r) => !r.filled).length > 4 && (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              +{availableRoles.filter((r) => !r.filled).length - 4} more
            </span>
          )}
          {isSquadFull && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              <ShieldCheck className="size-2.5" />
              Full
            </span>
          )}
        </div>

        {/* Footer: engine + language + members */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-border/40 pt-3">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Cpu className="size-3 text-lavender" aria-hidden />
              {team.engine}
            </span>
            <span className="inline-flex items-center gap-1">
              <Globe className="size-3 text-teal" aria-hidden />
              {team.language}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {!isSquadFull && remainingSpots === 1 && (
              <span className="inline-flex items-center gap-0.5 text-orange-500">
                <Flame className="size-3" aria-hidden />
                1 spot left
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Users className="size-3" aria-hidden />
              {team.members}/{team.maxMembers}
            </span>
          </div>
        </div>

        {/* Subtle "click to view" cue */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center rounded-b-xl py-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
            <Clock className="size-2.5" />
            View details
          </span>
        </div>
      </article>

      {/* Slide-over Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-hidden border-border/60 bg-card p-0 shadow-2xl shadow-teal/10 sm:max-w-md"
        >
          {sheetBody}
        </SheetContent>
      </Sheet>
    </>
  )
}
