'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: <Home className="size-5" />,
  },
  {
    href: '/teams',
    label: 'Teams',
    icon: <Users className="size-5" />,
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="size-5" />,
  },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass md:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2 pb-safe-bottom">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-16 py-2 px-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-teal bg-teal/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={cn(
                  'transition-transform duration-200',
                  isActive && 'scale-110'
                )}
              >
                {item.icon}
              </span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
