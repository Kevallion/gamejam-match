"use client"

import { UserAvatar } from "@/components/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  CalendarDays,
  Cpu,
  ExternalLink,
  Globe,
  Hand,
  PenLine,
  Target,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { EXPERIENCE_STYLES, ROLE_STYLES } from "@/lib/constants"

const FALLBACK_ROLE = { label: "Other", emoji: "❓", color: "bg-muted text-muted-foreground" }
const FALLBACK_LEVEL = EXPERIENCE_STYLES["beginner"]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type AvailabilityPostData = {
  id: string
  user_id: string
  availability: string
  username?: string | null
  role?: string | null
  experience?: string | null
  jam_style?: string | null
  engine?: string | null
  language?: string | null
  bio?: string | null
  portfolio_link?: string | null
  avatar_url?: string | null
  jam?: { id: string; title: string | null; url: string | null } | null
}

// ---------------------------------------------------------------------------
// Full card per announcement (name, role, dates, bio, etc.)
// ---------------------------------------------------------------------------
interface AnnouncementCardProps {
  post: AvailabilityPostData
  onDelete: (postId: string) => void
  profileAvatarUrl?: string | null
}

function AnnouncementCard({ post, onDelete, profileAvatarUrl }: AnnouncementCardProps) {
  const rawRole = (post.role || "developer").toLowerCase()
  const rawLevel = (post.experience || "beginner").toLowerCase()
  const displayRole = ROLE_STYLES[rawRole] ?? { ...FALLBACK_ROLE, label: post.role || "Other" }
  const displayLevel = EXPERIENCE_STYLES[rawLevel] ?? FALLBACK_LEVEL
  const username = post.username || "Anonymous"

  return (
    <Card className="group relative flex flex-col rounded-2xl border-border/50 bg-card transition-all duration-300 hover:border-lavender/30 hover:shadow-lg hover:shadow-lavender/5">
      <CardContent className="flex flex-1 flex-col gap-4 pt-6">
        {/* Avatar + Username */}
        <div className="flex items-center gap-3.5">
          <UserAvatar
            src={post.avatar_url ?? profileAvatarUrl ?? null}
            fallbackName={username}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-foreground">
              {username}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Globe className="size-3.5 text-teal" />
              {post.language || "—"}
            </div>
          </div>
        </div>

        {/* Role & Level */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className={`rounded-full px-3 py-1 text-xs font-semibold ${displayRole.color}`}
          >
            {displayRole.emoji} {displayRole.label}
          </Badge>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${displayLevel.color}`}
          >
            {displayLevel.emoji} {displayLevel.label}
          </span>
        </div>

        {/* Availability dates */}
        <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/20 px-3 py-2">
          <CalendarDays className="size-4 shrink-0 text-lavender" />
          <span className="text-sm font-medium text-foreground">{post.availability}</span>
        </div>

        {/* Linked game jam */}
        {post.jam?.title && (
          <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/20 px-3 py-2">
            <Target className="size-4 shrink-0 text-lavender" />
            {post.jam.url ? (
              <a
                href={post.jam.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-lavender hover:underline"
              >
                {post.jam.title}
              </a>
            ) : (
              <span className="text-sm font-medium text-foreground">{post.jam.title}</span>
            )}
          </div>
        )}

        {/* Game engine */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Cpu className="size-3.5 text-lavender" />
          {post.engine || "—"}
        </div>

        {/* Portfolio */}
        {post.portfolio_link ? (
          <a
            href={post.portfolio_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-lavender hover:underline"
          >
            <ExternalLink className="size-3.5" />
            Portfolio
          </a>
        ) : null}

        {/* Bio */}
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {post.bio || "No bio."}
        </p>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          onClick={() => onDelete(post.id)}
          className="w-full gap-2 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
          Remove announcement
        </Button>
      </CardFooter>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
interface DashboardMyAvailabilityProps {
  availabilityPosts: AvailabilityPostData[]
  onDeletePost: (postId: string) => void
  profileAvatarUrl?: string | null
}

export function DashboardMyAvailability({
  availabilityPosts,
  onDeletePost,
  profileAvatarUrl,
}: DashboardMyAvailabilityProps) {
  const canAddMore = availabilityPosts.length < 3

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">My Availability</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your announcements (max 3). Each can have a different name, role, and availability.
          </p>
        </div>
        <Button
          asChild
          disabled={!canAddMore}
          className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/85 disabled:opacity-60"
        >
          <Link href="/create-profile">
            <Hand className="size-4" />
            Post Availability {availabilityPosts.length > 0 && `(${availabilityPosts.length}/3)`}
          </Link>
        </Button>
      </div>

      {availabilityPosts.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 rounded-2xl border-border/50 bg-card px-6 py-12 text-center">
          <PenLine className="size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            You haven&apos;t posted your availability yet.
          </p>
          <Button
            asChild
            variant="outline"
            className="mt-2 gap-2 rounded-xl border-lavender/30 text-lavender hover:bg-lavender/10 hover:text-lavender"
          >
            <Link href="/create-profile">Let teams find you</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {availabilityPosts.map((post) => (
            <AnnouncementCard
              key={post.id}
              post={post}
              onDelete={onDeletePost}
              profileAvatarUrl={profileAvatarUrl}
            />
          ))}
        </div>
      )}
    </section>
  )
}
