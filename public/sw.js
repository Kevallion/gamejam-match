/**
 * Service Worker for Web Push Notifications
 * Displays notifications and handles click to open the application
 */

self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch {
    data = { title: 'GameJamCrew', message: event.data.text(), link: '/' }
  }

  const title = data.title || 'GameJamCrew'
  const options = {
    body: data.message || data.body || 'New notification',
    icon: '/og-image.png',
    badge: '/og-image.png',
    data: {
      url: data.link || '/',
      ...data,
    },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(self.location.origin + (url.startsWith('/') ? url : '/' + url))
        }
      })
  )
})
