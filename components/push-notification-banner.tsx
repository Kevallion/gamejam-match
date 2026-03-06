'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePushNotifications } from '@/hooks/use-push-notifications'

export function PushNotificationBanner() {
  const { permission, activate, isActivating } = usePushNotifications()

  if (permission !== 'default') return null

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border-2 border-teal/30 bg-teal/5 shadow-sm">
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-teal/15">
            <Bell className="size-6 text-teal" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              Don&apos;t miss any Jam opportunity!
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Enable notifications to be alerted immediately about your applications and messages.
            </p>
          </div>
        </div>
        <Button
          onClick={activate}
          disabled={isActivating}
          className="shrink-0 gap-2 bg-teal text-teal-foreground hover:bg-teal/90"
        >
          <Bell className="size-4" />
          {isActivating ? 'Activating...' : 'Enable notifications'}
        </Button>
      </div>
    </div>
  )
}
