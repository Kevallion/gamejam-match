"use client"

import Link from "next/link"
import { KudosBadgeRow } from "@/components/kudos-badges"
import type { KudosCounts } from "@/lib/kudos"
import { UserAvatar } from "@/components/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CalendarDays, Cpu, ExternalLink, Globe, Hand, RotateCw, Trash2 } from "lucide-react"

type AvailabilityPostCompact = {
  id: string
  availability: string
  expires_at: string
  username?: string | null
  role?: string | null
  engine?: string | null
  language?: string | null
  avatar_url?: string | null
  jam?: { id: string; title: string | null; url: string | null } | null
  kudosCounts?: KudosCounts | null
}

function isExpiringSoon(expiresAt: string): boolean {
  const diff = new Date(expiresAt).getTime() - Date.now()
  return diff > 0 && diff <= 1000 * 60 * 60 * 72
}

export function DashboardAvailabilityCompact({
  posts,
  renewingPostId,
  onRenewPost,
  onDeletePost,
  profileAvatarUrl,
}: {
  posts: AvailabilityPostCompact[]
  renewingPostId: string | null
  onRenewPost: (postId: string) => void
  onDeletePost: (postId: string) => void
  profileAvatarUrl?: string | null
}) {
  return (
    <div className="space-y-4">
      <Card className="border-border/40 bg-card/70 shadow-sm backdrop-blur-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3">
          <div className="flex items-center gap-2">
            <Hand className="size-4 text-lavender" />
            <p className="text-xs font-semibold text-foreground">My availability posts ({posts.length}/3)</p>
          </div>
          <Button asChild size="sm" className="h-8 cursor-pointer rounded-lg text-xs">
            <Link href="/create-profile">Post availability</Link>
          </Button>
        </CardContent>
      </Card>

      {posts.length === 0 ? (
        <Card className="border-border/40 bg-card/70 shadow-sm backdrop-blur-sm">
          <CardContent className="p-5 text-center text-sm text-muted-foreground">
            No availability posts yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {posts.map((post) => {
            const renewing = renewingPostId === post.id
            const expiresSoon = isExpiringSoon(post.expires_at)
            return (
              <Card key={post.id} className="border-border/40 bg-card/70 shadow-sm backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <UserAvatar
                        src={post.avatar_url ?? profileAvatarUrl ?? null}
                        fallbackName={post.username ?? "Jammer"}
                        size="xs"
                        className="size-7"
                      />
                      <p className="truncate text-xs font-semibold text-foreground">{post.username ?? "Jammer"}</p>
                    </div>
                    {expiresSoon ? (
                      <Badge className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0 text-[10px] text-amber-500">
                        Expires soon
                      </Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pb-4">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3 text-lavender" />
                      {post.availability}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Cpu className="size-3 text-lavender" />
                      {post.engine || "Any engine"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Globe className="size-3 text-teal" />
                      {post.language || "Any language"}
                    </span>
                  </div>

                  {post.role ? (
                    <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px]">
                      {post.role}
                    </Badge>
                  ) : null}

                  <KudosBadgeRow counts={post.kudosCounts} size="xs" />

                  {post.jam?.title ? (
                    <p className="truncate text-[11px] text-primary">
                      {post.jam.url ? (
                        <a
                          href={post.jam.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex cursor-pointer items-center gap-1 hover:underline"
                        >
                          {post.jam.title}
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        post.jam.title
                      )}
                    </p>
                  ) : null}

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 cursor-pointer rounded-md text-xs"
                      disabled={renewing}
                      onClick={() => onRenewPost(post.id)}
                    >
                      <RotateCw className={`size-3.5 ${renewing ? "animate-spin" : ""}`} />
                      {renewing ? "Renewing..." : "Renew"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 cursor-pointer rounded-md border-destructive/40 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={renewing}
                      onClick={() => onDeletePost(post.id)}
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
