"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SlidersHorizontal } from "lucide-react"

export function Filters() {
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
          <Select>
            <SelectTrigger className="w-[160px] rounded-xl border-border/60 bg-card text-card-foreground hover:border-primary/40 transition-colors">
              <SelectValue placeholder="Engine" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="godot">Godot</SelectItem>
              <SelectItem value="unity">Unity</SelectItem>
              <SelectItem value="unreal">Unreal Engine</SelectItem>
              <SelectItem value="gamemaker">GameMaker</SelectItem>
              <SelectItem value="pico8">PICO-8</SelectItem>
              <SelectItem value="custom">Custom / Other</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[180px] rounded-xl border-border/60 bg-card text-card-foreground hover:border-primary/40 transition-colors">
              <SelectValue placeholder="Role Needed" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="developer">Developer</SelectItem>
              <SelectItem value="2d-artist">2D Artist</SelectItem>
              <SelectItem value="3d-artist">3D Artist</SelectItem>
              <SelectItem value="audio">Audio / Music</SelectItem>
              <SelectItem value="writer">Writer / Narrative</SelectItem>
              <SelectItem value="game-design">Game Designer</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[180px] rounded-xl border-border/60 bg-card text-card-foreground hover:border-primary/40 transition-colors">
              <SelectValue placeholder="Experience Level" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="hobbyist">Hobbyist</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="experienced">Experienced</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[160px] rounded-xl border-border/60 bg-card text-card-foreground hover:border-primary/40 transition-colors">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="french">French</SelectItem>
              <SelectItem value="spanish">Spanish</SelectItem>
              <SelectItem value="portuguese">Portuguese</SelectItem>
              <SelectItem value="german">German</SelectItem>
              <SelectItem value="japanese">Japanese</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  )
}
