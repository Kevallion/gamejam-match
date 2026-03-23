import type { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gamejamcrew.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/teams',
    '/find-members',
    '/create-team',
    '/create-profile',
    '/showcase',
    '/privacy',
    '/legal',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))
}
