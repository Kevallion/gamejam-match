'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { savePushSubscription } from '@/app/actions/push-actions'
import { Bell } from 'lucide-react'

const SW_PATH = '/sw.js'

export function PushNotificationManager() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'granted' | 'denied' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function handleActivate() {
    setStatus('loading')
    setMessage(null)

    try {
      if (!('Notification' in window)) {
        setMessage('Notifications are not supported by this browser.')
        setStatus('error')
        return
      }

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('denied')
        setMessage('Permission denied. You will not receive push notifications.')
        return
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        setMessage('VAPID key missing. Please contact the administrator.')
        setStatus('error')
        return
      }

      const registration = await navigator.serviceWorker.register(SW_PATH)
      await navigator.serviceWorker.ready

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      })

      const subscriptionJson = subscription.toJSON()
      const result = await savePushSubscription({
        endpoint: subscriptionJson.endpoint!,
        keys: {
          p256dh: subscriptionJson.keys?.p256dh ?? '',
          auth: subscriptionJson.keys?.auth ?? '',
        },
      })

      if (result?.error) {
        setMessage(result.error)
        setStatus('error')
        return
      }

      setStatus('granted')
      setMessage('Notifications enabled! You will receive alerts even when the site is closed.')
    } catch (err) {
      console.error('Push subscription error:', err)
      setMessage(err instanceof Error ? err.message : 'Erreur lors de l\'activation.')
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleActivate}
        disabled={status === 'loading' || status === 'granted'}
        className="gap-2"
      >
        <Bell className="size-4" />
        {status === 'loading'
          ? 'Activating...'
          : status === 'granted'
            ? 'Notifications enabled'
            : 'Enable notifications'}
      </Button>
      {message && (
        <p className="text-xs text-muted-foreground">{message}</p>
      )}
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
