"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SlidersHorizontal } from "lucide-react"

interface MemberFiltersProps {
  onRoleChange: (val: string) => void
  onEngineChange: (val: string) => void
  onLevelChange: (val: string) => void
}

export function MemberFilters({ onRoleChange, onEngineChange, onLevelChange }: MemberFiltersProps) {
  return (
    <section className="px-4 py-6 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center gap-3">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Filter members
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          
          {/* RÔLES */}
          <Select onValueChange={onRoleChange} defaultValue="all">
            <SelectTrigger className="w-[170px] rounded-xl border-border/60 bg-card text-card-foreground transition-colors hover:border-lavender/40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Any Role</SelectItem>
              <SelectItem value="developer">Developer</SelectItem>
              <SelectItem value="2d-artist">2D Artist</SelectItem>
              <SelectItem value="3d-artist">3D Artist</SelectItem>
              <SelectItem value="audio">Audio / Music</SelectItem>
              <SelectItem value="writer">Writer / Narrative</SelectItem>
              <SelectItem value="game-design">Game Designer</SelectItem>
              <SelectItem value="ui-ux">UI / UX</SelectItem>
              <SelectItem value="qa">QA / Playtester</SelectItem>
            </SelectContent>
          </Select>

          {/* MOTEUR (ENGINE) */}
          <Select onValueChange={onEngineChange} defaultValue="all">
            <SelectTrigger className="w-[170px] rounded-xl border-border/60 bg-card text-card-foreground transition-colors hover:border-lavender/40">
              <SelectValue placeholder="Engine" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Any Engine</SelectItem>
              <SelectItem value="godot">Godot</SelectItem>
              <SelectItem value="unity">Unity</SelectItem>
              <SelectItem value="unreal">Unreal Engine</SelectItem>
              <SelectItem value="gamemaker">GameMaker</SelectItem>
              <SelectItem value="pico8">PICO-8</SelectItem>
              <SelectItem value="custom">Custom / Other</SelectItem>
            </SelectContent>
          </Select>

          {/* EXPÉRIENCE (Corrigé avec confirmed et expert !) */}
          <Select onValueChange={onLevelChange} defaultValue="all">
            <SelectTrigger className="w-[190px] rounded-xl border-border/60 bg-card text-card-foreground transition-colors hover:border-lavender/40">
              <SelectValue placeholder="Experience Level" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Any Experience</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="hobbyist">Hobbyist</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>

        </div>
      </div>
    </section>
  )
}