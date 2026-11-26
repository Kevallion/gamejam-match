"use client"

import { useEffect, useState } from "react"
import { MOCK_UPCOMING_JAMS } from "@/lib/mocks/upcoming-jams"
import {
  parseUpcomingJamsPayload,
  UPCOMING_JAMS_API_PATH,
  type UpcomingJam,
} from "@/lib/upcoming-jams"

export type UpcomingJamsStatus = "loading" | "ready" | "empty" | "error"
export type UpcomingJamsSource = "api" | "mock" | null

function previewOverride(
  allowMockFallback: boolean,
): "empty" | "skeleton" | "error" | null {
  if (!allowMockFallback || typeof window === "undefined") return null
  const value = new URLSearchParams(window.location.search).get("car2")
  if (value === "empty" || value === "skeleton" || value === "error") return value
  return null
}

export function useUpcomingJams(allowMockFallback: boolean): {
  status: UpcomingJamsStatus
  jams: UpcomingJam[]
  source: UpcomingJamsSource
} {
  const [status, setStatus] = useState<UpcomingJamsStatus>("loading")
  const [jams, setJams] = useState<UpcomingJam[]>([])
  const [source, setSource] = useState<UpcomingJamsSource>(null)

  useEffect(() => {
    const override = previewOverride(allowMockFallback)
    if (override === "skeleton") {
      return
    }

    if (override === "empty" || override === "error") {
      const timer = window.setTimeout(() => {
        setJams([])
        setSource(null)
        setStatus(override)
      }, 0)
      return () => window.clearTimeout(timer)
    }

    const controller = new AbortController()

    async function load() {
      try {
        const response = await fetch(UPCOMING_JAMS_API_PATH, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        })
        if (response.ok) {
          const payload: unknown = await response.json()
          const parsed = parseUpcomingJamsPayload(payload)
          if (!parsed) {
            if (allowMockFallback) {
              setJams(MOCK_UPCOMING_JAMS)
              setSource("mock")
              setStatus("ready")
              return
            }
            setJams([])
            setSource(null)
            setStatus("error")
            return
          }
          setJams(parsed)
          setSource("api")
          setStatus(parsed.length > 0 ? "ready" : "empty")
          return
        }
        if (allowMockFallback) {
          setJams(MOCK_UPCOMING_JAMS)
          setSource("mock")
          setStatus("ready")
          return
        }
        setJams([])
        setSource(null)
        setStatus("error")
      } catch {
        if (controller.signal.aborted) return
        if (allowMockFallback) {
          setJams(MOCK_UPCOMING_JAMS)
          setSource("mock")
          setStatus("ready")
          return
        }
        setJams([])
        setSource(null)
        setStatus("error")
      }
    }

    void load()
    return () => controller.abort()
  }, [allowMockFallback])

  return { status, jams, source }
}
