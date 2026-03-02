import type { Metadata, Viewport } from 'next'
import { Nunito, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { FeedbackButton } from '@/components/FeedbackButton'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const _nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800'],
})
const _geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gamejamcrew.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'GameJamCrew - Find Your Game Jam Squad',
    template: '%s | GameJamCrew',
  },
  description:
    'GameJamCrew is the team builder for Game Jams. Connect indie developers, artists, programmers and designers to create games together. Find your squad, post your team, or join the next jam.',
  keywords: ['Game Jam', 'team builder', 'indie developers', 'artists', 'programmers', 'create games', 'game development', 'squad finder'],
  openGraph: {
    type: 'website',
    siteName: 'GameJamCrew',
    title: 'GameJamCrew - Find Your Game Jam Squad',
    description: 'The team builder for Game Jams. Connect indie developers, artists and programmers to create games together.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GameJamCrew - Find Your Game Jam Squad',
    description: 'The team builder for Game Jams. Connect indie developers, artists and programmers to create games together.',
    images: ['/og-image.png'],
  },
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#2a2440',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${_nunito.variable} ${_geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
          <FeedbackButton />
          <Toaster richColors position="bottom-right" />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
