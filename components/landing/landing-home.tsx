"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingShowcase } from "@/components/landing/landing-showcase"
import { LandingFeatures } from "@/components/landing/landing-features"
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works"
import { LandingCTA } from "@/components/landing/landing-cta"

export function LandingHome() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <LandingHero />
        <LandingShowcase />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingCTA />
      </main>
      <Footer tagline="The ultimate team builder for Game Jams" />
    </div>
  )
}
