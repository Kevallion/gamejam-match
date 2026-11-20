import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import { AuthCallbackHandler } from '@/components/auth-callback-handler'
import { AuthProvider } from '@/components/auth-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { GamificationProvider } from '@/components/gamification-provider'
import { Toaster } from '@/components/ui/sonner'
import { FeedbackButton } from '@/components/FeedbackButton'
import { Footer } from '@/components/footer'
import { ConsentProvider } from '@/components/consent/consent-provider'
import './globals.css'

const _nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800'],
})
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gamejamcrew.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | GameJamCrew',
    default: 'GameJamCrew | Find your perfect Game Jam Squad',
  },
  description:
    'Looking for a game jam squad? GameJamCrew helps you find the perfect teammates, filter by experience, and build your dream squad for your next game jam.',
  keywords: ['game jam team', 'find team for game jam', 'game jam recruitment', 'gamedev team builder', 'indie game team'],
  openGraph: {
    type: 'website',
    siteName: 'GameJamCrew',
    title: 'GameJamCrew | Find your perfect Game Jam Squad',
    description: 'Looking for a game jam squad? GameJamCrew helps you find the perfect teammates, filter by experience, and build your dream squad for your next game jam.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GameJamCrew | Find your perfect Game Jam Squad',
    description: 'Looking for a game jam squad? GameJamCrew helps you find the perfect teammates, filter by experience, and build your dream squad for your next game jam.',
    images: ['/og-image.png'],
  },
  generator: 'v0.app',
  /* Icônes : app/icon.svg (gamepad) et app/favicon.ico utilisés automatiquement par Next.js */
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
        className={`${_nunito.variable} font-sans antialiased`}
      >
        {/* S1: GA4, GTM and Vercel Analytics load from ConsentProvider only after consent. */}
        <ConsentProvider>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <AuthProvider>
              <GamificationProvider>
                <AuthCallbackHandler />
                <div className="flex min-h-svh flex-col">
                  <div className="flex min-h-0 flex-1 flex-col">{children}</div>
                  <Footer />
                </div>
                <Toaster richColors position="bottom-right" closeButton />
              </GamificationProvider>
            </AuthProvider>
          </ThemeProvider>
          <FeedbackButton />
        </ConsentProvider>
      </body>
    </html>
  )
}
