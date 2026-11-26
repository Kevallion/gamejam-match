"use client"

import Image from "next/image"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import { JamDatesChip } from "@/components/jam-dates-chip"
import { AppIcon, IconTile } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { externalImageNeedsUnoptimized } from "@/lib/external-image"
import { useUpcomingJams } from "@/hooks/use-upcoming-jams"
import type { UpcomingJam } from "@/lib/upcoming-jams"
import { UpcomingJamsErrorBoundary } from "@/components/landing/upcoming-jams-error-boundary"
import { JamCoverFallback } from "@/components/landing/upcoming-jams-cover-fallback"

const SLIDE_SELECTOR = "[data-jam-slide]"

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

function formatJoinedCount(count: number): string {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(count)
}

function slideAt(track: HTMLElement, index: number): HTMLElement | null {
  return track.querySelectorAll<HTMLElement>(SLIDE_SELECTOR)[index] ?? null
}

function nearestSlideIndex(track: HTMLElement): number {
  const slides = [...track.querySelectorAll<HTMLElement>(SLIDE_SELECTOR)]
  if (slides.length === 0) return 0
  const left = track.scrollLeft
  let best = 0
  let bestDist = Number.POSITIVE_INFINITY
  slides.forEach((slide, index) => {
    const dist = Math.abs(slide.offsetLeft - left)
    if (dist < bestDist) {
      best = index
      bestDist = dist
    }
  })
  return best
}

function canScrollPrev(track: HTMLElement): boolean {
  return track.scrollLeft > 8
}

function canScrollNext(track: HTMLElement): boolean {
  return track.scrollLeft + track.clientWidth < track.scrollWidth - 8
}

function SectionChrome({
  headingId,
  children,
  sampleNote,
}: {
  headingId: string
  children?: ReactNode
  sampleNote?: boolean
}) {
  return (
    <section
      className="relative max-w-full overflow-x-hidden px-4 py-20 lg:px-8 lg:py-28"
      aria-labelledby={headingId}
    >
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-lg">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-4 py-2 text-sm font-bold text-foreground shadow-[3px_3px_0_0_var(--neo-shadow)]">
              <AppIcon icon={ICON.jam} size="sm" tone="teal" />
              Upcoming jams
            </div>
            <h2
              id={headingId}
              className="text-balance font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"
            >
              Big jams on the <span className="text-teal">horizon.</span>
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Featured events with open sign-ups. Each card opens the jam page
              on itch.io in a new tab.
            </p>
            {sampleNote ? (
              <p className="mt-2 text-base text-muted-foreground">
                Sample preview data — the live list will appear when the
                upcoming-jams API is ready.
              </p>
            ) : null}
          </div>
          {children}
        </div>
      </div>
    </section>
  )
}

function JamCard({ jam, active }: { jam: UpcomingJam; active: boolean }) {
  const unoptimized =
    Boolean(jam.imageUrl?.startsWith("http")) &&
    externalImageNeedsUnoptimized(jam.imageUrl ?? "")
  const [imageFailed, setImageFailed] = useState(!jam.imageUrl)

  return (
    <a
      href={jam.url}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={active ? 0 : -1}
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border-2 border-foreground bg-card text-left shadow-[3px_3px_0_0_var(--neo-shadow)]",
        "jam-motion transition-opacity duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
        "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-muted">
        {imageFailed || !jam.imageUrl ? (
          <JamCoverFallback id={jam.id} title={jam.title} />
        ) : (
          <Image
            src={jam.imageUrl}
            alt=""
            fill
            sizes="(max-width: 767px) 90vw, (max-width: 1439px) 45vw, 360px"
            className="object-cover"
            loading="lazy"
            unoptimized={unoptimized}
            onError={() => setImageFailed(true)}
          />
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        <h3 className="text-balance font-display text-xl font-extrabold leading-tight text-foreground">
          {jam.title}
        </h3>
        {jam.host ? (
          <p className="text-base text-muted-foreground">Hosted by {jam.host}</p>
        ) : null}
        <JamDatesChip jamStartDate={jam.startAt} jamEndDate={jam.endAt} />
        <p className="flex items-center gap-2 text-base font-semibold text-foreground">
          <AppIcon icon={ICON.jammer} size="md" tone="teal" />
          <span>
            {formatJoinedCount(jam.joinedCount)} signed up
          </span>
        </p>
        <p className="mt-auto inline-flex items-center gap-2 pt-1 text-base font-bold text-teal">
          View on itch.io
          <AppIcon icon={ICON.externalLink} size="sm" tone="teal" />
          <span className="sr-only">(opens in a new tab)</span>
        </p>
      </div>
    </a>
  )
}

function CarouselSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-hidden
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border-2 border-border bg-card shadow-[3px_3px_0_0_var(--neo-shadow)]"
        >
          <div className="aspect-[16/9] animate-pulse bg-muted/60" />
          <div className="space-y-3 p-4">
            <div className="h-6 w-3/4 animate-pulse rounded-md bg-muted/60" />
            <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted/40" />
            <div className="h-8 w-40 animate-pulse rounded-xl bg-muted/40" />
            <div className="h-4 w-32 animate-pulse rounded-md bg-muted/40" />
          </div>
        </div>
      ))}
    </div>
  )
}

function StatusPanel({
  tone,
  title,
  body,
}: {
  tone: "muted" | "teal"
  title: string
  body: string
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border-2 border-foreground bg-card p-5 shadow-[3px_3px_0_0_var(--neo-shadow)]">
      <IconTile icon={ICON.jam} tone={tone} />
      <div className="min-w-0">
        <p className="font-display text-xl font-extrabold text-foreground">
          {title}
        </p>
        <p className="mt-1 text-base leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
    </div>
  )
}

function UpcomingJamsFallback() {
  const headingId = "upcoming-jams-heading"
  return (
    <SectionChrome headingId={headingId}>
      <div className="w-full sm:hidden" />
      <div className="col-span-full w-full">
        <StatusPanel
          tone="muted"
          title="Featured jams could not be loaded"
          body="The rest of the page is still available. Refresh to try again."
        />
      </div>
    </SectionChrome>
  )
}

function UpcomingJamsCarouselInner({
  allowMockFallback,
}: {
  allowMockFallback: boolean
}) {
  const headingDomId = "upcoming-jams-heading"
  const trackRef = useRef<HTMLDivElement>(null)
  const { status, jams, source } = useUpcomingJams(allowMockFallback)
  const [activeIndex, setActiveIndex] = useState(0)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(true)

  const syncFromTrack = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    setActiveIndex(nearestSlideIndex(track))
    setAtStart(!canScrollPrev(track))
    setAtEnd(!canScrollNext(track))
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track || status !== "ready") return
    syncFromTrack()
    track.addEventListener("scroll", syncFromTrack, { passive: true })
    const observer = new ResizeObserver(syncFromTrack)
    observer.observe(track)
    return () => {
      track.removeEventListener("scroll", syncFromTrack)
      observer.disconnect()
    }
  }, [status, jams.length, syncFromTrack])

  const goBy = useCallback((direction: -1 | 1) => {
    const track = trackRef.current
    if (!track) return
    const next = Math.min(
      Math.max(nearestSlideIndex(track) + direction, 0),
      jams.length - 1,
    )
    const slide = slideAt(track, next)
    if (!slide) return
    track.scrollTo({
      left: slide.offsetLeft,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    })
  }, [jams.length])

  const onRegionKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight") {
        event.preventDefault()
        goBy(1)
      } else if (event.key === "ArrowLeft") {
        event.preventDefault()
        goBy(-1)
      } else if (event.key === "Home") {
        event.preventDefault()
        const track = trackRef.current
        const first = track ? slideAt(track, 0) : null
        if (track && first) {
          track.scrollTo({
            left: 0,
            behavior: prefersReducedMotion() ? "auto" : "smooth",
          })
        }
      } else if (event.key === "End") {
        event.preventDefault()
        const track = trackRef.current
        if (!track) return
        const last = slideAt(track, jams.length - 1)
        if (last) {
          track.scrollTo({
            left: last.offsetLeft,
            behavior: prefersReducedMotion() ? "auto" : "smooth",
          })
        }
      }
    },
    [goBy, jams.length],
  )

  const controls = status === "ready" && jams.length > 0 && (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        aria-label="Previous featured jam"
        disabled={atStart}
        onClick={() => goBy(-1)}
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-xl border-2 border-foreground bg-card text-foreground shadow-[3px_3px_0_0_var(--neo-shadow)]",
          "jam-motion transition-opacity duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        <AppIcon icon={ICON.navLeft} size="md" />
      </button>
      <button
        type="button"
        aria-label="Next featured jam"
        disabled={atEnd}
        onClick={() => goBy(1)}
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-xl border-2 border-foreground bg-card text-foreground shadow-[3px_3px_0_0_var(--neo-shadow)]",
          "jam-motion transition-opacity duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        <AppIcon icon={ICON.navRight} size="md" />
      </button>
    </div>
  )

  let body: ReactNode = null
  if (status === "loading") {
    body = (
      <div className="w-full">
        <CarouselSkeleton />
        <p className="sr-only" role="status">
          Loading featured jams
        </p>
      </div>
    )
  } else if (status === "empty") {
    body = (
      <div className="w-full">
        <StatusPanel
          tone="teal"
          title="No featured jams to show right now"
          body="Check back soon — upcoming events will appear here when they are published."
        />
      </div>
    )
  } else if (status === "error") {
    body = (
      <div className="w-full">
        <StatusPanel
          tone="muted"
          title="Featured jams could not be loaded"
          body="The rest of the page is still available. Refresh to try again."
        />
      </div>
    )
  } else {
    body = (
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Upcoming featured jams"
        onKeyDown={onRegionKeyDown}
        className="w-full min-w-0"
      >
        <div
          ref={trackRef}
          tabIndex={0}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain p-[3px] pb-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [scrollbar-width:thin]"
        >
          {jams.map((jam, index) => {
            const active = index === activeIndex
            return (
              <div
                key={jam.id}
                data-jam-slide
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${jams.length}`}
                className="w-[min(20rem,calc(100%-0.25rem))] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
              >
                <JamCard jam={jam} active={active} />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <section
      className="relative max-w-full overflow-x-hidden px-4 py-20 lg:px-8 lg:py-28"
      aria-labelledby={headingDomId}
    >
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-lg">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-4 py-2 text-sm font-bold text-foreground shadow-[3px_3px_0_0_var(--neo-shadow)]">
              <AppIcon icon={ICON.jam} size="sm" tone="teal" />
              Upcoming jams
            </div>
            <h2
              id={headingDomId}
              className="text-balance font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"
            >
              Big jams on the <span className="text-teal">horizon.</span>
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Featured events with open sign-ups. Each card opens the jam page
              on itch.io in a new tab.
            </p>
            {source === "mock" ? (
              <p className="mt-2 text-base text-muted-foreground">
                Sample preview data — the live list will appear when the
                upcoming-jams API is ready.
              </p>
            ) : null}
          </div>
          {controls}
        </div>
        {body}
      </div>
    </section>
  )
}

export function UpcomingJamsSection({
  allowMockFallback,
}: {
  allowMockFallback: boolean
}) {
  return (
    <UpcomingJamsErrorBoundary fallback={<UpcomingJamsFallback />}>
      <UpcomingJamsCarouselInner allowMockFallback={allowMockFallback} />
    </UpcomingJamsErrorBoundary>
  )
}
