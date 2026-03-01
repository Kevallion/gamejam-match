"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export type NotificationItem = {
  id: string
  kind: "application" | "invitation"
  teamName: string
  senderName?: string | null
  targetRole?: string | null
  createdAt: string
}

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) {
      setNotifications([])
      return
    }

    async function fetchNotifications() {
      setLoading(true)

      const [{ data: apps }, { data: invites }] = await Promise.all([
        supabase
          .from("join_requests")
          .select("id, sender_name, target_role, created_at, teams!inner(team_name, user_id)")
          .eq("teams.user_id", userId)
          .eq("type", "application")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("join_requests")
          .select("id, target_role, created_at, teams(team_name)")
          .eq("sender_id", userId)
          .eq("type", "invitation")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(5),
      ])

      const combined: NotificationItem[] = []

      if (apps) {
        for (const a of apps) {
          combined.push({
            id: a.id,
            kind: "application",
            teamName: (a.teams as any)?.team_name ?? "Unknown Team",
            senderName: a.sender_name,
            targetRole: a.target_role,
            createdAt: a.created_at,
          })
        }
      }

      if (invites) {
        for (const i of invites) {
          combined.push({
            id: i.id,
            kind: "invitation",
            teamName: (i.teams as any)?.team_name ?? "Unknown Team",
            targetRole: i.target_role,
            createdAt: i.created_at,
          })
        }
      }

      combined.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      setNotifications(combined.slice(0, 5))
      setLoading(false)
    }

    fetchNotifications()
  }, [userId])

  return { notifications, unreadCount: notifications.length, loading }
}
