import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Nunito, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
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
        className={`${_nunito.variable} ${_geistMono.variable} font-sans antialiased`}
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
            {children}
            <FeedbackButton />
            <Toaster richColors position="bottom-right" />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
