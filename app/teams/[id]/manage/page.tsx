"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
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
import {
  ArrowLeft,
  Loader2,
  Settings,
  UserMinus,
  Pencil,
  Users,
  ShieldAlert,
} from "lucide-react"
import { toast } from "sonner"
import {
  ENGINE_OPTIONS,
  EXPERIENCE_OPTIONS,
  JAM_STYLE_OPTIONS,
  ROLE_STYLES,
} from "@/lib/constants"

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
  members: MemberRow[]
}

export default function TeamManagePage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string

  const [loading, setLoading] = useState(true)
  const [team, setTeam] = useState<TeamManageData | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    team_name: "",
    game_name: "",
    description: "",
    team_vibe: "",
    experience_required: "",
  })

  const loadTeam = async () => {
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
        .select("id, user_id, team_name, game_name, description, team_vibe, experience_required, engine, language")
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

      const { data: membersData } = await supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", teamId)

      const memberUserIds = (membersData ?? []).map((m: { user_id: string }) => m.user_id)

      let roleByUserId: Record<string, string> = {}
      let senderNameByUserId: Record<string, string> = {}
      let profilesByUserId: Record<string, { username: string; avatar_url: string | null }> = {}

      if (memberUserIds.length > 0) {
        const [joinRes, profilesRes] = await Promise.all([
          supabase
            .from("join_requests")
            .select("sender_id, sender_name, target_role")
            .eq("team_id", teamId)
            .eq("status", "accepted")
            .eq("type", "application")
            .in("sender_id", memberUserIds),
          supabase.from("profiles").select("id, username, avatar_url").in("id", memberUserIds),
        ])

        for (const jr of joinRes.data ?? []) {
          if (jr.sender_id) {
            if (jr.target_role) roleByUserId[jr.sender_id] = jr.target_role
            if (jr.sender_name?.trim()) senderNameByUserId[jr.sender_id] = jr.sender_name.trim()
          }
        }
        for (const p of profilesRes.data ?? []) {
          if (p.id) {
            profilesByUserId[p.id] = {
              username: p.username?.trim() || "Unknown",
              avatar_url: p.avatar_url ?? null,
            }
          }
        }
      }

      const members: MemberRow[] = (membersData ?? []).map((m: { user_id: string }) => {
        const profile = profilesByUserId[m.user_id]
        const displayName =
          profile?.username ||
          senderNameByUserId[m.user_id] ||
          "Unknown"
        return {
          user_id: m.user_id,
          username: displayName,
          avatar_url: profile?.avatar_url ?? null,
          target_role: roleByUserId[m.user_id] ?? null,
        }
      })

      setTeam({
        ...teamData,
        members,
      })
      setEditForm({
        team_name: teamData.team_name ?? "",
        game_name: teamData.game_name ?? "",
        description: teamData.description ?? "",
        team_vibe: teamData.team_vibe ?? "",
        experience_required: teamData.experience_required ?? "",
      })
    } catch (err) {
      toast.error("Error loading team.", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeam()
  }, [teamId])

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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditSaving(true)
    try {
      const { error } = await supabase
        .from("teams")
        .update({
          team_name: editForm.team_name.trim() || undefined,
          game_name: editForm.game_name.trim() || undefined,
          description: editForm.description.trim() || undefined,
          team_vibe: editForm.team_vibe || null,
          experience_required:
            editForm.experience_required && editForm.experience_required !== "any"
              ? editForm.experience_required
              : null,
        })
        .eq("id", teamId)

      if (error) {
        toast.error("Could not update team.", { description: error.message })
        return
      }

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
        <Footer tagline="Connect, create, and ship games together." />
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
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 rounded-xl">
                    <Pencil className="size-4" />
                    Edit Team Info
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Team Info</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
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
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditOpen(false)}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={editSaving} className="rounded-xl">
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
                              user={{ username: member.username, avatar_url: member.avatar_url }}
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
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer tagline="Connect, create, and ship games together." />
    </div>
  )
}
