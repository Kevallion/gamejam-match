'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const MOBILE_MQ = '(max-width: 767px)'

function readIsMobile() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(MOBILE_MQ).matches
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()
  // Sync on first paint so the first toast is not stuck bottom-right over the tab bar.
  const [isMobile, setIsMobile] = useState(readIsMobile)

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ)
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position={isMobile ? 'top-center' : 'bottom-right'}
      offset={isMobile ? { top: 16 } : undefined}
      mobileOffset={{ top: 16 }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
