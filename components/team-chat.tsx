"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserAvatar } from "@/components/user-avatar"
import { supabase } from "@/lib/supabase"
import { fetchProfilesMap } from "@/lib/profiles"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Loader2, MessageCircle, SendHorizontal } from "lucide-react"
import { notifyTeamChatNewMessage } from "@/app/actions/team-actions"

type TeamChatProps = {
  teamId: string
  currentUserId: string
}

type ChatMessage = {
  id: string
  team_id: string
  sender_id: string
  content: string
  created_at: string
  sender_username: string
  sender_avatar_url: string | null
  sender_role: string | null
}

export function TeamChat({ teamId, currentUserId }: TeamChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [leaderUserId, setLeaderUserId] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const profilesCacheRef = useRef<Map<string, { username: string; avatar_url: string | null }>>(
    new Map()
  )
  const rolesCacheRef = useRef<Map<string, string | null>>(new Map())

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }

  type MessageRow = {
    id: string
    team_id: string
    sender_id: string
    content: string
    created_at: string
  }

  const buildMessageFromRow = useCallback(
    (row: MessageRow): ChatMessage => {
      const profile = profilesCacheRef.current.get(row.sender_id) ?? {
        username: "Unknown",
        avatar_url: null,
      }

      const rawRole = rolesCacheRef.current.get(row.sender_id) ?? null
      const isLeader = leaderUserId != null && row.sender_id === leaderUserId
      const roleLabel = isLeader ? "Leader" : rawRole

      return {
        id: row.id,
        team_id: row.team_id,
        sender_id: row.sender_id,
        content: row.content,
        created_at: row.created_at,
        sender_username: profile.username?.trim() || "Unknown",
        sender_avatar_url: profile.avatar_url ?? null,
        sender_role: roleLabel,
      }
    },
    [leaderUserId],
  )

  const hydrateProfiles = async (senderIds: string[]) => {
    const uniqueIds = Array.from(new Set(senderIds)).filter(Boolean)
    const missingIds = uniqueIds.filter((id) => !profilesCacheRef.current.has(id))

    if (missingIds.length === 0) return

    const map = await fetchProfilesMap(missingIds)
    for (const [id, p] of Object.entries(map)) {
      profilesCacheRef.current.set(id, {
        username: p.username || "Unknown",
        avatar_url: p.avatar_url,
      })
    }
  }

  const hydrateRoles = async (userIds: string[]) => {
    const uniqueIds = Array.from(new Set(userIds)).filter(Boolean)
    const missingIds = uniqueIds.filter((id) => !rolesCacheRef.current.has(id))

    if (missingIds.length === 0) return

    const { data, error } = await supabase
      .from("team_members")
      .select("user_id, role")
      .eq("team_id", teamId)
      .in("user_id", missingIds)

    if (error) {
      // Non-blocking: we can still show messages without role labels
      return
    }

    for (const row of data ?? []) {
      rolesCacheRef.current.set(row.user_id, row.role ?? null)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadInitialMessages = async () => {
      setLoading(true)
      try {
        const [{ data: teamRow }, { data, error }] = await Promise.all([
          supabase
            .from("teams")
            .select("id, user_id")
            .eq("id", teamId)
            .maybeSingle(),
          supabase
            .from("team_messages")
            .select("id, team_id, sender_id, content, created_at")
            .eq("team_id", teamId)
            .order("created_at", { ascending: true })
            .limit(50),
        ])

        if (teamRow?.user_id) {
          setLeaderUserId(teamRow.user_id)
        }

        if (error) {
          toast.error("Could not load squad messages.", {
            description: error.message,
          })
          if (isMounted) setMessages([])
          return
        }

        const rows = (data ?? []) as MessageRow[]
        const senderIds = rows.map((r) => r.sender_id)
        await Promise.all([hydrateProfiles(senderIds), hydrateRoles(senderIds)])

        if (!isMounted) return

        const enriched = rows.map((row) => buildMessageFromRow(row))
        setMessages(enriched)
        // Scroll to bottom after initial load
        setTimeout(scrollToBottom, 50)
      } catch (err) {
        if (!isMounted) return
        toast.error("Error loading chat.", {
          description: err instanceof Error ? err.message : "Please try again.",
        })
        setMessages([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadInitialMessages()

    return () => {
      isMounted = false
    }
  }, [teamId, buildMessageFromRow])

  useEffect(() => {
    const channel = supabase
      .channel(`team-chat-${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "team_messages",
          filter: `team_id=eq.${teamId}`,
        },
        async (payload) => {
          const row = payload.new as MessageRow
          if (!row?.id) return

          await Promise.all([hydrateProfiles([row.sender_id]), hydrateRoles([row.sender_id])])
          const msg = buildMessageFromRow(row)

          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev
            const next = [...prev, msg]
            return next.length > 50 ? next.slice(next.length - 50) : next
          })

          scrollToBottom()
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // No-op: successfully subscribed
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [teamId, buildMessageFromRow])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newMessage.trim()
    if (!trimmed || !currentUserId) return

    setSending(true)
    try {
      const { error } = await supabase.from("team_messages").insert({
        team_id: teamId,
        sender_id: currentUserId,
        content: trimmed,
      })

      if (error) {
        toast.error("Could not send message.", {
          description: error.message,
        })
        return
      }

      // Trigger async notifications (in-app + throttled email)
      void notifyTeamChatNewMessage(teamId, currentUserId)

      setNewMessage("")
    } catch (err) {
      toast.error("Error while sending message.", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-5 text-primary" />
          <div>
            <h3 className="text-base font-semibold text-foreground">Squad chat</h3>
            <p className="text-xs text-muted-foreground">
              Chat with your squad directly here.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="relative">
          <ScrollArea className="h-72 rounded-xl border border-border/60 bg-background/40 p-3">
            {loading ? (
              <div className="flex h-full items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading chat...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-xs text-muted-foreground">
                No messages yet. Say hi to your squad!
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((message) => {
                  const isOwn = message.sender_id === currentUserId
                    const timeLabel = message.created_at
                      ? formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                        })
                      : ""

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex w-full items-end gap-2",
                        isOwn ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isOwn && (
                        <UserAvatar
                          src={message.sender_avatar_url}
                          fallbackName={message.sender_username}
                          size="xs"
                          className="mt-auto"
                        />
                      )}
                      <div
                        className={cn(
                          "max-w-[72%] rounded-2xl px-3 py-2 text-xs shadow-sm",
                          isOwn
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm bg-muted text-foreground"
                        )}
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="truncate text-[11px] font-semibold">
                            {isOwn ? "You" : message.sender_username}
                          </span>
                          {timeLabel && (
                            <span className="shrink-0 text-[10px] text-muted-foreground/80">
                              {timeLabel}
                            </span>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap break-words text-[12px] leading-snug">
                          {message.content}
                        </p>
                      </div>
                      {isOwn && (
                        <UserAvatar
                          src={message.sender_avatar_url}
                          fallbackName={message.sender_username}
                          size="xs"
                          className="mt-auto"
                        />
                      )}
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </ScrollArea>
        </div>
        <form onSubmit={handleSend} className="flex items-center gap-2 pt-1">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message..."
            className="rounded-xl text-sm"
            disabled={sending}
            maxLength={1000}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-xl"
            disabled={sending || !newMessage.trim()}
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SendHorizontal className="size-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

