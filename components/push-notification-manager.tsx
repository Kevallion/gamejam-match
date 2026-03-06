'use client'

import { Button } from '@/components/ui/button'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { Bell } from 'lucide-react'

export function PushNotificationManager() {
  const { permission, activate, isActivating, error } = usePushNotifications()

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={activate}
        disabled={isActivating || permission === 'granted'}
        className="gap-2"
      >
        <Bell className="size-4" />
        {isActivating
          ? 'Activating...'
          : permission === 'granted'
            ? 'Notifications enabled'
            : 'Enable notifications'}
      </Button>
      {error && (
        <p className="text-xs text-muted-foreground">{error}</p>
      )}
    </div>
  )
}
