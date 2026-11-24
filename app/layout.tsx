import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import { AuthCallbackHandler } from '@/components/auth-callback-handler'
import { AuthProvider } from '@/components/auth-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { GamificationProvider } from '@/components/gamification-provider'
import { Toaster } from '@/components/ui/sonner'
import { FeedbackButton } from '@/components/FeedbackButton'
import { ConsentProvider } from '@/components/consent/consent-provider'
import { SigningOutCover } from '@/components/auth/signing-out-cover'
import { BfcacheAuthGuard } from '@/components/auth/bfcache-auth-guard'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  // Single DS-1 face for body and headings (LCP text included).
  preload: true,
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F3ECDD' },
    { media: '(prefers-color-scheme: dark)', color: '#2A2440' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunito.variable} font-sans antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:inline-flex focus-visible:h-11 focus-visible:items-center focus-visible:rounded-lg focus-visible:border focus-visible:border-border focus-visible:bg-card focus-visible:px-4 focus-visible:text-base focus-visible:font-bold focus-visible:text-foreground focus-visible:shadow-[3px_3px_0_0_var(--neo-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Skip to main content
        </a>
        {/* S1: GA4, GTM and Vercel Analytics load from ConsentProvider only after consent,
            and only on the production deployment (VERCEL_ENV is a Vercel system variable,
            read here on the server; unset locally, "preview" on preview deployments). */}
        <ConsentProvider analyticsEnabled={process.env.VERCEL_ENV === 'production'}>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <AuthProvider>
              <GamificationProvider>
                <AuthCallbackHandler />
                {children}
                <Toaster richColors position="bottom-right" closeButton />
                <SigningOutCover />
                <BfcacheAuthGuard />
              </GamificationProvider>
            </AuthProvider>
          </ThemeProvider>
          <FeedbackButton />
        </ConsentProvider>
      </body>
    </html>
  )
}
