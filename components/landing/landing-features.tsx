"use client"

import { Users, Shield, Award } from "lucide-react"

const DOT_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%2394a3b8' fill-opacity='0.35'/%3E%3C/svg%3E")`

const features = [
  {
    icon: Users,
    number: "01",
    title: "Assemble your Party.",
    description:
      "Find the missing piece for your game. Filter by engine, role, and timezone to build the perfect crew before the jam clock starts.",
    tags: ["By Engine", "By Role", "By Timezone"],
    accent: "border-teal",
    iconBg: "bg-teal/10 border-teal/30",
    iconColor: "text-teal",
    numberColor: "text-teal",
    tagStyle: "bg-teal/10 text-teal border-teal/30",
  },
  {
    icon: Shield,
    number: "02",
    title: "The Squad Hideout.",
    description:
      "A private space for your team to share ideas, post assets, and stay organized from kickoff to submission — whether the jam is 3 days or a whole month.",
    tags: ["Asset Sharing", "Team Chat", "Progress Board"],
    accent: "border-lavender",
    iconBg: "bg-lavender/10 border-lavender/30",
    iconColor: "text-lavender",
    numberColor: "text-lavender",
    tagStyle: "bg-lavender/10 text-lavender border-lavender/30",
  },
  {
    icon: Award,
    number: "03",
    title: "Earn your Badges.",
    description:
      "Get Kudos from teammates, level up, and build a profile that shows your real jam experience. Your track record speaks louder than any portfolio.",
    tags: ["Kudos System", "Level Badges", "Jam History"],
    accent: "border-pink",
    iconBg: "bg-pink/10 border-pink/30",
    iconColor: "text-pink",
    numberColor: "text-pink",
    tagStyle: "bg-pink/10 text-pink border-pink/30",
  },
]

export function LandingFeatures() {
  return (
    <section
      className="relative overflow-hidden px-4 py-20 lg:px-8 lg:py-28"
      style={{ backgroundImage: DOT_PATTERN, backgroundColor: "var(--background)" }}
    >
      <div className="relative mx-auto max-w-6xl">

        {/* Section header */}
        <div className="mb-14 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-4 py-1.5 text-sm font-bold text-foreground shadow-[3px_3px_0px_0px_var(--neo-shadow)]">
            <span className="text-pink">⚔️</span>
            Your Quest Toolkit
          </div>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Three features. One{" "}
            <span className="text-teal">finished game.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
            Everything your team needs, from the party board to the victory screen.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.number} feature={feature} />
          ))}
        </div>

        {/* Bottom tagline */}
        <p className="mt-14 text-center text-sm font-medium text-muted-foreground">
          Built by jammers, for jammers.{" "}
          <span className="font-bold text-foreground">
            No endless scrolling through Discord servers.
          </span>
        </p>
      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────────
// Feature Card sub-component
// ────────────────────────────────────────────────────────────
function FeatureCard({ feature }: { feature: (typeof features)[number] }) {
  return (
    <div className="group relative">
      {/* Neo-brutalist offset shadow */}
      <div
        className={`absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-xl border-2 ${feature.accent} opacity-40`}
      />
      {/* Card */}
      <div
        className={`relative h-full rounded-xl border-2 border-foreground bg-card p-6 transition-transform duration-200 group-hover:-translate-y-0.5`}
      >
        {/* Number + Icon row */}
        <div className="mb-5 flex items-start justify-between">
          <div
            className={`flex size-12 items-center justify-center rounded-lg border-2 ${feature.iconBg}`}
          >
            <feature.icon className={`size-6 ${feature.iconColor}`} />
          </div>
          <span
            className={`text-4xl font-black leading-none ${feature.numberColor} opacity-20`}
          >
            {feature.number}
          </span>
        </div>

        {/* Text */}
        <h3 className="mb-2 text-xl font-extrabold text-foreground leading-snug">
          {feature.title}
        </h3>
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
          {feature.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {feature.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${feature.tagStyle}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
