"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { 
  Brain,
  MessageCircle,
  Trophy,
  Sparkles,
  Users,
  Zap,
  Target,
  Star,
  Award
} from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "Smart Matchmaking",
    description: "Our intelligent algorithm pairs you with jammers who complement your skills, match your experience level, and speak your language.",
    color: "from-teal to-primary",
    bgColor: "bg-teal/10",
    iconColor: "text-teal",
    highlights: [
      { icon: Target, label: "Skill-based matching" },
      { icon: Users, label: "Team chemistry" },
      { icon: Sparkles, label: "Role compatibility" },
    ],
  },
  {
    icon: MessageCircle,
    title: "In-App Messaging",
    description: "Chat directly with potential teammates, coordinate project details, and build connections — all without leaving the platform.",
    color: "from-peach to-pink",
    bgColor: "bg-peach/10",
    iconColor: "text-peach",
    highlights: [
      { icon: Zap, label: "Real-time chat" },
      { icon: Users, label: "Team channels" },
      { icon: Star, label: "Rich notifications" },
    ],
  },
  {
    icon: Trophy,
    title: "RPG Gamification",
    description: "Level up as you participate in jams, earn XP for team activities, unlock exclusive titles, and showcase your progression on your profile.",
    color: "from-lavender to-primary",
    bgColor: "bg-lavender/10",
    iconColor: "text-lavender",
    highlights: [
      { icon: Zap, label: "XP System" },
      { icon: Award, label: "Unique Titles" },
      { icon: Star, label: "Level Badges" },
    ],
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
}

export function LandingFeatures() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <section ref={ref} className="relative overflow-hidden px-4 py-20 lg:px-6 lg:py-32">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute right-0 top-1/4 size-[500px] rounded-full bg-teal/5 blur-[120px]" />
        <div className="absolute left-0 bottom-1/4 size-[400px] rounded-full bg-peach/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center mb-16"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lavender/30 bg-lavender/10 px-4 py-1.5 text-sm font-medium text-lavender">
            <Sparkles className="size-4" />
            Powerful Features
          </div>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Everything you need to
            <br />
            <span className="text-primary">win your next jam</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Three core features designed to make team building effortless and game development fun.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-6 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="group relative"
            >
              {/* Card glow effect */}
              <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-20`} />
              
              {/* Card */}
              <div className="relative h-full rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-border hover:shadow-xl">
                {/* Icon */}
                <div className={`mb-4 inline-flex size-14 items-center justify-center rounded-2xl ${feature.bgColor}`}>
                  <feature.icon className={`size-7 ${feature.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="mb-6 text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-2">
                  {feature.highlights.map((highlight) => (
                    <div
                      key={highlight.label}
                      className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground"
                    >
                      <highlight.icon className="size-3.5" />
                      {highlight.label}
                    </div>
                  ))}
                </div>

                {/* Corner decoration */}
                <div className={`absolute right-4 top-4 size-20 rounded-full bg-gradient-to-br ${feature.color} opacity-[0.03] blur-2xl transition-opacity group-hover:opacity-[0.08]`} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 rounded-2xl border border-border/40 bg-card/50 p-6 lg:gap-16"
        >
          {[
            { value: "90%", label: "Match satisfaction" },
            { value: "< 24h", label: "Avg. team formation" },
            { value: "4.9/5", label: "User rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold text-foreground lg:text-4xl">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
