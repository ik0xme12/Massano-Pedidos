import type { Product } from '@shared/types'

export const productSearch = {
  search(products: Product[], query: string): Product[] {
    if (!query.trim()) return products

    const q = query.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    )
  },

  filterByCategory(products: Product[], category: string): Product[] {
    if (category === 'Todo') return products
    return products.filter((p) => p.category === category)
  },

  sort(
    products: Product[],
    sortBy: 'name' | 'price-asc' | 'price-desc' | 'newest'
  ): Product[] {
    const sorted = [...products]

    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price)
      case 'newest':
        return sorted.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
        )
      default:
        return sorted
    }
  },

  filterAndSort(
    products: Product[],
    options: {
      query?: string
      category?: string
      sortBy?: 'name' | 'price-asc' | 'price-desc' | 'newest'
    }
  ): Product[] {
    let result = products

    if (options.query) {
      result = this.search(result, options.query)
    }

    if (options.category) {
      result = this.filterByCategory(result, options.category)
    }

    if (options.sortBy) {
      result = this.sort(result, options.sortBy)
    }

    return result
  },
}
