"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Cpu, Globe, Hand, Trash2, PenLine } from "lucide-react"
import Link from "next/link"

export type ProfileData = {
  id: any
  username: string
  avatarUrl: string
  role: { label: string; emoji: string; color: string }
  level: { label: string; emoji: string; color: string }
  engine: string
  language: string
  bio: string
}

interface DashboardMyAvailabilityProps {
  profiles: ProfileData[]
  onDelete: (id: any) => void
}

export function DashboardMyAvailability({
  profiles,
  onDelete,
}: DashboardMyAvailabilityProps) {
  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">
            My Availability
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your posted availability profiles
          </p>
        </div>
        <Button
          asChild
          className="gap-2 rounded-xl bg-lavender text-lavender-foreground hover:bg-lavender/85"
        >
          <Link href="/create-profile">
            <Hand className="size-4" />
            Post Availability
          </Link>
        </Button>
      </div>

      {profiles.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 rounded-2xl border-border/50 bg-card px-6 py-12 text-center">
          <PenLine className="size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            You haven{"'"}t posted your availability yet.
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
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className="group relative flex flex-col rounded-2xl border-border/50 bg-card transition-all duration-300 hover:border-lavender/30 hover:shadow-lg hover:shadow-lavender/5"
            >
              <CardContent className="flex flex-1 flex-col gap-4 pt-6">
                {/* Avatar + Username */}
                <div className="flex items-center gap-3.5">
                  <Avatar className="size-12 ring-2 ring-border/60">
                    <AvatarImage
                      src={profile.avatarUrl}
                      alt={profile.username}
                    />
                    <AvatarFallback className="bg-secondary text-sm font-bold text-secondary-foreground">
                      {profile.username
                        .split(/[\s_]+/)
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-bold text-foreground">
                      {profile.username}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Globe className="size-3.5 text-teal" />
                      {profile.language}
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${profile.role.color}`}
                  >
                    {profile.role.emoji} {profile.role.label}
                  </Badge>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${profile.level.color}`}
                  >
                    {profile.level.emoji} {profile.level.label}
                  </span>
                </div>

                {/* Engine */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Cpu className="size-3.5 text-lavender" />
                  {profile.engine}
                </div>

                {/* Bio */}
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {profile.bio}
                </p>
              </CardContent>

              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => onDelete(profile.id)}
                  className="w-full gap-2 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Remove Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}