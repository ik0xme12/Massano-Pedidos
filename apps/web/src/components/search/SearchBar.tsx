'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
}

export function SearchBar({ placeholder = 'Buscar productos...', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleChange = (value: string) => {
    setQuery(value)
    onSearch(value)
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-10 py-3 rounded-lg border border-border bg-white outline-none focus:border-gold transition-colors text-sm"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  )
}
