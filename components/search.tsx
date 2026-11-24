"use client"

import { Search as SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function Search({ value, onChange, placeholder = "Search by squad, jam name, or description\u2026" }: SearchProps) {
  return (
    <div className="relative flex w-full min-w-0 flex-1 items-center overflow-hidden rounded-lg border border-border bg-transparent focus-within:ring-2 focus-within:ring-ring">
      <SearchIcon className="ml-4 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <label htmlFor="squad-search" className="sr-only">
        Search by squad, jam name, or description
      </label>
      <Input
        id="squad-search"
        name="q"
        type="search"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 border-0 bg-transparent px-4 text-base shadow-none ring-0 placeholder:text-muted-foreground focus-visible:ring-0"
      />
    </div>
  )
}
