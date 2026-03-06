'use client'

import { useState, useEffect, useCallback } from 'react'
import { savePushSubscription } from '@/app/actions/push-actions'

const SW_PATH = '/sw.js'

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

export type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported' | null

export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermission>(null)
  const [isActivating, setIsActivating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) {
      setPermission('unsupported')
      return
    }
    setPermission(Notification.permission as PushPermission)
  }, [])

  const activate = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setError('Notifications are not supported by this browser.')
      return
    }

    setIsActivating(true)
    setError(null)

    try {
      const result = await Notification.requestPermission()
      setPermission(result as PushPermission)

      if (result !== 'granted') {
        setError('Permission denied. You will not receive push notifications.')
        setIsActivating(false)
        return
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        setError('VAPID key missing. Please contact the administrator.')
        setIsActivating(false)
        return
      }

      const registration = await navigator.serviceWorker.register(SW_PATH)
      await navigator.serviceWorker.ready

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      })

      const subscriptionJson = subscription.toJSON()
      const saveResult = await savePushSubscription({
        endpoint: subscriptionJson.endpoint!,
        keys: {
          p256dh: subscriptionJson.keys?.p256dh ?? '',
          auth: subscriptionJson.keys?.auth ?? '',
        },
      })

      if (saveResult?.error) {
        setError(saveResult.error)
      }
    } catch (err) {
      console.error('Push subscription error:', err)
      setError(err instanceof Error ? err.message : 'Error while activating.')
    } finally {
      setIsActivating(false)
    }
  }, [])

  return { permission, activate, isActivating, error }
}
