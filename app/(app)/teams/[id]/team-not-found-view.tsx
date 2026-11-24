import Link from "next/link"
import { ArrowLeft, TriangleAlert } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconTile } from "@/components/ui/app-icon"
import { MainRegion } from "@/components/main-region"

/** Shown for a deleted, expired or unknown squad: by the client page and by not-found.tsx (real 404). */
export function TeamNotFoundView() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar />
      <MainRegion className="flex-1 px-4 py-16 lg:px-6 lg:pt-28">
        <div className="mx-auto max-w-2xl">
          <Card className="rounded-2xl border-border/60 bg-card">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
              <IconTile icon={TriangleAlert} tone="muted" />
              <h1 className="text-xl font-bold text-foreground">
                This announcement is no longer available
              </h1>
              <p className="text-muted-foreground">
                The squad may have been removed or the listing has expired.
              </p>
              <Button asChild variant="outline" className="gap-2 rounded-xl">
                <Link href="/teams">
                  <ArrowLeft className="size-4" />
                  All squads
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainRegion>
    </div>
  )
}
