"use client"

import type { ReactNode } from "react"
import { AppShell, type AppShellAccount } from "@/components/app-shell/app-shell"
import { AppShellProvider } from "@/components/app-shell/app-shell-context"
import { NotificationsScope, useNotifications } from "@/hooks/use-notifications"

type SignedInAppShellProps = {
  account: AppShellAccount
  children: ReactNode
}

/** Client wrapper: notifications + persistent bento hotbar for every signed-in app route. */
export function SignedInAppShell({ account, children }: SignedInAppShellProps) {
  const {
    notifications,
    unreadCount,
    loading,
    refetch,
    dismissNotification,
    markAllAsRead,
  } = useNotifications(account.userId)

  return (
    <AppShellProvider>
      <NotificationsScope
        value={{
          notifications,
          unreadCount,
          loading,
          refetch,
          dismissNotification,
          markAllAsRead,
        }}
      >
        <AppShell
          account={account}
          inboxCount={unreadCount}
          notifications={notifications}
          unreadCount={unreadCount}
          notifLoading={loading}
          onMarkRead={(id) => void dismissNotification(id)}
          onMarkAllRead={() => void markAllAsRead()}
          onRefetchNotifications={() => void refetch()}
        >
          {children}
        </AppShell>
      </NotificationsScope>
    </AppShellProvider>
  )
}
