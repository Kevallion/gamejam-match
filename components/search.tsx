"use client"

import { Search as SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function Search({ value, onChange, placeholder = "Search by team, jam name, or description..." }: SearchProps) {
  return (
    <div className="relative flex w-full min-w-0 flex-1 items-center overflow-hidden rounded-lg border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_var(--neo-shadow)]">
      <SearchIcon className="ml-4 size-5 shrink-0 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 border-0 bg-transparent px-4 text-base shadow-none ring-0 placeholder:text-muted-foreground focus-visible:ring-0"
      />
    </div>
  )
}
