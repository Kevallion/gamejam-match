"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Crown, Medal, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

type LeaderRow = {
  userId: string
  username: string
  total: number
}

function monthStartIso(): string {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0))
  return start.toISOString()
}

export function MonthlyKudosLeaderboard() {
  const [rows, setRows] = useState<LeaderRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const since = monthStartIso()
      const { data: kudosRows, error } = await supabase
        .from("kudos")
        .select("receiver_id")
        .gte("created_at", since)

      if (cancelled) return
      if (error || !kudosRows) {
        setRows([])
        setLoading(false)
        return
      }

      const countByUser = new Map<string, number>()
      for (const row of kudosRows) {
        const id = (row.receiver_id as string | null) ?? ""
        if (!id) continue
        countByUser.set(id, (countByUser.get(id) ?? 0) + 1)
      }

      const topIds = [...countByUser.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id]) => id)

      if (topIds.length === 0) {
        setRows([])
        setLoading(false)
        return
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", topIds)

      if (cancelled) return
      const usernameById = new Map<string, string>()
      for (const profile of profiles ?? []) {
        usernameById.set(profile.id as string, ((profile.username as string | null) ?? "").trim() || "Jammer")
      }

      const mapped = topIds.map((id) => ({
        userId: id,
        username: usernameById.get(id) ?? "Jammer",
        total: countByUser.get(id) ?? 0,
      }))
      setRows(mapped)
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date())
  }, [])

  return (
    <Card className="glass-card border-peach/25 bg-peach/5">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-peach" />
          <h3 className="text-sm font-bold text-foreground">Monthly Kudos Leaderboard</h3>
          <Badge variant="outline" className="ml-auto rounded-full text-[10px]">
            {monthLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading leaderboard...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No kudos yet this month.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((row, idx) => (
              <div
                key={row.userId}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-card/50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  {idx === 0 ? (
                    <Crown className="size-4 text-amber-500" />
                  ) : (
                    <Medal className="size-4 text-muted-foreground" />
                  )}
                  <Link href={`/jammer/${row.userId}`} className="text-sm font-semibold text-foreground hover:text-primary">
                    {idx + 1}. {row.username}
                  </Link>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{row.total} kudos</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
