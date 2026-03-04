"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, RefreshCw } from "lucide-react"
import { syncItchJams } from "@/app/actions/jam-actions"

export function SyncJamsClient() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    count?: number
    error?: string
  } | null>(null)

  async function handleSync() {
    setLoading(true)
    setResult(null)
    try {
      const res = await syncItchJams()
      setResult({
        success: res.success,
        count: res.count,
        error: res.error,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="pt-6">
        <Button
          onClick={handleSync}
          disabled={loading}
          className="w-full gap-2"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Syncing…
            </>
          ) : (
            <>
              <RefreshCw className="size-4" />
              Sync jams from itch.io
            </>
          )}
        </Button>

        {result && (
          <div
            className={`mt-4 rounded-lg border p-4 text-sm ${
              result.success
                ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            {result.success ? (
              <p>
                Sync completed. <strong>{result.count ?? 0}</strong> jam
                {(result.count ?? 0) !== 1 ? "s" : ""} in the database.
              </p>
            ) : (
              <p>
                Sync failed: <strong>{result.error ?? "Unknown error"}</strong>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
