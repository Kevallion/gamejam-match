"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Trophy } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { NOTIFICATION_TYPE_GAMIFICATION_SQUAD_COMPLETE } from "@/lib/notification-constants"

export type NotificationItem = {
  id: string
  type: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([])
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, type, message, link, is_read, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        setNotifications([])
        return
      }

      setNotifications((data ?? []) as NotificationItem[])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Realtime: refetch when new notifications arrive
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as { type?: string; message?: string }
          if (
            row?.type === NOTIFICATION_TYPE_GAMIFICATION_SQUAD_COMPLETE &&
            typeof row.message === "string" &&
            row.message.length > 0
          ) {
            toast.message(row.message, {
              icon: <Trophy className="size-5 shrink-0 text-amber-500" aria-hidden />,
              classNames: {
                toast:
                  "group border-amber-500/45 bg-amber-950/20 dark:bg-amber-950/35 backdrop-blur-sm shadow-lg shadow-amber-500/10",
              },
              duration: 5200,
            })
          }
          void fetchNotifications()
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => void fetchNotifications(),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchNotifications])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications],
  )

  const dismissNotification = useCallback(
    async (id: string) => {
      if (!userId) return
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_id", userId)
      if (!error) {
        void fetchNotifications()
      }
    },
    [userId, fetchNotifications],
  )

  const markAllAsRead = useCallback(async () => {
    if (!userId || unreadCount === 0) return
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)
    if (!error) {
      void fetchNotifications()
    }
  }, [userId, unreadCount, fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    refetch: fetchNotifications,
    dismissNotification,
    markAllAsRead,
  }
}
