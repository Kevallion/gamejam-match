"use client"

import { useEffect, useState } from "react"

/**
 * Highlights the section id that is most visible in the viewport (for sticky anchor nav).
 */
export function useSectionScrollSpy(sectionIds: string[]) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "")

  const idsKey = sectionIds.join("|")

  useEffect(() => {
    if (!idsKey) return
    const ids = idsKey.split("|").filter(Boolean)

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]?.target
        if (top?.id) setActiveId(top.id)
      },
      { rootMargin: "-12% 0px -50% 0px", threshold: [0, 0.15, 0.35, 0.6, 1] },
    )

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [idsKey])

  return activeId
}
