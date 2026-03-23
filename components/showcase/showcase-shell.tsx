"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BrowserFrame } from "@/components/showcase/browser-frame"
import { MockHero } from "@/components/showcase/mock-hero"
import { MockTeamGrid } from "@/components/showcase/mock-team-grid"
import { MockCreateForm } from "@/components/showcase/mock-create-form"
import { MockDashboard } from "@/components/showcase/mock-dashboard"
import { MockPlayers } from "@/components/showcase/mock-players"
import { MockNotifications } from "@/components/showcase/mock-notifications"
import { MockInviteModal } from "@/components/showcase/mock-invite-modal"
import { Gamepad2, Sparkles, Users, PenLine, LayoutDashboard, Bell, Mail, UserSearch } from "lucide-react"
import Link from "next/link"

const SHOWCASE_SECTIONS = [
  {
    id: "hero",
    badge: "Homepage",
    badgeIcon: Sparkles,
    badgeColor: "border-primary/20 bg-primary/10 text-primary",
    title: "Discover Your Next Jam Squad",
    description:
      "The homepage welcomes jammers with a bold hero section, live search with auto-suggestions, and advanced filters to narrow down the perfect team by engine, role, experience level, and language.",
    url: "gamejamcrew.com",
    cursorPosition: { x: "62%", y: "68%" },
    cursorLabel: "Filtering by English",
    component: MockHero,
    align: "left" as const,
  },
  {
    id: "teams",
    badge: "Browse Teams",
    badgeIcon: Users,
    badgeColor: "border-teal/30 bg-teal text-teal-foreground",
    title: "Interactive Team Cards",
    description:
      "Each team card displays the jam name, engine, open roles with color-coded badges, and member count at a glance. Hover to highlight, click to expand full details and apply instantly.",
    url: "gamejamcrew.com",
    cursorPosition: { x: "70%", y: "18%" },
    cursorLabel: "Viewing Neon Runners",
    component: MockTeamGrid,
    align: "right" as const,
  },
  {
    id: "create",
    badge: "Post a Team",
    badgeIcon: PenLine,
    badgeColor: "border-pink/30 bg-pink text-pink-foreground",
    title: "Create Your Squad in Seconds",
    description:
      "A clean, guided form lets you post your team with engine selection, role requirements, experience preferences, and an optional Discord link. The dropdown is open and ready for selection.",
    url: "gamejamcrew.com/create-team",
    cursorPosition: { x: "28%", y: "42%" },
    cursorLabel: "Selecting Godot",
    component: MockCreateForm,
    align: "left" as const,
  },
  {
    id: "members",
    badge: "Find Members",
    badgeIcon: UserSearch,
    badgeColor: "border-lavender/30 bg-lavender text-lavender-foreground",
    title: "Scout Available Jammers",
    description:
      "Browse player profiles with role badges, experience levels, preferred engines, and short bios. Each card is a gateway to invite talented members directly to your squad.",
    url: "gamejamcrew.com/find-members",
    cursorPosition: { x: "78%", y: "55%" },
    cursorLabel: "Checking out BeatMaker99",
    component: MockPlayers,
    align: "right" as const,
  },
  {
    id: "dashboard",
    badge: "Dashboard",
    badgeIcon: LayoutDashboard,
    badgeColor: "border-peach/20 bg-peach/10 text-peach",
    title: "Your Command Center",
    description:
      "Manage all your teams, review incoming applications with accept/decline actions, track your sent applications, and monitor your availability profiles -- all from one unified dashboard with tab navigation.",
    url: "gamejamcrew.com/dashboard",
    cursorPosition: { x: "72%", y: "56%" },
    cursorLabel: "Accepting SynthWave_Alex",
    component: MockDashboard,
    align: "left" as const,
  },
  {
    id: "notifications",
    badge: "Notifications",
    badgeIcon: Bell,
    badgeColor: "border-primary/20 bg-primary/10 text-primary",
    title: "Real-Time Alerts",
    description:
      "A notification bell with an unread badge and dropdown shows new applications and squad invitations in real-time. Never miss a message from a potential teammate.",
    url: "gamejamcrew.com/dashboard",
    cursorPosition: { x: "82%", y: "8%" },
    cursorLabel: "3 new notifications",
    component: MockNotifications,
    align: "right" as const,
  },
  {
    id: "invite",
    badge: "Invite Flow",
    badgeIcon: Mail,
    badgeColor: "border-lavender/30 bg-lavender text-lavender-foreground",
    title: "Seamless Invitation System",
    description:
      "Invite jammers with a polished modal: pick the role, write a personalized message, and send. The recipient sees the invitation in their dashboard and can accept or decline with one click.",
    url: "gamejamcrew.com/find-members",
    cursorPosition: { x: "75%", y: "72%" },
    cursorLabel: "Sending invite",
    component: MockInviteModal,
    align: "left" as const,
  },
]

export function ShowcaseShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Page Hero */}
        <section className="relative overflow-hidden px-4 pb-12 pt-16 lg:px-6 lg:pt-24 lg:pb-20">
          <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
            <div className="absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/20 blur-[120px]" />
            <div className="absolute right-0 top-1/2 size-[400px] -translate-y-1/2 rounded-full bg-lavender/15 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Gamepad2 className="size-4" />
              Product Showcase
            </div>

            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              See <span className="text-primary">GameJamCrew</span> in Action
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Explore every feature of the platform -- from finding your squad to managing applications. Each screenshot captures real user interactions across the entire experience.
            </p>
          </div>
        </section>

        {/* Showcase Sections */}
        <section className="px-4 pb-24 lg:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-24 lg:gap-32">
              {SHOWCASE_SECTIONS.map((section, idx) => {
                const Icon = section.badgeIcon
                const isLeft = section.align === "left"

                return (
                  <div
                    key={section.id}
                    className={`flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-16 ${
                      !isLeft ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Text column */}
                    <div className="flex flex-col gap-4 lg:w-5/12">
                      <div
                        className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${section.badgeColor}`}
                      >
                        <Icon className="size-3.5" />
                        {section.badge}
                      </div>
                      <h2 className="text-balance text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
                        {section.title}
                      </h2>
                      <p className="text-pretty text-base leading-relaxed text-muted-foreground">
                        {section.description}
                      </p>

                      {/* Feature number */}
                      <div className="mt-2 flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-extrabold text-primary">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="h-px flex-1 bg-border/50" />
                      </div>
                    </div>

                    {/* Browser mockup column */}
                    <div className="lg:w-7/12">
                      <BrowserFrame
                        url={section.url}
                        cursorPosition={section.cursorPosition}
                        cursorLabel={section.cursorLabel}
                        highlighted={idx % 2 === 0}
                      >
                        <section.component />
                      </BrowserFrame>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="relative overflow-hidden border-t border-border/50 px-4 py-16 lg:px-6 lg:py-24">
          <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true">
            <div className="absolute left-1/2 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
              Ready to Find Your Squad?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              Join hundreds of indie developers, artists, and designers already building games together on GameJamCrew.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/create-team"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
              >
                <Users className="size-5" />
                Create a Squad
              </Link>
              <Link
                href="/teams"
                className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card px-8 py-3 text-base font-semibold text-foreground transition-all hover:border-primary/40 hover:text-primary"
              >
                <Sparkles className="size-5" />
                Browse Teams
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer tagline="GameJamCrew - The team builder for Game Jams" />
    </div>
  )
}
