"use client"

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import { cn } from "@/lib/utils"

type BentoCarouselProps = {
  label: string
  children: ReactNode
  className?: string
  /** Card width hint for peek (next card visible). */
  itemClassName?: string
}

/**
 * Horizontal carousel with scroll-snap, peek of the next card, keyboard ←/→ when focused.
 */
export function BentoCarousel({
  label,
  children,
  className,
  itemClassName,
}: BentoCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [count, setCount] = useState(0)
  const labelId = useId()

  const measure = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const items = el.querySelectorAll<HTMLElement>("[data-carousel-item]")
    setCount(items.length)
    if (items.length === 0) {
      setIndex(0)
      return
    }
    const scrollLeft = el.scrollLeft
    let closest = 0
    let best = Number.POSITIVE_INFINITY
    items.forEach((item, i) => {
      const dist = Math.abs(item.offsetLeft - scrollLeft)
      if (dist < best) {
        best = dist
        closest = i
      }
    })
    setIndex(closest)
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    measure()
    el.addEventListener("scroll", measure, { passive: true })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", measure)
      ro.disconnect()
    }
  }, [measure, children])

  const scrollToIndex = (next: number) => {
    const el = scrollerRef.current
    if (!el) return
    const items = el.querySelectorAll<HTMLElement>("[data-carousel-item]")
    const target = items[next]
    if (!target) return
    el.scrollTo({ left: target.offsetLeft, behavior: "smooth" })
    setIndex(next)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      scrollToIndex(Math.min(index + 1, Math.max(count - 1, 0)))
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      scrollToIndex(Math.max(index - 1, 0))
    } else if (event.key === "Home") {
      event.preventDefault()
      scrollToIndex(0)
    } else if (event.key === "End") {
      event.preventDefault()
      scrollToIndex(Math.max(count - 1, 0))
    }
  }

  return (
    <div className={cn("min-w-0 max-w-full overflow-x-clip", className)}>
      <div
        ref={scrollerRef}
        role="region"
        aria-roledescription="carousel"
        aria-labelledby={labelId}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className={cn(
          "flex max-w-full gap-3 overflow-x-auto overscroll-x-contain pb-2",
          "snap-x snap-mandatory scroll-px-1",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        <span id={labelId} className="sr-only">
          {label}
        </span>
        {/* Wrap children: expect direct items; we tag via clone-less convention — parent passes items with data attribute */}
        {Array.isArray(children)
          ? children.map((child, i) => (
              <div
                key={i}
                data-carousel-item
                className={cn("snap-start shrink-0", itemClassName)}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count || "?"}`}
              >
                {child}
              </div>
            ))
          : (
              <div data-carousel-item className={cn("snap-start shrink-0", itemClassName)}>
                {children}
              </div>
            )}
        {/* 3px at the end so the last card's neo shadow is not clipped. */}
        <div aria-hidden className="w-[3px] shrink-0" />
      </div>
      {count > 1 ? (
        <div className="mt-1.5 flex justify-center gap-1.5" aria-hidden>
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              onClick={() => scrollToIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-[18px] bg-teal" : "w-1.5 bg-border",
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

type BentoCarouselItemProps = {
  children: ReactNode
  className?: string
}

/** Optional explicit item wrapper when not using array children. */
export function BentoCarouselItem({ children, className }: BentoCarouselItemProps) {
  return <div className={cn("min-w-0", className)}>{children}</div>
}
