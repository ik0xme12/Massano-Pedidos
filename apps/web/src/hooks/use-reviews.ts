'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Review } from '@shared/types'

export function useLeaveReview() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const submitReview = async (
    orderId: string,
    userId: string,
    rating: number,
    comment?: string
  ) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: submitError } = await supabase
        .from('reviews')
        .insert({
          order_id: orderId,
          user_id: userId,
          rating,
          comment,
        })
        .select()
        .single()

      if (submitError) throw submitError
      return data as Review
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to submit review')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { submitReview, loading, error }
}

export function useOrderReviews(orderId: string) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .eq('order_id', orderId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setReviews((data as Review[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load reviews'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      fetchReviews()
    }
  }, [orderId])

  return { reviews, loading, error, refetch: fetchReviews }
}
