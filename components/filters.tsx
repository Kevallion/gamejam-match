"use client"

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { SlidersHorizontal } from "lucide-react"

interface FiltersProps {
  onEngineChange: (val: string) => void
  onRoleChange: (val: string) => void
  onLevelChange: (val: string) => void
  onLanguageChange: (val: string) => void
}

export function Filters({ onEngineChange, onRoleChange, onLevelChange, onLanguageChange }: FiltersProps) {
  return (
    <section className="px-4 py-6 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 mb-4">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Filter teams
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          
          <Select onValueChange={onEngineChange} defaultValue="all">
            <SelectTrigger className="w-[160px] rounded-xl border-border/60 bg-card">
              <SelectValue placeholder="Engine" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Any Engine</SelectItem>
              <SelectItem value="godot">Godot</SelectItem>
              <SelectItem value="unity">Unity</SelectItem>
              <SelectItem value="unreal">Unreal Engine</SelectItem>
              <SelectItem value="gamemaker">GameMaker</SelectItem>
              <SelectItem value="pico8">PICO-8</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={onRoleChange} defaultValue="all">
            <SelectTrigger className="w-[180px] rounded-xl border-border/60 bg-card">
              <SelectValue placeholder="Role Needed" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Any Role</SelectItem>
              <SelectItem value="developer">Developer</SelectItem>
              <SelectItem value="2d-artist">2D Artist</SelectItem>
              <SelectItem value="3d-artist">3D Artist</SelectItem>
              <SelectItem value="audio">Audio / Music</SelectItem>
              <SelectItem value="writer">Writer / Narrative</SelectItem>
              <SelectItem value="game-design">Game Designer</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={onLevelChange} defaultValue="all">
            <SelectTrigger className="w-[180px] rounded-xl border-border/60 bg-card">
              <SelectValue placeholder="Experience Level" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Any Level</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="hobbyist">Hobbyist</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="veteran">Veteran</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={onLanguageChange} defaultValue="all">
            <SelectTrigger className="w-[160px] rounded-xl border-border/60 bg-card">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Any Language</SelectItem>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="french">French</SelectItem>
              <SelectItem value="spanish">Spanish</SelectItem>
            </SelectContent>
          </Select>

        </div>
      </div>
    </section>
  )
}