import * as React from 'react'

import { cn } from '@/lib/utils'

type CardVariant = 'default' | 'teal' | 'lavender' | 'pink' | 'mint' | 'peach'

const variantAccentClasses: Record<CardVariant, string> = {
  default: '',
  teal: 'card-accent-teal hover:border-teal/30 hover:shadow-[var(--glow-teal)]',
  lavender: 'card-accent-lavender hover:border-lavender/30 hover:shadow-[var(--glow-lavender)]',
  pink: 'card-accent-pink hover:border-pink/30 hover:shadow-[var(--glow-pink)]',
  mint: 'card-accent-mint hover:border-mint/30 hover:shadow-[var(--glow-mint)]',
  peach: 'card-accent-peach hover:border-peach/30 hover:shadow-[var(--glow-peach)]',
}

interface CardProps extends React.ComponentProps<'div'> {
  variant?: CardVariant
}

function Card({ className, variant = 'default', children, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={cn(
        'relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-border/50',
        'bg-card text-card-foreground py-6',
        'shadow-[var(--shadow-card)]',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] hover:border-border',
        variantAccentClasses[variant],
        className,
      )}
      {...props}
    >
      {variant !== 'default' && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
          style={{
            background: `linear-gradient(to right, var(--card-accent-from), var(--card-accent-to))`,
          }}
        />
      )}
      {children}
    </div>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6',
        'has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  )
}

export type { CardVariant }
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
