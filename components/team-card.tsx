"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  UsersRound,
  CircleCheck,
  Share2,
  Sparkles,
  Flame,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { engineOptionLabel, languageOptionLabel } from "@/lib/constants"
import { TagIcon, TagIconRow } from "@/components/tag-icon"
import { getJamListingStatus } from "@/lib/jam-calendar-status"
import { JamStatusBadge } from "@/components/jam-status-badge"
import { JamDatesChip } from "@/components/jam-dates-chip"

type RoleBadge = {
  label: string
  color: string
  key?: string
  filled?: boolean
}

type LevelBadge = {
  label: string
  color: string
  key?: string
}

export type TeamCardData = {
  id: string
  user_id?: string
  ownerProfileExists?: boolean
  ownerUsername?: string
  ownerAvatarUrl?: string | null
  name: string
  jam: string
  engine: string
  language: string
  description: string
  members: number
  maxMembers: number
  roles: RoleBadge[]
  level: LevelBadge
  teamVibe?: { label: string; color: string; badgeColor?: string; key?: string }
  filledRoleKeys?: string[]
  jamStartDate?: string | null
  jamEndDate?: string | null
  /** Listing creation time — used to detect backfilled jam_start_date (= created_at). */
  createdAt?: string | null
  /** Linked row in external_jams — jam name links to itch.io when url is set */
  itchJam?: { title: string | null; url: string | null } | null
}

export function JamTitleBlock({
  team,
  className,
}: {
  team: TeamCardData
  className: string
}) {
  const baseClassName = "block min-w-0 max-w-full break-words"
  const label = (team.itchJam?.title?.trim() || team.jam || "").trim()
  if (!label) return null
  const url = team.itchJam?.url?.trim()
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          baseClassName,
          className,
          "relative z-10 cursor-pointer text-primary hover:underline",
        )}
      >
        {label}
      </a>
    )
  }
  return <p className={cn(baseClassName, className)}>{label}</p>
}

export function TeamCard({
  team,
  isRecommended = false,
}: {
  team: TeamCardData
  /** Mise en avant « Perfect Match » (liste recommandée). */
  isRecommended?: boolean
}) {
  const filledKeys = team.filledRoleKeys ?? []
  const jamStatus = getJamListingStatus(team.jamStartDate, team.jamEndDate, {
    createdAtIso: team.createdAt,
  })
  const showStatusBadge = jamStatus && jamStatus.phase !== "dates_pending"

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
    return { key, label: role.label, color: role.color, filled }
  })

  const isSquadFull =
    availableRoles.length > 0 && availableRoles.every((r) => r.filled)

  const remainingSpots = team.maxMembers - team.members
  const engineLabel = engineOptionLabel(team.engine)
  const languageLabel = languageOptionLabel(team.language)
  const openRoles = availableRoles.filter((r) => !r.filled)

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const title = team.name
    const openRoleLabels = openRoles.map((r) => r.label).join(", ") || "members"
    const text = `Check out ${team.name} on GameJamCrew! They are looking for: ${openRoleLabels}.`
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

  return (
    <article
      className={cn(
        "card-interactive group relative flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-[3px_3px_0_0_var(--neo-shadow)] transition-colors motion-reduce:transition-none",
        "has-[h3_a:focus-visible]:ring-2 has-[h3_a:focus-visible]:ring-ring has-[h3_a:focus-visible]:ring-offset-2 has-[h3_a:focus-visible]:ring-offset-background",
        isRecommended && "border-teal",
      )}
    >
      <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="truncate font-display text-xl font-extrabold text-foreground">
              <Link
                href={`/teams/${team.id}`}
                className="rounded-sm outline-none after:absolute after:inset-0 after:z-0 after:rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="relative z-[1]">{team.name}</span>
              </Link>
            </h3>
            {isRecommended && (
              <Badge
                variant="outline"
                aria-label="Perfect match for your profile"
                className="relative z-10 shrink-0 gap-0.5 border-teal/20 bg-teal/10 px-2 py-0 text-xs font-semibold text-teal"
              >
                <Sparkles className="size-3" aria-hidden />
                Match
              </Badge>
            )}
          </div>
          <JamTitleBlock
            team={team}
            className="mt-0.5 truncate text-sm font-medium text-primary"
          />
        </div>

        <div className="relative z-10 flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={handleShare}
            aria-label="Share squad"
          >
            <Share2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="relative z-10 mb-2 min-h-8">
        {showStatusBadge ? <JamStatusBadge status={jamStatus} /> : null}
      </div>

      <JamDatesChip
        className="relative z-[1] mb-4"
        jamStartDate={team.jamStartDate}
        jamEndDate={team.jamEndDate}
        createdAt={team.createdAt}
      />

      <div className="mb-4 flex min-h-6 flex-wrap items-center gap-2">
        <TagIconRow
          items={openRoles.map((role, index) => ({
            kind: "role" as const,
            value: role.key ?? role.label,
            key: `${role.key}-${index}`,
          }))}
        />
        {isSquadFull && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-3 py-0.5 text-xs font-semibold text-muted-foreground">
            <CircleCheck className="size-3" />
            Full
          </span>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border/40 pt-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {team.level.key ? <TagIcon kind="level" value={team.level.key} size="xs" /> : null}
          {engineLabel ? <TagIcon kind="engine" value={team.engine} size="xs" /> : null}
          {languageLabel ? <TagIcon kind="language" value={team.language} size="xs" /> : null}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {!isSquadFull && remainingSpots === 1 && (
            <span className="inline-flex items-center gap-0.5 text-orange-500">
              <Flame className="size-3.5" aria-hidden />
              1 spot left
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <UsersRound className="size-3.5" aria-hidden />
            {team.members}/{team.maxMembers}
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center rounded-b-xl py-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
          <Clock className="size-3" aria-hidden />
          View details
        </span>
      </div>
    </article>
  )
}
