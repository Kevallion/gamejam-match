"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Filters } from "@/components/filters"
import { TeamGrid } from "@/components/team-grid"
import { Gamepad2, Heart } from "lucide-react"


export default function Home() {
  // 🧠 Le cerveau des filtres de la page d'accueil
  const [searchQuery, setSearchQuery] = useState("")
  const [engineFilter, setEngineFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [languageFilter, setLanguageFilter] = useState("all")

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
        />
        <Filters 
          onEngineChange={setEngineFilter}
          onRoleChange={setRoleFilter}
          onLevelChange={setLevelFilter}
          onLanguageChange={setLanguageFilter}
        />
        <TeamGrid 
          searchQuery={searchQuery}
          engineFilter={engineFilter}
          roleFilter={roleFilter}
          levelFilter={levelFilter}
          languageFilter={languageFilter}
        />
      </main>
      <footer className="border-t border-border/50 bg-card/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center lg:px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span><Heart className="size-4 text-pink" /><span>by</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
              <Gamepad2 className="size-4 text-primary" />JamSquad
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}