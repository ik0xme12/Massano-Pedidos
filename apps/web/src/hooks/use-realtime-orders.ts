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
    let localStorageData: Order | null = null

    // Try to load from localStorage first (fastest and most recent)
    try {
      const stored = localStorage.getItem(`order-${orderId}`)
      if (stored) {
        localStorageData = JSON.parse(stored) as Order
        setOrder(localStorageData)
        console.log('Loaded order from localStorage:', localStorageData)
        setLoading(false)
        // Don't fetch from Supabase if we have fresh data from kitchen panel
        // Just set up listener and return
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err)
    }

    // Only fetch from Supabase if no localStorage data
    const fetchOrder = async () => {
      if (localStorageData) {
        console.log('Using localStorage data, skipping Supabase fetch')
        return
      }

      try {
        console.log('Fetching order from Supabase:', orderId)
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()

        if (fetchError) {
          console.error('Supabase error:', fetchError)
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
          setLoading(false)
          return
        }
        console.log('Order loaded from Supabase:', data)
        setOrder(data as Order)
      } catch (err) {
        console.error('Catch error:', err)
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
    const handleStorageChange = (e: StorageEvent) => {
      console.log('Storage change detected:', e.key)
      if (e.key === `order-${orderId}` && e.newValue) {
        try {
          const updatedOrder = JSON.parse(e.newValue)
          console.log('Updating order from storage event:', updatedOrder)
          setOrder(updatedOrder as Order)
        } catch (err) {
          console.error('Error parsing storage update:', err)
        }
      }
    }
    console.log('Registering storage listener for order:', orderId)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('storage', handleStorageChange)
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
