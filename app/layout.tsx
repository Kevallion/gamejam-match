import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800'],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gamejamcrew.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | GameJamCrew',
    default: 'GameJamCrew | Find your perfect Game Jam Team',
  },
  description:
    'Looking for a game jam team? GameJamCrew helps you find the perfect teammates, filter by experience, and build your dream squad for your next game jam.',
  keywords: ['game jam team', 'find team for game jam', 'game jam recruitment', 'gamedev team builder', 'indie game team'],
  openGraph: {
    type: 'website',
    siteName: 'GameJamCrew',
    title: 'GameJamCrew | Find your perfect Game Jam Team',
    description: 'Looking for a game jam team? GameJamCrew helps you find the perfect teammates, filter by experience, and build your dream squad for your next game jam.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GameJamCrew | Find your perfect Game Jam Team',
    description: 'Looking for a game jam team? GameJamCrew helps you find the perfect teammates, filter by experience, and build your dream squad for your next game jam.',
    images: ['/og-image.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#f8fafc',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
