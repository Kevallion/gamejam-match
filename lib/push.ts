import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gamejamcrew.com'

/**
 * Envoie une notification Web Push à tous les abonnements d'un utilisateur.
 * Ne lance pas d'erreur : les échecs sont ignorés pour ne pas impacter l'UX.
 */
export async function sendPushToUser(
  userId: string,
  title: string,
  message: string,
  link?: string | null,
): Promise<void> {
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
  if (!vapidPrivateKey) return

  try {
    webpush.setVapidDetails(
      'mailto:support@gamejamcrew.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      vapidPrivateKey,
    )

    const admin = createAdminClient()
    const { data: subscriptions, error } = await admin
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', userId)

    if (error || !subscriptions?.length) return

    const payload = JSON.stringify({
      title: title || 'GameJamCrew',
      message,
      link: link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : BASE_URL,
    })

    await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload,
        ),
      ),
    )
  } catch {
    // Silent: push should never break the main flow
  }
}
