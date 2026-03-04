"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"

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

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications],
  )

  const dismissNotification = useCallback(
    async (id: string) => {
      if (!userId) return
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_id", userId)
    },
    [userId],
  )

  const markAllAsRead = useCallback(async () => {
    if (!userId || unreadCount === 0) return
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)
  }, [userId, unreadCount])

  return {
    notifications,
    unreadCount,
    loading,
    refetch: fetchNotifications,
    dismissNotification,
    markAllAsRead,
  }
}

