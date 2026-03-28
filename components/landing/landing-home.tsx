import { LandingNavbar } from "@/components/landing/landing-navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { MakerSection } from "@/components/landing/maker-section"
import { FeaturesSection } from "@/components/landing/features-section"

export function LandingHome() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <MakerSection />
        <FeaturesSection />
      </main>
    </div>
  )
}
