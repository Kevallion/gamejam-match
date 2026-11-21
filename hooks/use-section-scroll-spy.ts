"use client"

import { useEffect, useState } from "react"

/**
 * Returns the id of the section currently in view (first visible from the top).
 * `offsetTop` is the height hidden under sticky headers, in px.
 */
export function useSectionScrollSpy(ids: readonly string[], offsetTop = 96) {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? "")
  const key = ids.join("|")

  useEffect(() => {
    const sectionIds = key ? key.split("|") : []
    if (sectionIds.length === 0 || typeof window === "undefined") return

    const pick = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      if (atBottom) {
        setActiveId(sectionIds[sectionIds.length - 1])
        return
      }
      let current = sectionIds[0]
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top - offsetTop <= 8) current = id
      }
      setActiveId(current)
    }

    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(pick)
    }
    pick()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [key, offsetTop])

  return activeId
}
