'use client'

import { ChevronDown } from 'lucide-react'

interface FilterBarProps {
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'newest'
  onSortChange: (sort: 'name' | 'price-asc' | 'price-desc' | 'newest') => void
}

const SORT_OPTIONS = [
  { value: 'newest' as const, label: 'Más nuevos' },
  { value: 'name' as const, label: 'Nombre (A-Z)' },
  { value: 'price-asc' as const, label: 'Precio (menor)' },
  { value: 'price-desc' as const, label: 'Precio (mayor)' },
]

export function FilterBar({ sortBy, onSortChange }: FilterBarProps) {
  return (
    <div className="relative inline-block">
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as any)}
        className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-border bg-white outline-none focus:border-gold transition-colors text-sm cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  )
}
