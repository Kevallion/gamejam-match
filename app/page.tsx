"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Filters } from "@/components/filters"
import { TeamGrid } from "@/components/team-grid"
import { Footer } from "@/components/footer"


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
      <Footer />
    </div>
  )
}