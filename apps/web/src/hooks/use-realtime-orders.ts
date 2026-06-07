'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Order } from '@shared/types'

export function useOrderSubscription(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    console.log('useOrderSubscription hook running for orderId:', orderId)
    if (!orderId) return

    setLoading(true)
    let hasData = false

    // Try to load from localStorage first (fastest)
    try {
      const stored = localStorage.getItem(`order-${orderId}`)
      if (stored) {
        const storedOrder = JSON.parse(stored)
        setOrder(storedOrder as Order)
        hasData = true
        console.log('Loaded order from localStorage:', storedOrder)
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err)
    }

    // Then try Supabase
    const fetchOrder = async () => {
      try {
        console.log('Fetching order from Supabase:', orderId)
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()

        if (fetchError) {
          console.error('Supabase error:', fetchError)
          if (!hasData) {
            // Demo data when Supabase is not available and no localStorage
            const demoOrder = {
              id: orderId,
              status: 'pending' as const,
              total: 2500,
              user_id: 'demo',
              delivery_address: 'Demo Address',
              payment_method: 'cash',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as Order
            setOrder(demoOrder)
          }
          setLoading(false)
          return
        }
        console.log('Order loaded from Supabase:', data)
        setOrder(data as Order)
      } catch (err) {
        console.error('Catch error:', err)
        if (!hasData) {
          // Demo fallback on error
          const demoOrder = {
            id: orderId,
            status: 'pending' as const,
            total: 2500,
            user_id: 'demo',
            delivery_address: 'Demo Address',
            payment_method: 'cash',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Order
          setOrder(demoOrder)
        }
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

    // Listen for localStorage updates (from kitchen panel)
    const handleOrderUpdate = (e: any) => {
      console.log('Order update event received:', e.detail)
      if (e.detail?.id === orderId) {
        console.log('Updating order from event:', e.detail)
        setOrder(e.detail as Order)
      }
    }
    console.log('Registering order-updated listener for order:', orderId)
    window.addEventListener('order-updated', handleOrderUpdate)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('order-updated', handleOrderUpdate)
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
