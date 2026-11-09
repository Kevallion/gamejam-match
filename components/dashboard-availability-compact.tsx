"use client"

import Link from "next/link"
import { KudosBadgeRow } from "@/components/kudos-badges"
import type { KudosCounts } from "@/lib/kudos"
import { UserAvatar } from "@/components/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppIcon } from "@/components/ui/app-icon"
import { ICON } from "@/lib/icons"
import { cn } from "@/lib/utils"

type AvailabilityPostCompact = {
  id: string
  availability: string
  expires_at: string
  username?: string | null
  role?: string | null
  experience?: string | null
  engine?: string | null
  language?: string | null
  avatar_url?: string | null
  jam?: { id: string; title: string | null; url: string | null } | null
  kudosCounts?: KudosCounts | null
}

function daysUntil(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

const QUOTA = 3

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
  const atQuota = posts.length >= QUOTA

  return (
    <div className="min-w-0 max-w-full space-y-4">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{posts.length}</span> / {QUOTA} active posts
        </p>
        <Button
          asChild
          disabled={atQuota}
          className={cn(
            "h-11 rounded-xl bg-teal text-teal-foreground hover:bg-teal/90",
            atQuota && "pointer-events-none opacity-50",
          )}
        >
          <Link href={atQuota ? "/dashboard?tab=availability" : "/create-profile"}>
            <AppIcon icon={ICON.create} size="sm" className="mr-1.5 text-teal-foreground" />
            New post
          </Link>
        </Button>
      </div>
      {atQuota ? (
        <p className="text-xs text-muted-foreground">
          Quota reached. Renew or remove a post before publishing another.
        </p>
      ) : null}

      {posts.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-transparent">
          <CardContent className="flex flex-col items-center gap-3 px-4 py-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-lavender/15">
              <AppIcon icon={ICON.available} size="xl" tone="lavender" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">Post your availability</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Captains can invite you directly
              </p>
            </div>
            <Button asChild className="h-11 rounded-xl bg-teal text-teal-foreground hover:bg-teal/90">
              <Link href="/create-profile">Post availability</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {posts.map((post) => {
            const renewing = renewingPostId === post.id
            const days = daysUntil(post.expires_at)
            const expiresSoon = days <= 3
            return (
              <Card key={post.id} className="card-interactive min-w-0 border-border/50 bg-card shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {post.role ? (
                      <Badge className="rounded-full border-lavender/40 bg-lavender/15 px-2.5 py-0.5 text-xs text-lavender">
                        {post.role}
                      </Badge>
                    ) : null}
                    {post.experience ? (
                      <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs">
                        {post.experience}
                      </Badge>
                    ) : null}
                    <Badge
                      className={cn(
                        "ml-auto rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                        expiresSoon
                          ? "border-peach/40 bg-peach/10 text-peach"
                          : "border-border/50 bg-secondary/60 text-muted-foreground",
                      )}
                    >
                      Expires in {days} d
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      src={post.avatar_url ?? profileAvatarUrl ?? null}
                      fallbackName={post.username ?? "Jammer"}
                      size="xs"
                      className="size-7"
                    />
                    <p className="truncate text-sm text-foreground">
                      {post.availability}
                      {post.jam?.title ? ` · ${post.jam.title}` : ""}
                    </p>
                  </div>

                  <KudosBadgeRow counts={post.kudosCounts} size="xs" />

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      className="h-11 rounded-xl bg-teal text-teal-foreground hover:bg-teal/90"
                      disabled={renewing}
                      onClick={() => onRenewPost(post.id)}
                    >
                      <AppIcon
                        icon={ICON.refresh}
                        size="sm"
                        className={cn("mr-1.5 text-teal-foreground", renewing && "animate-spin")}
                      />
                      {renewing ? "Renewing..." : "Renew"}
                    </Button>
                    <Button asChild type="button" variant="outline" className="h-11 rounded-xl">
                      <Link href="/create-profile">Edit</Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-11 rounded-xl"
                          aria-label="More"
                          disabled={renewing}
                        >
                          <AppIcon icon={ICON.more} size="md" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDeletePost(post.id)}
                        >
                          Delete post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {!atQuota ? (
            <Link
              href="/create-profile"
              className="card-interactive flex min-h-[176px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-transparent p-4 text-center"
            >
              <AppIcon icon={ICON.create} size="lg" tone="muted" />
              <span className="text-sm font-semibold text-foreground">New post</span>
              <span className="text-xs text-muted-foreground">
                {QUOTA - posts.length} slot{QUOTA - posts.length === 1 ? "" : "s"} left
              </span>
            </Link>
          ) : null}
        </div>
      )}
    </div>
  )
}
