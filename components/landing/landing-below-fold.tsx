"use client"

import { LandingShowcase } from "@/components/landing/landing-showcase"
import { LandingFeatures } from "@/components/landing/landing-features"
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works"
import { LandingCTA } from "@/components/landing/landing-cta"

/** Below-the-fold landing sections (lazy-loaded chunk via dynamic() in landing-home). */
export function LandingBelowFold() {
  return (
    <>
      <LandingShowcase />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingCTA />
    </>
  )
}
