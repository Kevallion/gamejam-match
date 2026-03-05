'use server'

import { createClient } from '@/lib/supabase/server'

export interface PushSubscriptionInput {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export async function savePushSubscription(subscription: PushSubscriptionInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to enable notifications.' }
  }

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    {
      onConflict: 'endpoint',
    },
  )

  if (error) {
    console.error('savePushSubscription error:', error)
    return { error: 'Unable to save subscription.' }
  }

  return { success: true }
}
