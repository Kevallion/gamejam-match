"use client"

import type { ComponentType } from "react"
import type { LucideIcon } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { BrowserFrame } from "@/components/showcase/browser-frame"
import { MockHero } from "@/components/showcase/mock-hero"
import { MockTeamGrid } from "@/components/showcase/mock-team-grid"
import { MockCreateForm } from "@/components/showcase/mock-create-form"
import { MockDashboard } from "@/components/showcase/mock-dashboard"
import { MockPlayers } from "@/components/showcase/mock-players"
import { MockNotifications } from "@/components/showcase/mock-notifications"
import { MockInviteModal } from "@/components/showcase/mock-invite-modal"
import { Gamepad2, Sparkles, Users, PenLine, LayoutDashboard, Bell, Mail, UserSearch, Sword } from "lucide-react"
import Link from "next/link"

const DOT_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%2394a3b8' fill-opacity='0.35'/%3E%3C/svg%3E")`

type ShowcaseSection = {
  id: string
  badge: string
  badgeIcon: LucideIcon
  /** Offset shadow border for neo BrowserFrame */
  frameAccent: string
  iconColor: string
  numberColor: string
  title: string
  description: string
  url: string
  cursorPosition: { x: string; y: string }
  cursorLabel: string
  component: ComponentType
  align: "left" | "right"
}

const SHOWCASE_SECTIONS: ShowcaseSection[] = [
  {
    id: "hero",
    badge: "Homepage",
    badgeIcon: Sparkles,
    frameAccent: "border-teal",
    iconColor: "text-teal",
    numberColor: "text-teal",
    title: "Discover Your Next Jam Squad",
    description:
      "The homepage welcomes jammers with a bold hero section, live search with auto-suggestions, and advanced filters to narrow down the perfect team by engine, role, experience level, and language.",
    url: "gamejamcrew.com",
    cursorPosition: { x: "62%", y: "68%" },
    cursorLabel: "Filtering by English",
    component: MockHero,
    align: "left",
  },
  {
    id: "teams",
    badge: "Browse Teams",
    badgeIcon: Users,
    frameAccent: "border-pink",
    iconColor: "text-pink",
    numberColor: "text-pink",
    title: "Interactive Team Cards",
    description:
      "Each team card displays the jam name, engine, open roles with color-coded badges, and member count at a glance. Hover to highlight, click to expand full details and apply instantly.",
    url: "gamejamcrew.com",
    cursorPosition: { x: "70%", y: "18%" },
    cursorLabel: "Viewing Neon Runners",
    component: MockTeamGrid,
    align: "right",
  },
  {
    id: "create",
    badge: "Post a Team",
    badgeIcon: PenLine,
    frameAccent: "border-lavender",
    iconColor: "text-lavender",
    numberColor: "text-lavender",
    title: "Create Your Squad in Seconds",
    description:
      "A clean, guided form lets you post your team with engine selection, role requirements, experience preferences, and an optional Discord link. The dropdown is open and ready for selection.",
    url: "gamejamcrew.com/create-team",
    cursorPosition: { x: "28%", y: "42%" },
    cursorLabel: "Selecting Godot",
    component: MockCreateForm,
    align: "left",
  },
  {
    id: "members",
    badge: "Find Members",
    badgeIcon: UserSearch,
    frameAccent: "border-teal",
    iconColor: "text-teal",
    numberColor: "text-teal",
    title: "Scout Available Jammers",
    description:
      "Browse player profiles with role badges, experience levels, preferred engines, and short bios. Each card is a gateway to invite talented members directly to your squad.",
    url: "gamejamcrew.com/find-members",
    cursorPosition: { x: "78%", y: "55%" },
    cursorLabel: "Checking out BeatMaker99",
    component: MockPlayers,
    align: "right",
  },
  {
    id: "dashboard",
    badge: "Dashboard",
    badgeIcon: LayoutDashboard,
    frameAccent: "border-peach",
    iconColor: "text-peach",
    numberColor: "text-peach",
    title: "Your Command Center",
    description:
      "Manage all your teams, review incoming applications with accept/decline actions, track your sent applications, and monitor your availability profiles -- all from one unified dashboard with tab navigation.",
    url: "gamejamcrew.com/dashboard",
    cursorPosition: { x: "72%", y: "56%" },
    cursorLabel: "Accepting SynthWave_Alex",
    component: MockDashboard,
    align: "left",
  },
  {
    id: "notifications",
    badge: "Notifications",
    badgeIcon: Bell,
    frameAccent: "border-pink",
    iconColor: "text-pink",
    numberColor: "text-pink",
    title: "Real-Time Alerts",
    description:
      "A notification bell with an unread badge and dropdown shows new applications and squad invitations in real-time. Never miss a message from a potential teammate.",
    url: "gamejamcrew.com/dashboard",
    cursorPosition: { x: "82%", y: "8%" },
    cursorLabel: "3 new notifications",
    component: MockNotifications,
    align: "right",
  },
  {
    id: "invite",
    badge: "Invite Flow",
    badgeIcon: Mail,
    frameAccent: "border-lavender",
    iconColor: "text-lavender",
    numberColor: "text-lavender",
    title: "Seamless Invitation System",
    description:
      "Invite jammers with a polished modal: pick the role, write a personalized message, and send. The recipient sees the invitation in their dashboard and can accept or decline with one click.",
    url: "gamejamcrew.com/find-members",
    cursorPosition: { x: "75%", y: "72%" },
    cursorLabel: "Sending invite",
    component: MockInviteModal,
    align: "left",
  },
]

export function ShowcaseShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Page hero — landing-style */}
        <section
          className="relative overflow-hidden px-4 pb-16 pt-20 lg:px-8 lg:pb-20 lg:pt-24"
          style={{ backgroundImage: DOT_PATTERN, backgroundColor: "var(--background)" }}
        >
          <div className="mx-auto mb-12 max-w-6xl">
            <div className="h-0.5 w-full border-t-2 border-dashed border-slate-300" />
          </div>

          <div className="relative mx-auto max-w-6xl">
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-4 py-1.5 text-sm font-bold text-foreground shadow-[3px_3px_0px_0px_var(--neo-shadow)]">
                <Gamepad2 className="size-4 text-teal" />
                Product Showcase
              </div>

              <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                See <span className="text-teal">GameJamCrew</span> in Action
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                Explore every feature of the platform -- from finding your squad to managing applications. Each
                screenshot captures real user interactions across the entire experience.
              </p>
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-6xl">
            <div className="h-0.5 w-full border-t-2 border-dashed border-slate-300" />
          </div>
        </section>

        {/* Showcase sections */}
        <section
          className="px-4 py-20 lg:px-8 lg:py-28"
          style={{ backgroundImage: DOT_PATTERN, backgroundColor: "var(--background)" }}
        >
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-24 lg:gap-32">
              {SHOWCASE_SECTIONS.map((section, idx) => {
                const Icon = section.badgeIcon
                const isLeft = section.align === "left"
                const num = String(idx + 1).padStart(2, "0")

                return (
                  <div
                    key={section.id}
                    className={`flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-16 ${
                      !isLeft ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    <div className="relative flex flex-col gap-4 lg:w-5/12">
                      <div className="flex items-start justify-between gap-4">
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-foreground bg-card px-4 py-1.5 text-sm font-bold text-foreground shadow-[3px_3px_0px_0px_var(--neo-shadow)]">
                          <Icon className={`size-4 shrink-0 ${section.iconColor}`} />
                          {section.badge}
                        </div>
                        <span
                          className={`select-none text-5xl font-black leading-none tabular-nums opacity-20 lg:text-6xl ${section.numberColor}`}
                          aria-hidden
                        >
                          {num}
                        </span>
                      </div>

                      <h2 className="text-balance text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
                        {section.title}
                      </h2>
                      <p className="text-pretty text-base leading-relaxed text-muted-foreground">
                        {section.description}
                      </p>
                    </div>

                    <div className="lg:w-7/12">
                      <BrowserFrame
                        variant="neo"
                        accentClassName={section.frameAccent}
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

        {/* Bottom CTA — landing-cta style, links preserved */}
        <section
          className="relative overflow-hidden px-4 py-20 lg:px-8 lg:py-28"
          style={{ backgroundImage: DOT_PATTERN, backgroundColor: "var(--background)" }}
        >
          <div className="mx-auto mb-16 max-w-6xl">
            <div className="h-0.5 w-full border-t-2 border-dashed border-slate-300" />
          </div>

          <div className="relative mx-auto max-w-4xl">
            <div className="relative">
              <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border-2 border-teal opacity-50" aria-hidden />

              <div className="relative rounded-2xl border-2 border-foreground bg-card p-8 text-center md:p-12 lg:p-16">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-4 py-1.5 text-sm font-bold text-foreground shadow-[3px_3px_0px_0px_var(--neo-shadow)]">
                    <Sword className="size-4 text-teal" />
                    Your next jam awaits
                  </div>
                </div>

                <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-xl border-2 border-teal/30 bg-teal/10">
                  <Users className="size-10 text-teal" />
                </div>

                <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                  Ready to find your
                  <br />
                  <span className="text-teal">squad?</span>
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                  Join hundreds of indie developers, artists, and designers already building games together on
                  GameJamCrew.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/create-team"
                    className="inline-flex h-14 min-w-[200px] items-center justify-center gap-2 rounded-lg border-2 border-foreground bg-teal px-8 text-base font-extrabold text-white shadow-[4px_4px_0px_0px_var(--neo-shadow)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--neo-shadow)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_var(--neo-shadow)]"
                  >
                    <Users className="size-5" />
                    Create a Squad
                  </Link>
                  <Link
                    href="/teams"
                    className="inline-flex h-14 min-w-[200px] items-center justify-center gap-2 rounded-lg border-2 border-foreground bg-card px-8 text-base font-extrabold text-foreground shadow-[4px_4px_0px_0px_var(--neo-shadow)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--neo-shadow)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_var(--neo-shadow)]"
                  >
                    <Sparkles className="size-5" />
                    Browse Teams
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="size-2 rounded-full border border-slate-300 bg-muted" />
              ))}
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-6xl">
            <div className="h-0.5 w-full border-t-2 border-dashed border-slate-300" />
          </div>
        </section>
      </main>
    </div>
  )
}
