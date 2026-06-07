'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@shared/types'

export function useUserMostOrdered(userId: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchMostOrderedProduct = async () => {
      try {
        // Get all orders for this user with their items
        const { data: orders, error } = await supabase
          .from('orders')
          .select('id, order_items(product_id, products(*))')
          .eq('user_id', userId)

        if (error || !orders) {
          setLoading(false)
          return
        }

        // Count products
        const productCount = new Map<string, { count: number; product: Product }>()

        orders.forEach((order: any) => {
          order.order_items?.forEach((item: any) => {
            const prod = item.products
            if (prod && prod.id) {
              const current = productCount.get(prod.id) || { count: 0, product: prod }
              productCount.set(prod.id, {
                count: current.count + 1,
                product: prod
              })
            }
          })
        })

        // Get the most ordered product
        let mostOrdered: Product | null = null
        let maxCount = 0

        productCount.forEach(({ count, product }) => {
          if (count > maxCount) {
            maxCount = count
            mostOrdered = product
          }
        })

        setProduct(mostOrdered)
      } catch (err) {
        console.error('Error fetching most ordered product:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMostOrderedProduct()
  }, [userId])

  return { product, loading }
}
