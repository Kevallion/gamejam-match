"use client"

import { useEffect } from "react"

const STORAGE_PREFIX = "gjc:list-scroll:"

function readY(key: string): number | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key)
    if (raw == null) return null
    const y = Number(raw)
    return Number.isFinite(y) && y >= 0 ? y : null
  } catch {
    return null
  }
}

function writeY(key: string, y: number) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, String(Math.round(y)))
  } catch {
    // Ignore quota / private-mode failures.
  }
}

/**
 * Restore window scroll after returning to a long card list.
 * Native restoration runs too early: the grid remounts as a short skeleton,
 * and off-screen `content-visibility` items only have an estimated height.
 * Re-applying on resize (and for a short window after render) covers both.
 */
export function useListScrollRestoration(listId: string, ready: boolean) {
  useEffect(() => {
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = "manual"
    let ticking = false
    const save = () => writeY(listId, window.scrollY)
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        save()
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("pagehide", save)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("pagehide", save)
      save()
      window.history.scrollRestoration = previous
    }
  }, [listId])

  useEffect(() => {
    if (!ready) return
    const y = readY(listId)
    if (y == null || y === 0) return
    let cancelled = false
    const apply = () => {
      if (cancelled) return
      if (Math.abs(window.scrollY - y) > 1) {
        window.scrollTo(0, y)
      }
    }
    apply()
    const frame = requestAnimationFrame(() => {
      apply()
      requestAnimationFrame(apply)
    })
    const observer = new ResizeObserver(() => apply())
    observer.observe(document.documentElement)
    const timers = [50, 100, 200, 400, 800].map((ms) => window.setTimeout(apply, ms))
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      for (const id of timers) window.clearTimeout(id)
    }
  }, [listId, ready])
}
