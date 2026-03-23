import type { Metadata } from "next"
import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { HomeShell } from "@/components/home-shell"

export const metadata: Metadata = {
  title: "Find a Squad",
  description: "Browse open game jam teams looking for developers, artists, audio designers and more. Find your perfect jam squad.",
}

export default function TeamsBrowsePage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen" />}>
        <HomeShell />
      </Suspense>
    </>
  )
}
