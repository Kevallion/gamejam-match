"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { UserCircle, Search, Rocket, ArrowRight, Check, Sparkles } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: UserCircle,
    title: "Create Your Profile",
    description: "Set up your jammer profile with your skills, preferred engines, experience level, and the roles you're looking to fill or play.",
    color: "teal",
    details: ["Add your skills & expertise", "Set your availability", "Choose preferred engines"],
  },
  {
    number: "02",
    icon: Search,
    title: "Find Your Team",
    description: "Browse teams looking for members or post your own squad. Use smart filters to find the perfect match for your playstyle.",
    color: "peach",
    details: ["Smart matchmaking", "Advanced filters", "Direct messaging"],
  },
  {
    number: "03",
    icon: Rocket,
    title: "Jam Together",
    description: "Connect with your teammates, coordinate your jam strategy, and ship an amazing game. Level up and earn XP along the way!",
    color: "lavender",
    details: ["Real-time coordination", "Progress tracking", "Earn XP rewards"],
  },
]

export function LandingHowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative overflow-hidden px-4 py-20 lg:px-6 lg:py-32 bg-muted/30">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center mb-16"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-1.5 text-sm font-medium text-teal">
            <Sparkles className="size-4" />
            Simple Process
          </div>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            From solo to squad
            <br />
            <span className="text-primary">in three steps</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Getting started is easy. Create a profile, find your perfect team, and start jamming.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line - desktop */}
          <div className="absolute left-1/2 top-[60px] hidden h-[calc(100%-120px)] w-px -translate-x-1/2 bg-gradient-to-b from-teal via-peach to-lavender opacity-30 lg:block" />

          <div className="flex flex-col gap-12 lg:gap-0">
            {steps.map((step, index) => {
              const colorClasses = {
                teal: {
                  bg: "bg-teal/10",
                  text: "text-teal",
                  border: "border-teal/30",
                  glow: "shadow-teal/20",
                },
                peach: {
                  bg: "bg-peach/10",
                  text: "text-peach",
                  border: "border-peach/30",
                  glow: "shadow-peach/20",
                },
                lavender: {
                  bg: "bg-lavender/10",
                  text: "text-lavender",
                  border: "border-lavender/30",
                  glow: "shadow-lavender/20",
                },
              }[step.color]

              const isEven = index % 2 === 0

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`relative flex flex-col items-center gap-6 lg:flex-row lg:gap-12 ${
                    !isEven ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content card */}
                  <div className={`flex-1 ${isEven ? "lg:text-right" : "lg:text-left"}`}>
                    <div className={`inline-block rounded-2xl border ${colorClasses.border} bg-card p-6 shadow-xl ${colorClasses.glow} max-w-md ${isEven ? "lg:ml-auto" : ""}`}>
                      {/* Step number */}
                      <span className={`text-5xl font-extrabold ${colorClasses.text} opacity-20`}>
                        {step.number}
                      </span>
                      
                      <h3 className="mt-2 text-xl font-bold text-foreground">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>

                      {/* Details list */}
                      <ul className={`mt-4 space-y-2 ${isEven ? "lg:ml-auto lg:text-right" : ""}`}>
                        {step.details.map((detail) => (
                          <li
                            key={detail}
                            className={`flex items-center gap-2 text-sm text-muted-foreground ${
                              isEven ? "lg:flex-row-reverse" : ""
                            }`}
                          >
                            <Check className={`size-4 ${colorClasses.text}`} />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Center icon */}
                  <div className="relative z-10 flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : {}}
                      transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }}
                      className={`flex size-20 items-center justify-center rounded-2xl border-2 ${colorClasses.border} ${colorClasses.bg} shadow-xl ${colorClasses.glow}`}
                    >
                      <step.icon className={`size-9 ${colorClasses.text}`} />
                    </motion.div>
                    
                    {/* Arrow to next step */}
                    {index < steps.length - 1 && (
                      <div className="mt-4 lg:hidden">
                        <ArrowRight className="size-6 rotate-90 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  {/* Spacer for alignment */}
                  <div className="hidden flex-1 lg:block" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
