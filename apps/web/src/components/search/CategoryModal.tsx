'use client'

import { X } from 'lucide-react'

interface CategoryModalProps {
  isOpen: boolean
  categories: string[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
  onClose: () => void
}

export function CategoryModal({
  isOpen,
  categories,
  selectedCategory,
  onSelectCategory,
  onClose,
}: CategoryModalProps) {
  if (!isOpen) return null

  const handleSelectCategory = (category: string) => {
    onSelectCategory(category)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-5 backdrop-blur-sm">
      <div className="bg-card rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Categorías</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Grid de Categorías */}
        <div className="p-5 grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleSelectCategory(cat)}
              className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-black text-white shadow-md'
                  : 'bg-muted text-foreground hover:bg-muted/80 border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
