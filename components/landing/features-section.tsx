import { Shield, Users, Star } from "lucide-react"

const features = [
  {
    icon: Users,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    accentBorder: "border-teal-400",
    accentShadow: "shadow-[4px_4px_0_#2dd4bf]",
    number: "01",
    title: "Assemble your Party.",
    description:
      "Find the missing piece for your game. Filter by engine, role, and timezone to discover teammates who are actually online when you are.",
    tags: ["Godot", "Unity", "Unreal", "Timezone match"],
  },
  {
    icon: Shield,
    iconBg: "bg-coral-100",
    iconColor: "text-coral-600",
    accentBorder: "border-coral-400",
    accentShadow: "shadow-[4px_4px_0_#fb923c]",
    number: "02",
    title: "The Squad Hideout.",
    description:
      "A private space for your team to share ideas, post assets, and stay organized from kickoff to submission — whether the jam is 3 days or a whole month.",
    tags: ["Asset sharing", "Task board", "48h or 30 days"],
  },
  {
    icon: Star,
    iconBg: "bg-lavender-100",
    iconColor: "text-lavender-600",
    accentBorder: "border-lavender-400",
    accentShadow: "shadow-[4px_4px_0_#a78bfa]",
    number: "03",
    title: "Earn your Badges.",
    description:
      "Get Kudos from teammates, level up, and build a profile that shows your real jam experience — not just a resume, but a battle-tested track record.",
    tags: ["Kudos", "XP system", "Verified jammer"],
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* header */}
        <div className="mb-14 flex flex-col items-center gap-3 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            What you get
          </p>
          <h2 className="text-4xl font-extrabold text-slate-900 text-balance md:text-5xl">
            Everything your jam crew needs.{" "}
            <span className="text-teal-500">Nothing you don&apos;t.</span>
          </h2>
          <p className="max-w-xl text-lg leading-relaxed text-slate-500">
            Built by a jammer, for jammers. No bloat, no subscription tiers — just the tools to
            find your people and ship the game.
          </p>
        </div>

        {/* cards grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className={`group relative flex flex-col gap-5 rounded-2xl border-2 border-slate-900 bg-white p-7 transition-transform hover:-translate-y-1 ${feature.accentShadow}`}
              >
                {/* number watermark */}
                <span className="absolute right-6 top-5 font-mono text-6xl font-black text-slate-50 select-none">
                  {feature.number}
                </span>

                {/* icon */}
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 border-slate-200 ${feature.iconBg}`}
                >
                  <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                </span>

                {/* text */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-extrabold text-slate-900">{feature.title}</h3>
                  <p className="leading-relaxed text-slate-500">{feature.description}</p>
                </div>

                {/* tags */}
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  {feature.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* bottom CTA banner */}
        <div className="mt-14 flex flex-col items-center gap-6 rounded-2xl border-2 border-slate-900 bg-slate-900 px-8 py-12 text-center shadow-[5px_5px_0_#14b8a6]">
          <p className="text-3xl font-extrabold text-white text-balance md:text-4xl">
            Your next game jam is waiting.
          </p>
          <p className="max-w-md text-slate-300">
            Join hundreds of indie devs who stopped going alone and started shipping together.
          </p>
          <button className="inline-flex items-center gap-2 rounded-xl border-2 border-white bg-teal-500 px-8 py-4 text-lg font-extrabold text-white shadow-[4px_4px_0_#ffffff40] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#ffffff40]">
            Find your Squad 🚀
          </button>
        </div>
      </div>
    </section>
  )
}
