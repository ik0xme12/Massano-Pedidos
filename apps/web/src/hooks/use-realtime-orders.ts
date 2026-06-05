'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Order } from '@shared/types'

export function useOrderSubscription(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!orderId) return

    const fetchOrder = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()

        if (fetchError) throw fetchError
        setOrder(data as Order)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load order'))
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`order:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.new) {
            setOrder(payload.new as Order)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [orderId])

  return { order, loading, error }
}

export function useUserOrdersSubscription(userId: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchOrders = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        setOrders((data as Order[]) || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load orders'))
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()

    // Subscribe to user's orders
    const subscription = supabase
      .channel(`user:${userId}:orders`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders((prev) => [payload.new as Order, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((o) => (o.id === (payload.new as Order).id ? (payload.new as Order) : o))
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  return { orders, loading, error }
}

export function useAllOrdersSubscription() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        setOrders((data as Order[]) || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load orders'))
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()

    // Subscribe to all orders (for restaurant)
    const subscription = supabase
      .channel('all:orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders((prev) => [payload.new as Order, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((o) => (o.id === (payload.new as Order).id ? (payload.new as Order) : o))
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { orders, loading, error }
}
