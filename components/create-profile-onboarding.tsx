"use client"

import { OnboardingModal } from "@/components/onboarding-modal"

/**
 * ONB-3: /create-profile is the destination for signed-in users who have not
 * finished onboarding. The availability form on this page does not set
 * `has_completed_onboarding`, so we reuse the existing onboarding modal.
 * The dialog stays open until completeOnboarding succeeds.
 */
export function CreateProfileOnboarding() {
  return <OnboardingModal open onOpenChange={() => {}} />
}