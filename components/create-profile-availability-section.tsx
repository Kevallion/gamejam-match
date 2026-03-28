"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Info, Loader2 } from "lucide-react"
import { AvailabilityForm } from "@/components/availability-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export function CreateProfileAvailabilitySection() {
  const [authReady, setAuthReady] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [countLoading, setCountLoading] = useState(false)
  const [activeCount, setActiveCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (cancelled) return
      const uid = session?.user?.id ?? null
      setUserId(uid)
      setAuthReady(true)
      if (!uid) return
      setCountLoading(true)
      const { count, error } = await supabase
        .from("availability_posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", uid)
        .gte("expires_at", new Date().toISOString())
      if (cancelled) return
      setActiveCount(error ? 0 : (count ?? 0))
      setCountLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!authReady) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-border/50 bg-card/50">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    )
  }

  if (!userId) {
    return <AvailabilityForm />
  }

  if (countLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-border/50 bg-card/50">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    )
  }

  if (activeCount >= 3) {
    return (
      <Alert className="border-border/60 bg-muted/40 text-foreground">
        <Info className="size-4 text-muted-foreground" />
        <AlertTitle>Maximum reached</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          <p>
            You have reached the maximum of 3 availability posts. Please delete an existing one
            in your Dashboard to create a new one.
          </p>
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <Link href="/dashboard?tab=availability">Manage in Dashboard</Link>
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {activeCount >= 1 && (
        <Alert className="border-teal/30 bg-teal/10 text-foreground [&>svg]:text-teal">
          <Info className="size-4" />
          <AlertTitle>
            You already have {activeCount} active availability post{activeCount === 1 ? "" : "s"}.
          </AlertTitle>
          <AlertDescription className="text-muted-foreground">
            <Button variant="outline" size="sm" className="mt-1 border-teal/30 bg-background/80 hover:bg-teal/5" asChild>
              <Link href="/dashboard?tab=availability">Manage in Dashboard</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <AvailabilityForm />
    </div>
  )
}
