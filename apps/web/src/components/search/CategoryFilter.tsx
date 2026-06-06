'use client'

import { ChevronDown } from 'lucide-react'

interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="relative w-full max-w-xs">
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground appearance-none cursor-pointer hover:border-gold/50 focus:border-gold focus:ring-1 focus:ring-gold/20 transition-colors outline-none"
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  )
}
