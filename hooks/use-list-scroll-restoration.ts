"use client"

import { useEffect } from "react"

const STORAGE_PREFIX = "gjc:list-scroll:"

type NavKind = "pop" | "push" | ""

let navKind: NavKind = ""
let navBound = false

function bindNavKind() {
  if (navBound || typeof window === "undefined") return
  navBound = true
  window.addEventListener("popstate", () => {
    navKind = "pop"
  })
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest("a[href]")) navKind = "push"
    },
    true,
  )
}

function shouldRestoreScroll() {
  if (navKind === "pop") return true
  if (navKind === "push") return false
  if (typeof performance === "undefined") return false
  const entries = performance.getEntriesByType("navigation")
  const entry = entries[0] as PerformanceNavigationTiming | undefined
  return entry?.type === "back_forward"
}

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
 * Restore window scroll after a back/forward return to a long card list.
 * Native restoration runs too early: the grid remounts as a short skeleton,
 * and off-screen `content-visibility` items only have an estimated height.
 */
export function useListScrollRestoration(listId: string, ready: boolean) {
  useEffect(() => {
    bindNavKind()
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
    if (!ready || !shouldRestoreScroll()) return
    const y = readY(listId)
    if (y == null) return
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
    const later = window.setTimeout(apply, 50)
    const last = window.setTimeout(apply, 200)
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      window.clearTimeout(later)
      window.clearTimeout(last)
    }
  }, [listId, ready])
}
