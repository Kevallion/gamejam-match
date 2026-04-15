"use client"

import { useCallback, useEffect, useState } from "react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { fetchProfilesMap } from "@/lib/profiles"
import {
  ArrowLeft,
  CalendarClock,
  Loader2,
  Settings,
  UserMinus,
  Pencil,
  RotateCw,
  Trash2,
  Users,
  ShieldAlert,
  MessageCircle,
  Link2,
  Trophy,
  Plus,
  X,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { JamSearchSelector } from "@/components/jam-search-selector"
import {
  notifyMemberDiscordLink,
  notifyPlayerKicked,
  notifyTeamDiscordUpdated,
} from "@/app/actions/team-actions"
import { claimTeamJamCompletedXp } from "@/app/actions/team-gamification-actions"
import { updateTeamJamListing } from "@/app/actions/create-team-actions"
import { dateInputToUtcEnd, dateInputToUtcStart, isoTimestampToDateInput } from "@/lib/jam-date-utc"
import { showGamificationRewards } from "@/components/gamification-reward-toasts"
import { gamificationRewardHasToast } from "@/lib/gamification-reward-types"
import { EXPERIENCE_OPTIONS, JAM_STYLE_OPTIONS, ROLE_OPTIONS, ROLE_STYLES } from "@/lib/constants"
import { DateRangeField } from "@/components/date-range-field"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const DISCORD_LINK_REGEX = /^https:\/\/(discord\.gg\/|discord\.com\/invite\/)/i

function ymdToLocalDate(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number)
  return new Date(y, m - 1, d)
}

type MemberRow = {
  user_id: string
  username: string
  avatar_url: string | null
  target_role: string | null
}

type TeamManageData = {
  id: string
  user_id: string
  team_name: string
  game_name: string
  description: string
  team_vibe: string | null
  experience_required: string | null
  engine: string
  language: string
  jam_id: string | null
  discord_link: string | null
  jam_start_date: string | null
  jam_end_date: string | null
  jam_completion_xp_claimed?: boolean | null
  looking_for: { role: string; level: string }[]
  members: MemberRow[]
}

type EditableRoleEntry = {
  id: number
  role: string
  level: string
}

type LookingForEntryInput = {
  role?: string | null
  level?: string | null
}

let editableRoleIdCounter = 1

function nextEditableRoleId() {
  return editableRoleIdCounter++
}

export default function TeamManagePage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string

  const [loading, setLoading] = useState(true)
  const [team, setTeam] = useState<TeamManageData | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)
  const [sendingDiscordToUserId, setSendingDiscordToUserId] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    team_name: "",
    game_name: "",
    description: "",
    team_vibe: "",
    experience_required: "",
    jam_id: null as string | null,
    jam_start_date: "",
    jam_end_date: "",
    looking_for: [{ id: nextEditableRoleId(), role: "", level: "" }] as EditableRoleEntry[],
  })
  const [editRolesError, setEditRolesError] = useState("")
  const [discordInput, setDiscordInput] = useState("")
  const [discordSaving, setDiscordSaving] = useState(false)
  const [discordError, setDiscordError] = useState<string | null>(null)
  const [jamXpClaimBusy, setJamXpClaimBusy] = useState(false)
  const [editJamRange, setEditJamRange] = useState<DateRange | undefined>(undefined)
  const [renewListingBusy, setRenewListingBusy] = useState(false)
  const [deleteTeamDialogOpen, setDeleteTeamDialogOpen] = useState(false)
  const [deleteTeamBusy, setDeleteTeamBusy] = useState(false)

  const loadTeam = useCallback(async () => {
    if (!teamId) return
    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push("/dashboard")
        return
      }

      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select(
          "id, user_id, team_name, game_name, description, team_vibe, experience_required, engine, language, jam_id, discord_link, jam_completion_xp_claimed, jam_start_date, jam_end_date, looking_for",
        )
        .eq("id", teamId)
        .single()

      if (teamError || !teamData) {
        toast.error("Team not found.")
        router.push("/dashboard")
        return
      }

      if (teamData.user_id !== session.user.id) {
        setIsOwner(false)
        setTeam(null)
        setLoading(false)
        return
      }

      setIsOwner(true)
      setCurrentUserId(session.user.id)

      const { data: membersData } = await supabase
        .from("team_members")
        .select("user_id, role")
        .eq("team_id", teamId)

      const memberUserIds = (membersData ?? []).map(
        (m: { user_id: string; role?: string | null }) => m.user_id,
      )

      const roleByUserId: Record<string, string> = {}
      const senderNameByUserId: Record<string, string> = {}

      const [joinRes, profilesByUserId] = await Promise.all([
        memberUserIds.length > 0
          ? supabase
              .from("join_requests")
              .select("sender_id, sender_name, target_role, status, type")
              .eq("team_id", teamId)
              .eq("status", "accepted")
              .in("sender_id", memberUserIds)
          : Promise.resolve({ data: [] as { sender_id?: string; sender_name?: string; target_role?: string }[] }),
        fetchProfilesMap(memberUserIds),
      ])

      for (const jr of joinRes.data ?? []) {
        if (jr.sender_id) {
          if (jr.target_role) roleByUserId[jr.sender_id] = jr.target_role
          if (jr.sender_name?.trim()) senderNameByUserId[jr.sender_id] = jr.sender_name.trim()
        }
      }

      const members: MemberRow[] = (membersData ?? []).map(
        (m: { user_id: string; role?: string | null }) => {
          const profile = profilesByUserId[m.user_id]
          const displayName =
            (profile?.username?.trim()) ||
            senderNameByUserId[m.user_id] ||
            "Unknown"

          const membershipRole = (m.role ?? "").trim() || null
          const finalRole = membershipRole ?? roleByUserId[m.user_id] ?? null

          return {
            user_id: m.user_id,
            username: displayName,
            avatar_url: profile?.avatar_url ?? null,
            target_role: finalRole,
          }
        },
      )

      const td = teamData as TeamManageData & { jam_completion_xp_claimed?: boolean | null }
      setTeam({
        ...teamData,
        jam_start_date: td.jam_start_date ?? null,
        jam_end_date: td.jam_end_date ?? null,
        jam_completion_xp_claimed: td.jam_completion_xp_claimed,
        members,
      })
      setEditForm({
        team_name: teamData.team_name ?? "",
        game_name: teamData.game_name ?? "",
        description: teamData.description ?? "",
        team_vibe: teamData.team_vibe ?? "",
        experience_required: teamData.experience_required ?? "",
        jam_id: (teamData as { jam_id?: string | null }).jam_id ?? null,
        jam_start_date: isoTimestampToDateInput(td.jam_start_date),
        jam_end_date: isoTimestampToDateInput(td.jam_end_date),
        looking_for:
          (teamData.looking_for ?? []).length > 0
            ? (teamData.looking_for ?? []).map((entry: LookingForEntryInput) => ({
                id: nextEditableRoleId(),
                role: entry.role ?? "",
                level: entry.level ?? "",
              }))
            : [{ id: nextEditableRoleId(), role: "", level: "" }],
      })
      setEditRolesError("")
      setDiscordInput(teamData.discord_link ?? "")
      setDiscordError(null)
    } catch (err) {
      toast.error("Error loading team.", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }, [teamId, router])

  useEffect(() => {
    void loadTeam()
  }, [loadTeam])

  const handleRemoveMember = async (userId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this member? They will lose access to the team."
      )
    )
      return

    setRemovingUserId(userId)
    try {
      const { error: deleteError } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", userId)

      if (deleteError) {
        toast.error("Could not remove member.", { description: deleteError.message })
        return
      }

      const { error: updateError } = await supabase
        .from("join_requests")
        .update({ status: "rejected" })
        .eq("team_id", teamId)
        .eq("sender_id", userId)
        .eq("type", "application")

      if (updateError) {
        toast.error("Member removed but status sync failed.", {
          description: updateError.message,
        })
      }

      setTeam((prev) =>
        prev ? { ...prev, members: prev.members.filter((m) => m.user_id !== userId) } : null
      )

      if (team?.team_name) {
        void notifyPlayerKicked(userId, team.team_name, teamId, currentUserId)
      }

      toast.success("Member removed.", {
        description: "The slot is now available for new applicants.",
      })
    } catch (err) {
      toast.error("An error occurred.", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setRemovingUserId(null)
    }
  }

  const handleClaimJamCompletionXp = async () => {
    if (
      !teamId ||
      !window.confirm(
        "Claim one-time rewards for finishing a jam with this squad? You can only do this once per team listing.",
      )
    ) {
      return
    }
    setJamXpClaimBusy(true)
    try {
      const result = await claimTeamJamCompletedXp(teamId)
      if (!result.success) {
        toast.error("Could not claim reward.", { description: result.error })
        return
      }
      setTeam((prev) => (prev ? { ...prev, jam_completion_xp_claimed: true } : prev))
      if (result.gamification && gamificationRewardHasToast(result.gamification)) {
        showGamificationRewards("TEAM_COMPLETED", result.gamification)
      } else {
        toast.success("Rewards claimed!")
      }
    } catch (err) {
      toast.error("Something went wrong.", {
        description: err instanceof Error ? err.message : "Try again later.",
      })
    } finally {
      setJamXpClaimBusy(false)
    }
  }

  const handleSendDiscordLink = async (userId: string) => {
    if (!team?.discord_link) {
      toast.error("No Discord link configured for this team.", {
        description: "You can set one on this Manage Team page.",
      })
      return
    }

    setSendingDiscordToUserId(userId)
    try {
      await notifyMemberDiscordLink(userId, team.team_name, team.discord_link)
      toast.success("Discord link sent.", {
        description: "The member has received the Discord invite by email.",
      })
    } catch (err) {
      toast.error("Could not send Discord link.", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setSendingDiscordToUserId(null)
    }
  }

  const addEditableRole = () => {
    setEditRolesError("")
    setEditForm((prev) => ({
      ...prev,
      looking_for: [...prev.looking_for, { id: nextEditableRoleId(), role: "", level: "" }],
    }))
  }

  const removeEditableRole = (id: number) => {
    setEditRolesError("")
    setEditForm((prev) => {
      if (prev.looking_for.length <= 1) return prev
      return { ...prev, looking_for: prev.looking_for.filter((entry) => entry.id !== id) }
    })
  }

  const updateEditableRole = (id: number, field: "role" | "level", value: string) => {
    setEditRolesError("")
    setEditForm((prev) => ({
      ...prev,
      looking_for: prev.looking_for.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    }))
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditSaving(true)
    try {
      const cleanLookingFor = editForm.looking_for.filter((entry) => entry.role && entry.level)
      if (cleanLookingFor.length < 1) {
        setEditRolesError("Please select at least one role you are looking for.")
        toast.error("Please complete team requirements.", {
          description: "At least one role is required.",
        })
        return
      }

      const currentFilledRoleKeys = team?.members
        .map((m) => (m.target_role ?? "").trim().toLowerCase())
        .filter(Boolean) as string[]
      const currentFilledCountByKey: Record<string, number> = {}
      for (const roleKey of currentFilledRoleKeys) {
        currentFilledCountByKey[roleKey] = (currentFilledCountByKey[roleKey] ?? 0) + 1
      }
      const nextCountByKey: Record<string, number> = {}
      for (const entry of cleanLookingFor) {
        const roleKey = entry.role.trim().toLowerCase()
        nextCountByKey[roleKey] = (nextCountByKey[roleKey] ?? 0) + 1
      }
      const removedFilledRole = Object.entries(currentFilledCountByKey).find(([roleKey, filledCount]) => {
        const nextCount = nextCountByKey[roleKey] ?? 0
        return nextCount < filledCount
      })
      if (removedFilledRole) {
        toast.error("Cannot remove a filled role.", {
          description: "Remove or reassign the member first, then update roles.",
        })
        return
      }

      if (!editForm.jam_start_date || !editForm.jam_end_date) {
        toast.error("Jam dates required.", {
          description: "Please specify the Jam dates to keep your team visible.",
        })
        return
      }
      const startMs = new Date(dateInputToUtcStart(editForm.jam_start_date)).getTime()
      const endMs = new Date(dateInputToUtcEnd(editForm.jam_end_date)).getTime()
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs >= endMs) {
        toast.error("Invalid jam dates.", { description: "Jam end must be after jam start." })
        return
      }

      const result = await updateTeamJamListing({
        teamId,
        teamName: editForm.team_name.trim(),
        gameName: editForm.game_name.trim(),
        description: editForm.description.trim(),
        teamVibe: editForm.team_vibe || null,
        experienceRequired:
          editForm.experience_required && editForm.experience_required !== "any"
            ? editForm.experience_required
            : null,
        lookingFor: cleanLookingFor,
        jamId: editForm.jam_id || null,
        jamStartDate: dateInputToUtcStart(editForm.jam_start_date),
        jamEndDate: dateInputToUtcEnd(editForm.jam_end_date),
      })

      if (!result.success) {
        toast.error("Could not update team.", { description: result.error })
        return
      }

      const jamStartIso = dateInputToUtcStart(editForm.jam_start_date)
      const jamEndIso = dateInputToUtcEnd(editForm.jam_end_date)
      setTeam((prev) =>
        prev
          ? {
              ...prev,
              team_name: editForm.team_name.trim(),
              game_name: editForm.game_name.trim(),
              description: editForm.description.trim(),
              team_vibe: editForm.team_vibe || null,
              experience_required:
                editForm.experience_required && editForm.experience_required !== "any"
                  ? editForm.experience_required
                  : null,
              looking_for: cleanLookingFor,
              jam_id: editForm.jam_id || null,
              jam_start_date: jamStartIso,
              jam_end_date: jamEndIso,
            }
          : null
      )
      setEditOpen(false)
      toast.success("Team updated.", { description: "Your changes have been saved." })
    } catch (err) {
      toast.error("An error occurred.", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setEditSaving(false)
    }
  }

  const handleRenewListing = async () => {
    if (!team) return
    const currentEndMs = team.jam_end_date ? new Date(team.jam_end_date).getTime() : NaN
    const baseMs = Number.isFinite(currentEndMs) ? Math.max(Date.now(), currentEndMs) : Date.now()
    const newEnd = new Date(baseMs + 30 * 24 * 60 * 60 * 1000).toISOString()
    setRenewListingBusy(true)
    try {
      const { error } = await supabase.from("teams").update({ jam_end_date: newEnd }).eq("id", teamId)
      if (error) {
        toast.error("Could not renew listing.", { description: error.message })
        return
      }
      const dateInputEnd = isoTimestampToDateInput(newEnd)
      setTeam((prev) => (prev ? { ...prev, jam_end_date: newEnd } : null))
      setEditForm((p) => ({ ...p, jam_end_date: dateInputEnd }))
      toast.success("Listing renewed.", {
        description: "Your jam end date was extended by 30 days; the listing stays in sync.",
      })
    } catch (err) {
      toast.error("An error occurred.", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setRenewListingBusy(false)
    }
  }

  const handleConfirmDeleteTeam = async () => {
    setDeleteTeamBusy(true)
    try {
      const { error } = await supabase.from("teams").delete().eq("id", teamId)
      if (error) {
        toast.error("Could not delete the team.", { description: error.message })
        return
      }
      setDeleteTeamDialogOpen(false)
      toast.success("Team deleted.")
      router.push("/dashboard")
    } catch (err) {
      toast.error("An error occurred.", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setDeleteTeamBusy(false)
    }
  }

  const handleDiscordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDiscordError(null)
    const trimmed = discordInput.trim()

    if (trimmed && !DISCORD_LINK_REGEX.test(trimmed)) {
      setDiscordError(
        "The link must start with https://discord.gg/ or https://discord.com/invite/",
      )
      return
    }

    setDiscordSaving(true)
    const previousLink = team?.discord_link ?? null
    try {
      const { error } = await supabase
        .from("teams")
        .update({ discord_link: trimmed || null })
        .eq("id", teamId)

      if (error) {
        toast.error("Could not update Discord link.", { description: error.message })
        return
      }

      setTeam((prev) =>
        prev
          ? {
              ...prev,
              discord_link: trimmed || null,
            }
          : prev,
      )

      // Notifier les membres uniquement lorsqu'un lien Discord valide est défini ou modifié
      if (trimmed && trimmed !== previousLink && team?.team_name) {
        void notifyTeamDiscordUpdated(teamId, team.team_name)
      }

      toast.success("Discord link updated.", {
        description: trimmed
          ? "Members can now join your squad's Discord."
          : "Discord link removed from this team.",
      })
    } catch (err) {
      toast.error("An error occurred.", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setDiscordSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isOwner || !team) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 px-4 py-16 lg:px-6">
          <div className="mx-auto max-w-2xl">
            <Card className="rounded-2xl border-destructive/50 bg-destructive/10">
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <ShieldAlert className="size-12 text-destructive" />
                <h1 className="text-xl font-bold text-foreground">Access denied</h1>
                <p className="text-muted-foreground">
                  Only the team owner can manage this team.
                </p>
                <Button asChild variant="outline" className="gap-2 rounded-xl">
                  <Link href="/dashboard">
                    <ArrowLeft className="size-4" />
                    Back to Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden px-4 pb-8 pt-16 lg:px-6 lg:pt-24 lg:pb-12">
          <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
            <div className="absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-peach/20 blur-[120px]" />
            <div className="absolute right-0 top-1/2 size-[400px] -translate-y-1/2 rounded-full bg-teal/15 blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-4xl">
            <Button
              asChild
              variant="ghost"
              className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
            >
              <Link href="/dashboard">
                <ArrowLeft className="size-4" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Settings className="size-4" />
              Team Management
            </div>
            <h1 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              {team.team_name}
            </h1>
            <p className="mt-2 text-muted-foreground">{team.game_name}</p>
          </div>
        </section>

        <section className="px-4 pb-16 pt-4 lg:px-6 lg:pb-24">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-foreground">Edit Team Info</h2>
              <Dialog
                open={editOpen}
                onOpenChange={(open) => {
                  setEditOpen(open)
                  if (open) {
                    setEditJamRange(
                      editForm.jam_start_date && editForm.jam_end_date
                        ? {
                            from: ymdToLocalDate(editForm.jam_start_date),
                            to: ymdToLocalDate(editForm.jam_end_date),
                          }
                        : undefined,
                    )
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2 rounded-xl">
                    <Pencil className="size-4" />
                    Edit Team Info
                  </Button>
                </DialogTrigger>
                <DialogContent className="flex h-[82dvh] w-[calc(100vw-1rem)] max-w-2xl flex-col rounded-2xl p-0 sm:w-full">
                  <DialogHeader>
                    <DialogTitle className="px-4 pt-5 sm:px-6">Edit Team Info</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEditSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4 sm:px-6">
                    <div className="space-y-2">
                      <Label htmlFor="team_name">Team / Project Name</Label>
                      <Input
                        id="team_name"
                        value={editForm.team_name}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, team_name: e.target.value }))
                        }
                        placeholder="e.g. The Pixel Knights"
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="game_name">Game Jam Name</Label>
                      <Input
                        id="game_name"
                        value={editForm.game_name}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, game_name: e.target.value }))
                        }
                        placeholder="e.g. Ludum Dare 57"
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Itch.io Jam (optional)</Label>
                      <JamSearchSelector
                        value={editForm.jam_id}
                        onValueChange={(jamId) =>
                          setEditForm((prev) => ({ ...prev, jam_id: jamId }))
                        }
                        placeholder="Choose an Itch.io jam…"
                        syncOnOpen={true}
                        activeOnly={true}
                      />
                    </div>
                    <DateRangeField
                      label="Jam date range"
                      value={editJamRange}
                      onChange={(r) => {
                        setEditJamRange(r)
                        setEditForm((p) => ({
                          ...p,
                          jam_start_date: r?.from ? format(r.from, "yyyy-MM-dd") : "",
                          jam_end_date: r?.to
                            ? format(r.to, "yyyy-MM-dd")
                            : r?.from
                              ? p.jam_end_date
                              : "",
                        }))
                      }}
                      placeholder="Choose jam start and end dates"
                      drawerTitle="When does your jam run?"
                      dateFormat="long"
                      numberOfMonthsDesktop={1}
                      helperText="Required for your listing to stay visible. End date controls when the squad is archived."
                    />
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Tell people about your project..."
                        rows={4}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Jam Style</Label>
                      <Select
                        value={editForm.team_vibe || "any"}
                        onValueChange={(v) =>
                          setEditForm((prev) => ({
                            ...prev,
                            team_vibe: v === "any" ? "" : v,
                          }))
                        }
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select vibe" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="any">Any</SelectItem>
                          {JAM_STYLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.emoji} {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Experience Required</Label>
                      <Select
                        value={editForm.experience_required || "any"}
                        onValueChange={(v) =>
                          setEditForm((prev) => ({
                            ...prev,
                            experience_required: v === "any" ? "" : v,
                          }))
                        }
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="any">Any level</SelectItem>
                          {EXPERIENCE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.emoji} {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Roles Needed</Label>
                        <span className="text-xs text-muted-foreground">
                          {editForm.looking_for.length} role{editForm.looking_for.length > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex flex-col gap-3">
                        {editForm.looking_for.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 sm:flex-row sm:items-center"
                          >
                            <Select
                              value={entry.role}
                              onValueChange={(value) => updateEditableRole(entry.id, "role", value)}
                            >
                              <SelectTrigger className="rounded-xl sm:flex-1">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                {ROLE_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={entry.level}
                              onValueChange={(value) => updateEditableRole(entry.id, "level", value)}
                            >
                              <SelectTrigger className="rounded-xl sm:flex-1">
                                <SelectValue placeholder="Experience" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                {EXPERIENCE_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.emoji} {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {editForm.looking_for.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="self-end rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:self-auto"
                                onClick={() => removeEditableRole(entry.id)}
                              >
                                <X className="size-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-fit gap-2 rounded-xl"
                        onClick={addEditableRole}
                      >
                        <Plus className="size-4" />
                        Add role
                      </Button>
                      {editRolesError && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="size-4 shrink-0" />
                          <span>{editRolesError}</span>
                        </div>
                      )}
                    </div>
                    </div>
                    <DialogFooter className="mt-auto flex-col gap-2 border-t border-border/60 bg-background px-4 py-3 sm:flex-row sm:justify-end sm:px-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditOpen(false)}
                        className="w-full rounded-xl sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={editSaving} className="w-full rounded-xl sm:w-auto">
                        {editSaving ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="rounded-2xl border-border/50">
              <CardHeader>
                <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <Users className="size-5" />
                  Members ({team.members.length} accepted)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Jammers who have been accepted into your team. Removing a member frees their slot
                  for new applicants.
                </p>
              </CardHeader>
              <CardContent>
                {team.members.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-6 py-10 text-center text-sm text-muted-foreground">
                    No members yet. Accept applications from your dashboard to add members.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {team.members.map((member) => {
                      const roleStyle = member.target_role
                        ? ROLE_STYLES[member.target_role] ?? {
                            label: member.target_role,
                            emoji: "🎭",
                            color: "bg-muted text-muted-foreground",
                          }
                        : null
                      return (
                        <div
                          key={member.user_id}
                          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/50 bg-card/50 px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              src={member.avatar_url}
                              fallbackName={member.username ?? "?"}
                              size="xs"
                            />
                            <div>
                              <p className="font-semibold text-foreground">{member.username}</p>
                              {roleStyle && (
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${roleStyle.color}`}
                                >
                                  {roleStyle.emoji} {roleStyle.label}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {team.discord_link && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 rounded-xl border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
                                onClick={() => handleSendDiscordLink(member.user_id)}
                                disabled={sendingDiscordToUserId === member.user_id}
                              >
                                {sendingDiscordToUserId === member.user_id ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <MessageCircle className="size-4" />
                                )}
                                Send Discord link
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 rounded-xl border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleRemoveMember(member.user_id)}
                              disabled={removingUserId === member.user_id}
                            >
                              {removingUserId === member.user_id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <UserMinus className="size-4" />
                              )}
                              Remove Member
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {isOwner && team && !team.jam_completion_xp_claimed ? (
              <Card className="rounded-2xl border-border/50 border-teal/25 bg-gradient-to-br from-teal/10 via-transparent to-lavender/5">
                <CardHeader>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <Trophy className="size-5 text-teal" />
                    Jam complete
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Finished a game jam with this squad? Claim a one-time XP bonus and the &quot;Jam Champion&quot;
                    title. This can only be done once per team listing.
                  </p>
                </CardHeader>
                <CardContent>
                  <Button
                    type="button"
                    variant="secondary"
                    className="gap-2 rounded-xl"
                    disabled={jamXpClaimBusy}
                    onClick={() => void handleClaimJamCompletionXp()}
                  >
                    {jamXpClaimBusy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trophy className="size-4" />
                    )}
                    Claim jam rewards (+150 XP)
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            <Card className="rounded-2xl border-border/50">
              <CardHeader>
                <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <CalendarClock className="size-5 text-primary" />
                  Listing visibility
                </h3>
                <p className="text-sm text-muted-foreground">
                  Extend your jam end date to keep the squad discoverable, or delete the listing
                  permanently.
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary/10 hover:text-primary sm:flex-1"
                  disabled={renewListingBusy}
                  onClick={() => void handleRenewListing()}
                >
                  <RotateCw className={`size-3.5 ${renewListingBusy ? "animate-spin" : ""}`} />
                  {renewListingBusy ? "Renewing…" : "Renew listing"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-1"
                  onClick={() => setDeleteTeamDialogOpen(true)}
                >
                  <Trash2 className="size-3.5" />
                  Delete team
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50">
              <CardHeader>
                <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <Link2 className="size-5" />
                  Discord Link
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configure the Discord invite link that members can use to join your squad.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDiscordSubmit} className="flex flex-col gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="discord-link-manage">Discord invite link</Label>
                    <Input
                      id="discord-link-manage"
                      type="url"
                      placeholder="https://discord.gg/..."
                      value={discordInput}
                      onChange={(e) => setDiscordInput(e.target.value)}
                      aria-invalid={!!discordError}
                      className="rounded-xl"
                    />
                    {discordError && (
                      <p className="text-sm text-destructive">{discordError}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Leave empty to remove the Discord link from this team.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={discordSaving}
                      className="gap-2 rounded-xl"
                    >
                      {discordSaving ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Discord link"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <AlertDialog open={deleteTeamDialogOpen} onOpenChange={setDeleteTeamDialogOpen}>
        <AlertDialogContent className="glass-card rounded-2xl border-border/40">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/15">
                <Trash2 className="size-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-left">Delete this team?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              This action cannot be undone. The team listing will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:justify-end">
            <AlertDialogCancel className="rounded-xl" disabled={deleteTeamBusy}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="inline-flex gap-2 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteTeamBusy}
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmDeleteTeam()
              }}
            >
              {deleteTeamBusy ? (
                <>
                  <Loader2 className="size-4 shrink-0 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
