'use client'

import { useEffect, useState } from 'react'
import { productService } from '@/lib/supabase-services'
import type { Product } from '@shared/types'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data = await productService.getAll()
        setProducts(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load products'))
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return { products, loading, error }
}

export function useProductsByCategory(category: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data = await productService.getByCategory(category)
        setProducts(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load products'))
      } finally {
        setLoading(false)
      }
    }

    if (category) {
      fetchProducts()
    }
  }, [category])

  return { products, loading, error }
}
