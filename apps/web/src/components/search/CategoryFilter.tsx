'use client'

import { ChevronDown } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
    <Select
      value={selectedCategory}
      onValueChange={(value: string | null) => {
        if (value) onCategoryChange(value)
      }}
    >
      <SelectTrigger className="w-full max-w-xs border-border bg-card hover:border-gold/50 transition-colors">
        <SelectValue placeholder="Selecciona una categoría" />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {categories.map((cat) => (
          <SelectItem key={cat} value={cat}>
            {cat}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
