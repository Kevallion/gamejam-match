"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Globe, Cpu, Users, Trash2, PenLine, Rocket, Link2 } from "lucide-react"
import Link from "next/link"

const DISCORD_LINK_REGEX = /^https:\/\/(discord\.gg\/|discord\.com\/invite\/)/i

function isValidDiscordLink(url: string): boolean {
  if (!url.trim()) return false
  return DISCORD_LINK_REGEX.test(url.trim())
}

export type TeamData = {
  id: string
  name: string
  jam: string
  engine: string
  language: string
  description: string
  members: number
  maxMembers: number
  roles: { label: string; emoji: string; color: string }[]
  level: { label: string; emoji: string; color: string }
  discord_link?: string | null
}

interface DashboardMyTeamsProps {
  teams: TeamData[]
  onDelete: (id: string) => void
  onUpdateDiscord: (id: string, discordLink: string) => Promise<void>
}

export function DashboardMyTeams({
  teams,
  onDelete,
  onUpdateDiscord,
}: DashboardMyTeamsProps) {
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [discordInputValue, setDiscordInputValue] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpenChange = (open: boolean, team: TeamData) => {
    if (open) {
      setEditingTeamId(team.id)
      setDiscordInputValue(team.discord_link || "")
      setSubmitError(null)
    } else {
      setEditingTeamId(null)
      setSubmitError(null)
    }
  }

  const handleSubmitDiscord = async (e: React.FormEvent, teamId: string) => {
    e.preventDefault()
    setSubmitError(null)
    const trimmed = discordInputValue.trim()
    if (!isValidDiscordLink(trimmed)) {
      setSubmitError(
        "The link must start with https://discord.gg/ or https://discord.com/invite/"
      )
      return
    }
    setIsSubmitting(true)
    try {
      await onUpdateDiscord(teamId, trimmed)
      setEditingTeamId(null)
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Error updating"
      )
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">
            My Teams
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Teams you{"'"}ve created or joined
          </p>
        </div>
        <Button
          asChild
          className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/85"
        >
          <Link href="/create-team">
            <Rocket className="size-4" />
            Create New Team
          </Link>
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 rounded-2xl border-border/50 bg-card px-6 py-12 text-center">
          <PenLine className="size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            You haven{"'"}t created any teams yet.
          </p>
          <Button
            asChild
            variant="outline"
            className="mt-2 gap-2 rounded-xl border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
          >
            <Link href="/create-team">Post your first team</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card
              key={team.id}
              className="group relative flex flex-col rounded-2xl border-border/50 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <CardHeader className="gap-3 pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-bold text-foreground">
                      {team.name}
                    </h3>
                    <p className="mt-0.5 text-sm font-medium text-primary">
                      {team.jam}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 rounded-full border-border/60 text-xs text-muted-foreground"
                  >
                    <Users className="mr-1 size-3" />
                    {team.members}/{team.maxMembers}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-3 pt-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Cpu className="size-3.5 text-lavender" />
                    {team.engine}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Globe className="size-3.5 text-teal" />
                    {team.language}
                  </span>
                </div>

                <p className="flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {team.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${team.level.color}`}
                  >
                    {team.level.emoji} {team.level.label}
                  </span>
                  {team.roles.map((role, roleIdx) => (
                    <span
                      key={`${role.label}-${roleIdx}`}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${role.color}`}
                    >
                      {role.emoji} {role.label}
                    </span>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-2">
                <Dialog
                  open={editingTeamId === team.id}
                  onOpenChange={(open) => handleOpenChange(open, team)}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full gap-2 rounded-xl border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                    >
                      <Link2 className="size-4" />
                      Edit Discord
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Discord Link</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => handleSubmitDiscord(e, team.id)}
                      className="flex flex-col gap-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="discord-link">Discord invite link</Label>
                        <Input
                          id="discord-link"
                          type="url"
                          placeholder="https://discord.gg/..."
                          value={discordInputValue}
                          onChange={(e) => setDiscordInputValue(e.target.value)}
                          disabled={isSubmitting}
                          aria-invalid={!!submitError}
                        />
                        {submitError && (
                          <p className="text-sm text-destructive">{submitError}</p>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="gap-2 rounded-xl"
                        >
                          {isSubmitting ? "Saving…" : "Save"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  onClick={() => onDelete(team.id)}
                  className="w-full gap-2 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Delete Team
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}