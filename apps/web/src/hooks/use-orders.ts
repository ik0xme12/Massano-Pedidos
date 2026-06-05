'use client'

import { useState } from 'react'
import { orderService } from '@/lib/supabase-services'
import { supabase } from '@/lib/supabase'
import type { CartItem } from '@shared/types'

export function useSaveOrder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const saveOrder = async (
    address: string,
    paymentMethod: string,
    items: CartItem[],
    notes?: string
  ) => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) throw new Error('Usuario no autenticado')

      const total = items.reduce((sum, item) => sum + (item.product.price ?? 0) * item.quantity, 0) + 600

      const order = await orderService.create({
        user_id: user.id,
        delivery_address: address,
        payment_method: paymentMethod,
        total,
        notes,
        items: items.map((item) => ({
          product_id: item.product.id!,
          quantity: item.quantity,
          price_at_purchase: item.product.price ?? 0,
        })),
      })

      return order
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save order')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { saveOrder, loading, error }
}
