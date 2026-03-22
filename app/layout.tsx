import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { AuthCallbackHandler } from '@/components/auth-callback-handler'
import { AuthProvider } from '@/components/auth-provider'
import { FeedbackButton } from '@/components/FeedbackButton'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
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
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-06ZYF4G9Z6"
          strategy="afterInteractive"
        />
        <Script id="gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-06ZYF4G9Z6');
          `}
        </Script>
        <Script
          id="gtm"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-M5P3GBBL');`,
          }}
        />
      </head>
      <body
        className={`${_nunito.variable} font-sans antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-M5P3GBBL"
            height={0}
            width={0}
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
          />
        </noscript>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AuthProvider>
            <AuthCallbackHandler />
            {children}
            <FeedbackButton />
            <Toaster richColors position="bottom-right" />
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
