"use client"

import { UserCircle, Search, Rocket, Sparkles } from "lucide-react"

const DOT_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%2394a3b8' fill-opacity='0.35'/%3E%3C/svg%3E")`

const steps = [
  {
    number: "01",
    icon: UserCircle,
    title: "Create Your Profile",
    description:
      "Set up your jammer profile with your skills, preferred engines, experience level, and the roles you want to play.",
    accent: "border-teal",
    iconBg: "bg-teal/10 border-teal/30",
    iconColor: "text-teal",
    numberColor: "text-teal",
  },
  {
    number: "02",
    icon: Search,
    title: "Find Your Team",
    description:
      "Browse teams looking for members or post your own squad. Use filters to find the perfect match for your playstyle.",
    accent: "border-lavender",
    iconBg: "bg-lavender/10 border-lavender/30",
    iconColor: "text-lavender",
    numberColor: "text-lavender",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Jam Together",
    description:
      "Connect with your teammates, coordinate your jam strategy, and ship an amazing game. Level up and earn XP!",
    accent: "border-pink",
    iconBg: "bg-pink/10 border-pink/30",
    iconColor: "text-pink",
    numberColor: "text-pink",
  },
]

export function LandingHowItWorks() {
  return (
    <section
      className="relative overflow-hidden px-4 py-20 lg:px-8 lg:py-28"
      style={{ backgroundImage: DOT_PATTERN, backgroundColor: "var(--background)" }}
    >
      <div className="relative mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-14 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-4 py-1.5 text-sm font-bold text-foreground shadow-[3px_3px_0px_0px_var(--neo-shadow)]">
            <Sparkles className="size-4 text-lavender" />
            Simple Process
          </div>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            From solo to squad{" "}
            <span className="text-teal">in three steps.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
            Getting started is easy. Create a profile, find your perfect team, and start jamming.
          </p>
        </div>

        {/* Steps grid */}
        <div className="relative">
          {/* Connecting line - desktop only */}
          <div className="pointer-events-none absolute left-0 right-0 top-[88px] hidden h-0.5 border-t-2 border-dashed border-slate-300 md:block" style={{ left: "16.67%", right: "16.67%" }} />

          <div className="grid gap-8 md:grid-cols-3 md:gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="group relative">
                {/* Neo-brutalist offset shadow */}
                <div
                  className={`absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-xl border-2 ${step.accent} opacity-40`}
                />

                {/* Card */}
                <div className="relative h-full rounded-xl border-2 border-foreground bg-card p-6 transition-transform duration-200 group-hover:-translate-y-0.5">
                  {/* Number + Icon row */}
                  <div className="mb-5 flex items-start justify-between">
                    <div
                      className={`flex size-14 items-center justify-center rounded-lg border-2 ${step.iconBg}`}
                    >
                      <step.icon className={`size-7 ${step.iconColor}`} />
                    </div>
                    <span
                      className={`text-5xl font-black leading-none ${step.numberColor} opacity-20`}
                    >
                      {step.number}
                    </span>
                  </div>

                  {/* Text */}
                  <h3 className="mb-2 text-xl font-extrabold text-foreground leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {/* Step indicator dot on connecting line */}
                <div className="absolute -top-3 left-1/2 hidden -translate-x-1/2 md:block">
                  <div className={`size-6 rounded-full border-2 border-foreground bg-card flex items-center justify-center`}>
                    <div className={`size-2 rounded-full ${step.iconColor.replace("text-", "bg-")}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="mt-14 text-center text-sm font-medium text-muted-foreground">
          No endless forms.{" "}
          <span className="font-bold text-foreground">
            Start building your dream team in minutes.
          </span>
        </p>
      </div>
    </section>
  )
}
